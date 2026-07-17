from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.schemas.audit_log import AuditLogResponse, AuditLogListResponse
from app.services.audit_service import get_user_audit_logs

router = APIRouter(prefix="/audit", tags=["Audit"])


@router.get("/", response_model=AuditLogListResponse)
def list_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Return the current user's audit log entries, newest first."""
    logs = get_user_audit_logs(str(current_user.id), db, limit=limit, offset=offset)
    return AuditLogListResponse(
        total=len(logs),
        logs=[AuditLogResponse.model_validate(log) for log in logs],
    )
