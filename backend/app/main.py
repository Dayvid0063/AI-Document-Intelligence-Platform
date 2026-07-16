from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.router import api_router
from app.core.limiter import limiter, custom_rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router)

# Set up rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, custom_rate_limit_exceeded_handler)


@app.get("/")
def root():
    """Basic health-check endpoint."""
    return {"status": "ok", "app": settings.APP_NAME, "environment": settings.ENVIRONMENT}


@app.get("/health")
def health():
    return {"status": "healthy"}