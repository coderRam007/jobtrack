from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, Application, Interview, Activity
from app.schemas.schemas import InterviewCreate, InterviewUpdate, InterviewResponse
from app.api.deps import get_current_user

router = APIRouter(tags=["Interviews"])

@router.get("/applications/{app_id}/interviews", response_model=list[InterviewResponse])
def list_interviews(
    app_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app = db.query(Application).filter(Application.id == app_id, Application.user_id == current_user.id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    interviews = db.query(Interview).filter(Interview.application_id == app_id).order_by(Interview.round.asc()).all()
    for iv in interviews:
        iv.company = app.company
        iv.job_title = app.job_title
    return interviews

@router.post("/applications/{app_id}/interviews", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
def create_interview(
    app_id: str,
    iv_in: InterviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app = db.query(Application).filter(Application.id == app_id, Application.user_id == current_user.id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    iv = Interview(**iv_in.model_dump(), application_id=app_id)
    db.add(iv)
    db.commit()
    db.refresh(iv)

    # Activity log
    activity = Activity(
        application_id=app_id,
        activity_type="INTERVIEW_SCHEDULED",
        description=f"Round {iv.round} ({iv.type.value}) scheduled for {iv.scheduled_at}"
    )
    db.add(activity)
    db.commit()

    iv.company = app.company
    iv.job_title = app.job_title
    return iv

@router.patch("/interviews/{iv_id}", response_model=InterviewResponse)
def update_interview(
    iv_id: str,
    iv_in: InterviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    iv = db.query(Interview).join(Application).filter(Interview.id == iv_id, Application.user_id == current_user.id).first()
    if not iv:
        raise HTTPException(status_code=404, detail="Interview not found")

    update_data = iv_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(iv, field, val)

    db.commit()
    db.refresh(iv)

    app = db.query(Application).filter(Application.id == iv.application_id).first()
    iv.company = app.company if app else None
    iv.job_title = app.job_title if app else None
    return iv

@router.delete("/interviews/{iv_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_interview(
    iv_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    iv = db.query(Interview).join(Application).filter(Interview.id == iv_id, Application.user_id == current_user.id).first()
    if not iv:
        raise HTTPException(status_code=404, detail="Interview not found")
    db.delete(iv)
    db.commit()
    return None
