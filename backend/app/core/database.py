from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

# Railway injects DATABASE_URL with postgresql:// scheme
# but psycopg3 requires postgresql+psycopg://
# This ensures the correct dialect is always used
database_url = settings.DATABASE_URL
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)

engine = create_engine(database_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    FastAPI dependency that provides a database session per-request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()