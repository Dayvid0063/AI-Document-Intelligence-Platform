from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def log_action(
    db: Session,
    action: str,
    user_id: str | None = None,
    resource_id: str | None = None,
    extra_data: dict | None = None,
    ip_address: str | None = None,
) -> None:
    """
    Write an audit log entry.
    Silently fails — never raise exceptions from logging.
    Audit logs should never break the main request flow.
    """
    try:
        entry = AuditLog(
            user_id=user_id,
            action=action,
            resource_id=resource_id,
            extra_data=extra_data,
            ip_address=ip_address,
        )
        db.add(entry)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[AUDIT LOG ERROR]: {e}")


def get_user_audit_logs(
    user_id: str,
    db: Session,
    limit: int = 50,
    offset: int = 0,
) -> list[AuditLog]:
    """Return a user's audit logs, newest first."""
    return (
        db.query(AuditLog)
        .filter(AuditLog.user_id == user_id)
        .order_by(AuditLog.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
