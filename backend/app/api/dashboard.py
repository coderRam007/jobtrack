from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from app.core.database import get_db
from app.models.models import User, Application, Interview, AppStatus
from app.schemas.schemas import DashboardSummaryResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    apps = db.query(Application).filter(Application.user_id == current_user.id).all()
    total = len(apps)

    now = datetime.now(timezone.utc)
    one_week_ago = now - timedelta(days=7)
    one_month_ago = now - timedelta(days=30)

    this_week = sum(1 for a in apps if a.created_at and a.created_at >= one_week_ago)
    this_month = sum(1 for a in apps if a.created_at and a.created_at >= one_month_ago)

    active_statuses = {AppStatus.SAVED, AppStatus.APPLIED, AppStatus.SCREENING, AppStatus.INTERVIEW}
    active = sum(1 for a in apps if a.status in active_statuses)

    offers = sum(1 for a in apps if a.status == AppStatus.OFFER)
    rejections = sum(1 for a in apps if a.status == AppStatus.REJECTED)

    # Interviews count
    user_app_ids = [a.id for a in apps]
    interviews_count = db.query(Interview).filter(Interview.application_id.in_(user_app_ids)).count() if user_app_ids else 0

    responses = sum(1 for a in apps if a.status in {AppStatus.SCREENING, AppStatus.INTERVIEW, AppStatus.OFFER, AppStatus.REJECTED})

    response_rate = round((responses / total * 100), 1) if total > 0 else 0.0
    interview_rate = round((interviews_count / total * 100), 1) if total > 0 else 0.0

    return {
        "total": total,
        "this_week": this_week,
        "this_month": this_month,
        "active": active,
        "interviews": interviews_count,
        "offers": offers,
        "rejections": rejections,
        "response_rate": response_rate,
        "interview_rate": interview_rate,
    }
