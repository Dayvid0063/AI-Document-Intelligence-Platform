from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
)
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.api.deps import get_current_active_user
from app.core.limiter import limiter, get_ip_address

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/hour", key_func=get_ip_address)  # 5 per hour per IP
def register(
    request: Request,
    payload: UserCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new user account.

    Flow:
    1. Check email isn't already registered.
    2. Hash the password (never store plain text).
    3. Save the user to the database.
    4. Issue access + refresh tokens immediately (auto-login after signup).
    """
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists",
        )

    new_user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(subject=str(new_user.id))
    refresh_token = create_refresh_token(subject=str(new_user.id))

    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=Token)
@limiter.limit("10/hour", key_func=get_ip_address)  # 10 per hour per IP
def login(
    request: Request,
    payload: UserLogin,
    db: Session = Depends(get_db),
):
    """
    Authenticate a user and return JWT tokens.

    Flow:
    1. Look up user by email.
    2. Verify password against stored hash.
    3. Issue access + refresh tokens.
    """
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

    access_token = create_access_token(subject=str(user.id))
    refresh_token = create_refresh_token(subject=str(user.id))

    return Token(access_token=access_token, refresh_token=refresh_token)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_active_user)):
    """
    Return the currently authenticated user's profile.
    Requires a valid access token in the Authorization header:
        Authorization: Bearer <access_token>
    """
    return current_user