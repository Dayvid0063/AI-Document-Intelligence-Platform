from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException
from jose import jwt, JWTError
from app.core.config import settings

def get_user_id(request: Request) -> str:
    """
    Extract user ID from JWT token for rate limiting.
    Falls back to IP address if token is missing or invalid.
    """
    # Try to get user from Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id is not None:
                return f"user:{user_id}"
        except JWTError:
            pass
        except Exception:
            pass

    # Fallback to IP address
    return f"ip:{get_remote_address(request)}"

def get_ip_address(request: Request) -> str:
    """Get client IP address for rate limiting."""
    return get_remote_address(request)

# Initialize limiter with Redis backend
limiter = Limiter(
    key_func=get_user_id,  # Default to user-based, but we'll override per endpoint
    storage_uri=settings.REDIS_URL,
    strategy="fixed-window",
    enabled=True,
)

# Custom exception handler for rate limit exceeded
async def custom_rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """Return a custom JSON response when rate limit is exceeded."""
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=429,
        content={
            "error": "Rate limit exceeded",
            "message": f"Too many requests. Please try again later.",
            "limit": f"{exc.detail}",
        }
    )