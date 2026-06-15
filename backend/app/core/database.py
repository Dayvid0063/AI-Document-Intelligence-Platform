from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

# The "engine" manages the actual connection pool to PostgreSQL
engine = create_engine(settings.DATABASE_URL)

# Each instance of SessionLocal will be a new database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class that all ORM models (tables) will inherit from
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that provides a database session per-request.

    Usage in an endpoint:
        def my_endpoint(db: Session = Depends(get_db)):
            ...

    The session is automatically closed after the request finishes,
    even if an error occurs.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()