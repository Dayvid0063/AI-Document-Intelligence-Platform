import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector

from app.core.database import Base

# Dimensions for OpenAI text-embedding-3-small
EMBEDDING_DIMENSIONS = 1536


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)

    original_filename = Column(String, nullable=False)
    stored_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String, nullable=False)

    status = Column(String, default="pending")

    extracted_text = Column(Text, nullable=True)
    document_type = Column(String, nullable=True)
    summary = Column(Text, nullable=True)
    extracted_fields = Column(JSONB, nullable=True)

    # Vector embedding for semantic search (1536 dimensions — OpenAI text-embedding-3-small)
    embedding = Column(Vector(EMBEDDING_DIMENSIONS), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", backref="documents")