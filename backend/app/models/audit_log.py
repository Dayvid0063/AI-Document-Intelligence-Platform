import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.core.database import Base


class AuditLog(Base):
    """
    The `audit_logs` table.

    Each row = one recorded user action (upload, login, delete, export, etc.).
    user_id is nullable because failed logins are logged before a user
    can be confirmed.
    """

    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)

    action = Column(String, nullable=False, index=True)
    resource_id = Column(String, nullable=True)
    extra_data = Column("extra_data", JSONB, nullable=True)
    ip_address = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, index=True)
