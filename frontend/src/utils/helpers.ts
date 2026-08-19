import type { AppStatus, Priority, WorkMode, InterviewType, InterviewResult } from '../types'

// ─── Status helpers ──────────────────────────────────────────────
export const STATUS_LABELS: Record<AppStatus, string> = {
  SAVED:     'Saved',
  APPLIED:   'Applied',
  SCREENING: 'Screening',
  INTERVIEW: 'Interview',
  OFFER:     'Offer',
  REJECTED:  'Rejected',
  WITHDRAWN: 'Withdrawn',
}

export const STATUS_COLORS: Record<AppStatus, string> = {
  SAVED:     '#64748b',
  APPLIED:   '#3b82f6',
  SCREENING: '#f59e0b',
  INTERVIEW: '#8b5cf6',
  OFFER:     '#10b981',
  REJECTED:  '#ef4444',
  WITHDRAWN: '#6b7280',
}

export const STATUS_ORDER: AppStatus[] = [
  'SAVED', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN'
]

export function getStatusBadgeClass(status: AppStatus): string {
  return `badge badge-${status.toLowerCase()}`
}

// ─── Priority helpers ────────────────────────────────────────────
export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW:    'Low',
  MEDIUM: 'Medium',
  HIGH:   'High',
}

export function getPriorityBadgeClass(priority: Priority): string {
  return `badge badge-${priority.toLowerCase()}`
}

// ─── Work Mode ───────────────────────────────────────────────────
export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  REMOTE: '🌐 Remote',
  HYBRID: '🏢 Hybrid',
  ONSITE: '📍 On-site',
}

// ─── Interview Type ──────────────────────────────────────────────
export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  HR:           'HR',
  TECHNICAL:    'Technical',
  MANAGERIAL:   'Managerial',
  SYSTEM_DESIGN:'System Design',
  FINAL:        'Final Round',
  OTHER:        'Other',
}

// ─── Interview Result ────────────────────────────────────────────
export const INTERVIEW_RESULT_LABELS: Record<InterviewResult, string> = {
  PENDING: 'Pending',
  PASSED:  'Passed',
  FAILED:  'Failed',
}

// ─── Formatting ──────────────────────────────────────────────────
export function formatSalary(min?: number, max?: number): string {
  if (!min && !max) return '—'
  const fmt = (n: number) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
    return `₹${n.toLocaleString('en-IN')}`
  }
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `${fmt(min)}+`
  if (max) return `Up to ${fmt(max)}`
  return '—'
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function formatRelative(dateStr: string): string {
  const now = new Date()
  const d = new Date(dateStr)
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return formatDate(dateStr)
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ─── Activity Type Labels ─────────────────────────────────────────
export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  CREATED:              '✦ Application created',
  STATUS_CHANGED:       '🔄 Status changed',
  INTERVIEW_SCHEDULED:  '📅 Interview scheduled',
  INTERVIEW_COMPLETED:  '✅ Interview completed',
  NOTE_ADDED:           '📝 Note added',
  OFFER_RECEIVED:       '🎉 Offer received',
  REJECTED:             '❌ Application rejected',
}

// ─── Source options ───────────────────────────────────────────────
export const SOURCE_OPTIONS = [
  'LinkedIn',
  'Naukri',
  'Company Website',
  'Referral',
  'AngelList',
  'Instahyre',
  'Glassdoor',
  'Indeed',
  'Other',
]

// ─── Generate UUID ────────────────────────────────────────────────
export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}
