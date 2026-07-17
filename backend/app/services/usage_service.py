from sqlalchemy.orm import Session

from app.models.usage_log import UsageLog

# AI pricing reference (USD per token), stored as constants so they can be
# updated without a migration.
PRICING = {
    "deepseek-v4-flash": {
        "input": 0.14 / 1_000_000,
        "output": 0.28 / 1_000_000,
    },
    "text-embedding-3-small": {
        "input": 0.02 / 1_000_000,
        "output": 0.0,
    },
}


def calculate_cost(model: str, input_tokens: int, output_tokens: int = 0) -> float:
    """Calculate the USD cost of an API call based on the pricing table."""
    pricing = PRICING.get(model)
    if pricing is None:
        return 0.0
    return (input_tokens * pricing["input"]) + (output_tokens * pricing["output"])


def log_usage(
    db: Session,
    user_id: str,
    operation: str,
    model: str,
    input_tokens: int,
    output_tokens: int = 0,
    document_id: str | None = None,
) -> None:
    """
    Calculate cost and write a usage log entry.
    Silently fails — never raise exceptions from usage logging.
    """
    try:
        cost_usd = calculate_cost(model, input_tokens, output_tokens)
        entry = UsageLog(
            user_id=user_id,
            operation=operation,
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost_usd=cost_usd,
            document_id=document_id,
        )
        db.add(entry)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[USAGE LOG ERROR]: {e}")


def get_usage_summary(user_id: str, db: Session) -> dict:
    """
    Return aggregated usage stats for a user:
    - total_calls: int
    - total_input_tokens: int
    - total_output_tokens: int
    - total_cost_usd: float
    - breakdown: per operation type
    - recent_logs: last 20 entries
    """
    logs = db.query(UsageLog).filter(UsageLog.user_id == user_id).all()

    total_calls = len(logs)
    total_input_tokens = sum(log.input_tokens or 0 for log in logs)
    total_output_tokens = sum(log.output_tokens or 0 for log in logs)
    total_cost_usd = sum(log.cost_usd or 0.0 for log in logs)

    breakdown: dict[str, dict] = {}
    for log in logs:
        entry = breakdown.setdefault(log.operation, {"calls": 0, "cost_usd": 0.0})
        entry["calls"] += 1
        entry["cost_usd"] += log.cost_usd or 0.0

    recent_logs = (
        db.query(UsageLog)
        .filter(UsageLog.user_id == user_id)
        .order_by(UsageLog.created_at.desc())
        .limit(20)
        .all()
    )

    return {
        "total_calls": total_calls,
        "total_input_tokens": total_input_tokens,
        "total_output_tokens": total_output_tokens,
        "total_cost_usd": total_cost_usd,
        "breakdown": breakdown,
        "recent_logs": recent_logs,
    }
