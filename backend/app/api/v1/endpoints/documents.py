from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.schemas.document import DocumentResponse, DocumentListResponse
from app.services.document_service import (
    save_upload,
    get_user_documents,
    get_document_by_id,
    delete_document,
    update_document_text,
)
from app.services.ocr_service import extract_text

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload", response_model=DocumentResponse, status_code=201)
def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Upload a document (PDF, PNG, JPEG, TIFF).
    Returns the document metadata record immediately.
    OCR and AI processing will happen asynchronously (Phase 2).
    """
    return save_upload(file, current_user, db)


@router.get("/", response_model=DocumentListResponse)
def list_documents(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Return all documents uploaded by the current user."""
    documents = get_user_documents(current_user, db)
    return DocumentListResponse(total=len(documents), documents=documents)


@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(
    doc_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Return a single document by ID."""
    return get_document_by_id(doc_id, current_user, db)


@router.post("/{doc_id}/process", response_model=DocumentResponse)
def process_document(
    doc_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Trigger OCR text extraction on an uploaded document.
    """
    document = get_document_by_id(doc_id, current_user, db)
    extracted_text = extract_text(document.file_path, document.mime_type)
    return update_document_text(doc_id, extracted_text, db)


@router.delete("/{doc_id}", status_code=204)
def remove_document(
    doc_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Delete a document and its file from disk."""
    delete_document(doc_id, current_user, db)