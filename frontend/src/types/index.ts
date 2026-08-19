// ─── Application Status ─────────────────────────────────────────
export type AppStatus =
  | 'SAVED'
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN'

// ─── Priority ───────────────────────────────────────────────────
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH'

// ─── Work Mode ──────────────────────────────────────────────────
export type WorkMode = 'REMOTE' | 'HYBRID' | 'ONSITE'

// ─── Interview Type ──────────────────────────────────────────────
export type InterviewType = 'HR' | 'TECHNICAL' | 'MANAGERIAL' | 'SYSTEM_DESIGN' | 'FINAL' | 'OTHER'

// ─── Interview Result ────────────────────────────────────────────
export type InterviewResult = 'PENDING' | 'PASSED' | 'FAILED'

// ─── User ────────────────────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  created_at: string
}

// ─── Application ─────────────────────────────────────────────────
export interface Application {
  id: string
  user_id: string
  company: string
  job_title: string
  location: string
  work_mode: WorkMode
  salary_min?: number
  salary_max?: number
  job_url?: string
  description?: string
  status: AppStatus
  priority: Priority
  source: string
  application_date: string
  created_at: string
  updated_at: string
  notes?: string
  resume_version?: string
}

// ─── Interview ───────────────────────────────────────────────────
export interface Interview {
  id: string
  application_id: string
  round: number
  type: InterviewType
  scheduled_at: string
  interviewer?: string
  meeting_url?: string
  notes?: string
  result: InterviewResult
  created_at: string
  // joined for UI
  company?: string
  job_title?: string
}

// ─── Activity ────────────────────────────────────────────────────
export interface Activity {
  id: string
  application_id: string
  activity_type: string
  description: string
  created_at: string
}

// ─── Note ────────────────────────────────────────────────────────
export interface Note {
  id: string
  application_id: string
  content: string
  created_at: string
  updated_at: string
}

// ─── Resume Version ──────────────────────────────────────────────
export interface ResumeVersion {
  id: string
  user_id: string
  name: string
  version: string
  file_reference?: string
  created_at: string
  updated_at: string
}

// ─── Dashboard Summary ───────────────────────────────────────────
export interface DashboardSummary {
  total: number
  this_week: number
  this_month: number
  active: number
  interviews: number
  offers: number
  rejections: number
  response_rate: number
  interview_rate: number
}

// ─── Filter Options ──────────────────────────────────────────────
export interface ApplicationFilters {
  search: string
  status: AppStatus | ''
  priority: Priority | ''
  work_mode: WorkMode | ''
  source: string
  date_from: string
  date_to: string
  sort_by: 'application_date' | 'company' | 'job_title' | 'priority' | 'updated_at'
  order: 'asc' | 'desc'
}
