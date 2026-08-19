from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, ResumeVersion
from app.schemas.schemas import ResumeVersionCreate, ResumeVersionResponse, UserResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me/resumes", response_model=list[ResumeVersionResponse])
def list_resume_versions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(ResumeVersion).filter(ResumeVersion.user_id == current_user.id).order_by(ResumeVersion.created_at.desc()).all()

@router.post("/me/resumes", response_model=ResumeVersionResponse, status_code=status.HTTP_201_CREATED)
def create_resume_version(
    rv_in: ResumeVersionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rv = ResumeVersion(**rv_in.model_dump(), user_id=current_user.id)
    db.add(rv)
    db.commit()
    db.refresh(rv)
    return rv

@router.delete("/me/resumes/{rv_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume_version(
    rv_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rv = db.query(ResumeVersion).filter(ResumeVersion.id == rv_id, ResumeVersion.user_id == current_user.id).first()
    if not rv:
        raise HTTPException(status_code=404, detail="Resume version not found")
    db.delete(rv)
    db.commit()
    return None
