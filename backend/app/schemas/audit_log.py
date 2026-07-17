import uuid
from datetime import datetime
from typing import Optional, Any

from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    """What the API returns for a single audit log entry."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    action: str
    resource_id: Optional[str] = None
    extra_data: Optional[dict[str, Any]] = None
    ip_address: Optional[str] = None
    created_at: datetime


class AuditLogListResponse(BaseModel):
    """Paginated list of audit logs."""
    total: int
    logs: list[AuditLogResponse]
