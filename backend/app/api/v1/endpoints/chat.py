from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.services.rag_service import chat_with_document, chat_with_all_documents
from app.core.limiter import limiter

router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatRequest(BaseModel):
    question: str
    doc_id: Optional[str] = None  # If None, searches across all documents


class ChatSource(BaseModel):
    id: str
    filename: str
    document_type: Optional[str] = None


class ChatResponse(BaseModel):
    question: str
    answer: str
    sources: list[ChatSource] = []


@router.post("/", response_model=ChatResponse)
@limiter.limit("50/hour")  # 50 per hour per user
def chat(
    request: Request,
    payload: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Ask a question about your documents.

    Two modes:
    - If doc_id is provided: answers questions about that specific document
    - If doc_id is omitted: searches across ALL your documents to find
      the answer (uses semantic search to find relevant docs first)

    Examples:
    - "What is the total amount on this invoice?"
    - "Which invoices are overdue?"
    - "Summarize the key obligations in this contract"
    - "What are the candidate's main skills?"
    """
    if payload.doc_id:
        # Single document Q&A
        answer = chat_with_document(
            question=payload.question,
            doc_id=payload.doc_id,
            current_user=current_user,
            db=db,
        )
        return ChatResponse(question=payload.question, answer=answer)
    else:
        # Multi-document search + answer
        result = chat_with_all_documents(
            question=payload.question,
            current_user=current_user,
            db=db,
        )
        return ChatResponse(
            question=payload.question,
            answer=result["answer"],
            sources=[ChatSource(**s) for s in result["sources"]],
        )