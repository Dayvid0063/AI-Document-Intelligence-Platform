import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class UsageLogResponse(BaseModel):
    """What the API returns for a single usage log entry."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    operation: str
    model: str
    input_tokens: int
    output_tokens: Optional[int] = None
    cost_usd: float
    document_id: Optional[uuid.UUID] = None
    created_at: datetime


class UsageBreakdownEntry(BaseModel):
    calls: int
    cost_usd: float


class UsageSummaryResponse(BaseModel):
    """Aggregated usage stats for a user."""
    total_calls: int
    total_input_tokens: int
    total_output_tokens: int
    total_cost_usd: float
    breakdown: dict[str, UsageBreakdownEntry]
    recent_logs: list[UsageLogResponse]
