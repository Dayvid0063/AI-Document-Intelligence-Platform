from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.schemas.document import DocumentResponse
from app.services.rag_service import semantic_search
from app.core.limiter import limiter

router = APIRouter(prefix="/search", tags=["Search"])


class SearchRequest(BaseModel):
    query: str


class SearchResponse(BaseModel):
    query: str
    results: list[DocumentResponse]
    total: int


@router.post("/", response_model=SearchResponse)
@limiter.limit("100/hour")  # 100 per hour per user
def search_documents(
    request: Request,
    payload: SearchRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Semantic search across the user's documents.

    Converts the query to a vector embedding and finds documents
    with the closest semantic meaning — not just keyword matches.

    Example: searching "payment owed" will find invoices even if
    they don't contain those exact words.
    """
    results = semantic_search(
        query=payload.query,
        current_user=current_user,
        db=db,
        limit=10,
    )

    return SearchResponse(
        query=payload.query,
        results=results,
        total=len(results),
    )