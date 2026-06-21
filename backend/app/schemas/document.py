import uuid
from datetime import datetime
from typing import Optional, Any

from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    """
    What the API returns when a document is uploaded or listed.
    Never exposes the internal file_path for security.
    """
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    original_filename: str
    file_size: int
    mime_type: str
    status: str
    document_type: Optional[str] = None
    summary: Optional[str] = None
    extracted_text: Optional[str] = None
    extracted_fields: Optional[dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime


class DocumentListResponse(BaseModel):
    """Paginated list of documents."""
    total: int
    documents: list[DocumentResponse]