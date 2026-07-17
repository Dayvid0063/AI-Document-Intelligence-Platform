from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.schemas.usage_log import UsageSummaryResponse
from app.services.usage_service import get_usage_summary

router = APIRouter(prefix="/usage", tags=["Usage"])


@router.get("/", response_model=UsageSummaryResponse)
def usage_summary(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Return the current user's AI usage summary and estimated cost."""
    summary = get_usage_summary(str(current_user.id), db)
    return UsageSummaryResponse(**summary)
