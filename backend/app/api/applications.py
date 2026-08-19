from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.models.models import User, Application, Activity, AppStatus, Priority, WorkMode
from app.schemas.schemas import (
    ApplicationCreate, ApplicationUpdate, ApplicationResponse, PaginatedApplications, ActivityResponse
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.get("", response_model=PaginatedApplications)
def list_applications(
    status: Optional[AppStatus] = None,
    priority: Optional[Priority] = None,
    work_mode: Optional[WorkMode] = None,
    source: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = Query("application_date", pattern="^(application_date|company|job_title|priority|updated_at)$"),
    order: str = Query("desc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Application).filter(Application.user_id == current_user.id)

    if status:
        query = query.filter(Application.status == status)
    if priority:
        query = query.filter(Application.priority == priority)
    if work_mode:
        query = query.filter(Application.work_mode == work_mode)
    if source:
        query = query.filter(Application.source == source)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (Application.company.ilike(s)) |
            (Application.job_title.ilike(s)) |
            (Application.location.ilike(s))
        )

    total = query.count()

    # Sorting
    column = getattr(Application, sort_by, Application.application_date)
    if order == "desc":
        query = query.order_by(column.desc())
    else:
        query = query.order_by(column.asc())

    items = query.offset((page - 1) * limit).limit(limit).all()
    return {"total": total, "page": page, "limit": limit, "items": items}

@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    app_in: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app = Application(**app_in.model_dump(), user_id=current_user.id)
    db.add(app)
    db.commit()
    db.refresh(app)

    # Activity log
    activity = Activity(
        application_id=app.id,
        activity_type="CREATED",
        description=f"Application created for {app.job_title} at {app.company}"
    )
    db.add(activity)
    db.commit()

    return app

@router.get("/{app_id}", response_model=ApplicationResponse)
def get_application(
    app_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app = db.query(Application).filter(Application.id == app_id, Application.user_id == current_user.id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app

@router.patch("/{app_id}", response_model=ApplicationResponse)
def update_application(
    app_id: str,
    app_in: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app = db.query(Application).filter(Application.id == app_id, Application.user_id == current_user.id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    old_status = app.status
    update_data = app_in.model_dump(exclude_unset=True)

    for field, val in update_data.items():
        setattr(app, field, val)

    db.commit()
    db.refresh(app)

    # Log status change activity if status changed
    if "status" in update_data and update_data["status"] != old_status:
        activity = Activity(
            application_id=app.id,
            activity_type="STATUS_CHANGED",
            description=f"Status changed: {old_status.value} → {app.status.value}"
        )
        db.add(activity)
        db.commit()

    return app

@router.delete("/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    app_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app = db.query(Application).filter(Application.id == app_id, Application.user_id == current_user.id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(app)
    db.commit()
    return None

@router.get("/{app_id}/activities", response_model=list[ActivityResponse])
def list_activities(
    app_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app = db.query(Application).filter(Application.id == app_id, Application.user_id == current_user.id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return db.query(Activity).filter(Activity.application_id == app_id).order_by(Activity.created_at.desc()).all()
