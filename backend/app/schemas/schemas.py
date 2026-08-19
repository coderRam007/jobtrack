from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional, List
from datetime import datetime
from app.models.models import AppStatus, Priority, WorkMode, InterviewType, InterviewResult

# ─── Auth Schemas ────────────────────────────────────────────────
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

# ─── Application Schemas ──────────────────────────────────────────
class ApplicationBase(BaseModel):
    company: str
    job_title: str
    location: str
    work_mode: WorkMode = WorkMode.HYBRID
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    job_url: Optional[str] = None
    description: Optional[str] = None
    status: AppStatus = AppStatus.SAVED
    priority: Priority = Priority.MEDIUM
    source: str = "LinkedIn"
    application_date: str
    notes: Optional[str] = None
    resume_version: Optional[str] = None

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    company: Optional[str] = None
    job_title: Optional[str] = None
    location: Optional[str] = None
    work_mode: Optional[WorkMode] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    job_url: Optional[str] = None
    description: Optional[str] = None
    status: Optional[AppStatus] = None
    priority: Optional[Priority] = None
    source: Optional[str] = None
    application_date: Optional[str] = None
    notes: Optional[str] = None
    resume_version: Optional[str] = None

class ApplicationResponse(ApplicationBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PaginatedApplications(BaseModel):
    total: int
    page: int
    limit: int
    items: List[ApplicationResponse]

# ─── Interview Schemas ────────────────────────────────────────────
class InterviewBase(BaseModel):
    round: int = 1
    type: InterviewType = InterviewType.HR
    scheduled_at: str
    interviewer: Optional[str] = None
    meeting_url: Optional[str] = None
    notes: Optional[str] = None
    result: InterviewResult = InterviewResult.PENDING

class InterviewCreate(InterviewBase):
    pass

class InterviewUpdate(BaseModel):
    round: Optional[int] = None
    type: Optional[InterviewType] = None
    scheduled_at: Optional[str] = None
    interviewer: Optional[str] = None
    meeting_url: Optional[str] = None
    notes: Optional[str] = None
    result: Optional[InterviewResult] = None

class InterviewResponse(InterviewBase):
    id: str
    application_id: str
    created_at: datetime
    company: Optional[str] = None
    job_title: Optional[str] = None

    class Config:
        from_attributes = True

# ─── Activity Schema ──────────────────────────────────────────────
class ActivityResponse(BaseModel):
    id: str
    application_id: str
    activity_type: str
    description: str
    created_at: datetime

    class Config:
        from_attributes = True

# ─── Note Schema ──────────────────────────────────────────────────
class NoteBase(BaseModel):
    content: str

class NoteCreate(NoteBase):
    pass

class NoteResponse(NoteBase):
    id: str
    application_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ─── Resume Version Schema ────────────────────────────────────────
class ResumeVersionBase(BaseModel):
    name: str
    version: str
    file_reference: Optional[str] = None

class ResumeVersionCreate(ResumeVersionBase):
    pass

class ResumeVersionResponse(ResumeVersionBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ─── Dashboard Summary Schema ─────────────────────────────────────
class DashboardSummaryResponse(BaseModel):
    total: int
    this_week: int
    this_month: int
    active: int
    interviews: int
    offers: int
    rejections: int
    response_rate: float
    interview_rate: float
