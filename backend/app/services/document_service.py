import uuid
import os
import shutil
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.user import User

# Where uploaded files are stored on disk
# This path is relative to where you run uvicorn (the backend/ folder)
UPLOAD_DIR = "uploads"

# Allowed file types
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/tiff",
}

# Max file size: 10MB
MAX_FILE_SIZE = 10 * 1024 * 1024


def save_upload(file: UploadFile, current_user: User, db: Session) -> Document:
    """
    Validates, saves the file to disk, and creates a DB record.

    Steps:
    1. Validate mime type
    2. Read file into memory and check size
    3. Generate a unique filename to avoid collisions
    4. Save to /uploads/ directory
    5. Create and return a Document DB record
    """

    # 1. Validate mime type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{file.content_type}' is not supported. "
                   f"Allowed types: PDF, PNG, JPEG, TIFF.",
        )

    # 2. Read file contents and check size
    contents = file.file.read()
    file_size = len(contents)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds the 10MB limit.",
        )

    if file_size == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # 3. Generate a unique stored filename (UUID + original extension)
    ext = os.path.splitext(file.filename or "")[-1].lower()
    stored_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, stored_filename)

    # 4. Ensure the uploads directory exists and save the file
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    with open(file_path, "wb") as f:
        f.write(contents)

    # 5. Create DB record
    document = Document(
        user_id=current_user.id,
        original_filename=file.filename or stored_filename,
        stored_filename=stored_filename,
        file_path=file_path,
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
    """
    Fetch a single document by ID.
    Raises 404 if not found, 403 if it belongs to another user.
    """
    document = db.query(Document).filter(Document.id == doc_id).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")

    if document.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")

    return document


def delete_document(doc_id: str, current_user: User, db: Session) -> None:
    """Delete a document record and its file from disk."""
    document = get_document_by_id(doc_id, current_user, db)

    # Remove file from disk
    if os.path.exists(document.file_path):
        os.remove(document.file_path)

    db.delete(document)
    db.commit()