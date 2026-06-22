import uuid
from datetime import datetime
from typing import Optional, Any

from pydantic import BaseModel, ConfigDict, computed_field
from app.models.document import Document


class DocumentResponse(BaseModel):
    """
    What the API returns when a document is uploaded or listed.
    Never exposes the raw embedding vector — just whether one exists.
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
    is_embedded: bool = False
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_orm_with_embedding(cls, doc: Document) -> "DocumentResponse":
        return cls(
            id=doc.id,
            original_filename=doc.original_filename,
            file_size=doc.file_size,
            mime_type=doc.mime_type,
            status=doc.status,
            document_type=doc.document_type,
            summary=doc.summary,
            extracted_text=doc.extracted_text,
            extracted_fields=doc.extracted_fields,
            is_embedded=doc.embedding is not None,
            created_at=doc.created_at,
            updated_at=doc.updated_at,
        )


class DocumentListResponse(BaseModel):
    """Paginated list of documents."""
    total: int
    documents: list[DocumentResponse]