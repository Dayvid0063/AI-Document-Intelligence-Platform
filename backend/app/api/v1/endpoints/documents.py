from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
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
    update_document_ai_results,
    update_document_embedding,
)
from app.services.ocr_service import extract_text
from app.services.ai_service import analyze_document
from app.services.embedding_service import generate_embedding

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload", response_model=DocumentResponse, status_code=201)
def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Upload a document (PDF, PNG, JPEG, TIFF)."""
    doc = save_upload(file, current_user, db)
    return DocumentResponse.from_orm_with_embedding(doc)


@router.get("/", response_model=DocumentListResponse)
def list_documents(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Return all documents uploaded by the current user."""
    documents = get_user_documents(current_user, db)
    return DocumentListResponse(
        total=len(documents),
        documents=[DocumentResponse.from_orm_with_embedding(d) for d in documents],
    )


@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(
    doc_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Return a single document by ID."""
    doc = get_document_by_id(doc_id, current_user, db)
    return DocumentResponse.from_orm_with_embedding(doc)


@router.post("/{doc_id}/process", response_model=DocumentResponse)
def process_document(
    doc_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Trigger OCR text extraction on an uploaded document."""
    document = get_document_by_id(doc_id, current_user, db)
    extracted = extract_text(document.file_path, document.mime_type)
    doc = update_document_text(doc_id, extracted, db)
    return DocumentResponse.from_orm_with_embedding(doc)


@router.post("/{doc_id}/analyze", response_model=DocumentResponse)
def analyze_document_endpoint(
    doc_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Run AI analysis — classification, summarization, structured extraction."""
    document = get_document_by_id(doc_id, current_user, db)

    if not document.extracted_text:
        raise HTTPException(
            status_code=400,
            detail="Document has no extracted text. Run OCR first.",
        )

    result = analyze_document(document.extracted_text)
    doc = update_document_ai_results(
        doc_id=doc_id,
        document_type=result["document_type"],
        summary=result["summary"],
        extracted_fields=result["extracted_fields"],
        db=db,
    )
    return DocumentResponse.from_orm_with_embedding(doc)


@router.post("/{doc_id}/embed", response_model=DocumentResponse)
def embed_document(
    doc_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Generate and store a vector embedding for semantic search."""
    document = get_document_by_id(doc_id, current_user, db)

    if not document.extracted_text:
        raise HTTPException(
            status_code=400,
            detail="Document has no extracted text. Run OCR first.",
        )

    embedding = generate_embedding(document.extracted_text)

    if embedding is None:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate embedding. Please try again.",
        )

    doc = update_document_embedding(doc_id, embedding, db)
    return DocumentResponse.from_orm_with_embedding(doc)


@router.delete("/{doc_id}", status_code=204)
def remove_document(
    doc_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Delete a document and its file from disk."""
    delete_document(doc_id, current_user, db)