import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Document(Base):
    """
    The `documents` table.

    Stores metadata about every uploaded file.
    The actual file bytes live on the filesystem under /uploads/.
    """

    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Who uploaded this document
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)

    # File info
    original_filename = Column(String, nullable=False)       # e.g. "invoice_jan.pdf"
    stored_filename = Column(String, nullable=False)          # e.g. "abc123-uuid.pdf" (unique)
    file_path = Column(String, nullable=False)                # e.g. "uploads/abc123-uuid.pdf"
    file_size = Column(Integer, nullable=False)               # in bytes
    mime_type = Column(String, nullable=False)                # e.g. "application/pdf"

    # Processing status — will be updated as OCR/AI runs
    status = Column(String, default="pending")
    # pending → processing → completed → failed

    # AI/OCR outputs — populated after processing
    extracted_text = Column(Text, nullable=True)             # raw OCR text
    document_type = Column(String, nullable=True)            # e.g. "invoice", "contract"
    summary = Column(Text, nullable=True)                    # AI-generated summary

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship back to the User model
    owner = relationship("User", backref="documents")