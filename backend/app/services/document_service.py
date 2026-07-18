from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.user import User
from app.services.storage_service import upload_file, delete_file

# Max file size: 10MB
MAX_FILE_SIZE = 10 * 1024 * 1024

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/tiff",
}


def save_upload(file: UploadFile, current_user: User, db: Session) -> Document:
    """
    Validates the file, uploads it to Cloudflare R2,
    and creates a DB record with the R2 object key as file_path.
    """
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{file.content_type}' is not supported. "
                   f"Allowed types: PDF, PNG, JPEG, TIFF.",
        )

    contents = file.file.read()
    file_size = len(contents)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds the 10MB limit.")

    if file_size == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Upload to R2 — returns (stored_filename, object_key)
    stored_filename, object_key = upload_file(
        file_bytes=contents,
        original_filename=file.filename or "upload",
        mime_type=file.content_type,
    )

    # Store R2 object key as file_path (not a local disk path anymore)
    document = Document(
        user_id=current_user.id,
        original_filename=file.filename or stored_filename,
        stored_filename=stored_filename,
        file_path=object_key,   # e.g. "documents/abc123.pdf"
        file_size=file_size,
        mime_type=file.content_type,
        status="pending",
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    return document


def get_user_documents(current_user: User, db: Session) -> list[Document]:
    """Fetch all documents belonging to the current user, newest first."""
    return (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
        .all()
    )


def get_document_by_id(doc_id: str, current_user: User, db: Session) -> Document:
    """Fetch a single document by ID, validating ownership."""
    document = db.query(Document).filter(Document.id == doc_id).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")

    if document.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")

    return document


def update_document_text(doc_id: str, extracted_text: str, db: Session) -> Document:
    """
    Save extracted OCR text.

    Only sets status to "failed" when OCR produced nothing — it does NOT
    mark the document "completed" on success, since OCR may just be one
    step of a larger pipeline (AI analysis + embedding) still in progress.
    Callers that only run OCR in isolation (the manual /process endpoint)
    are responsible for setting status = "completed" themselves.
    """
    document = db.query(Document).filter(Document.id == doc_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")

    document.extracted_text = extracted_text
    if not extracted_text:
        document.status = "failed"
    db.commit()
    db.refresh(document)
    return document


def set_document_status(doc_id: str, status: str, db: Session) -> Document:
    """Explicitly set a document's status."""
    document = db.query(Document).filter(Document.id == doc_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")

    document.status = status
    db.commit()
    db.refresh(document)
    return document


def update_document_ai_results(
    doc_id: str,
    document_type: str,
    summary: str,
    extracted_fields: dict,
    db: Session,
) -> Document:
    """Save AI analysis results to the document record."""
    document = db.query(Document).filter(Document.id == doc_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")

    document.document_type = document_type
    document.summary = summary
    document.extracted_fields = extracted_fields
    db.commit()
    db.refresh(document)
    return document


def update_document_embedding(
    doc_id: str,
    embedding: list[float],
    db: Session,
) -> Document:
    """Save the vector embedding for a document."""
    document = db.query(Document).filter(Document.id == doc_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")

    document.embedding = embedding
    db.commit()
    db.refresh(document)
    return document


def delete_document(doc_id: str, current_user: User, db: Session) -> None:
    """Delete a document record and its file from R2."""
    document = get_document_by_id(doc_id, current_user, db)

    # Delete from R2 using the stored object key
    delete_file(document.file_path)

    db.delete(document)
    db.commit()