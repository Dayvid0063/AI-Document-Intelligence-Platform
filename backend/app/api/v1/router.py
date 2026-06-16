from fastapi import APIRouter

from app.api.v1.endpoints import auth, documents

# This is the single router that combines all v1 feature routers.
# As we add more features (documents, chat, etc.), include them here.
api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(documents.router)