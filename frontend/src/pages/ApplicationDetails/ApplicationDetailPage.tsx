import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Edit, Trash2, Plus, ExternalLink,
  MapPin, Briefcase, Calendar, Clock, FileText, Link2,
} from 'lucide-react'
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge/StatusBadge'
import { ApplicationForm } from '../../components/ApplicationForm/ApplicationForm'
import { InterviewForm } from '../../components/InterviewForm/InterviewForm'
import { ConfirmDialog } from '../../components/Modal/Modal'
import {
  mockApplications as initApps,
  mockInterviews as initInterviews,
  mockActivities,
  mockNotes,
} from '../../data/mockData'
import {
  formatDate, formatDateTime, formatRelative, formatSalary,
  WORK_MODE_LABELS, INTERVIEW_TYPE_LABELS, INTERVIEW_RESULT_LABELS,
} from '../../utils/helpers'
import type { Application, Interview } from '../../types'

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [apps, setApps] = useState(initApps)
  const [interviews, setInterviews] = useState(initInterviews)
  const [activeTab, setActiveTab] = useState<'overview' | 'interviews' | 'timeline' | 'notes'>('overview')

  const [formOpen, setFormOpen] = useState(false)
  const [interviewFormOpen, setInterviewFormOpen] = useState(false)
  const [editInterview, setEditInterview] = useState<Interview | null>(null)
  const [deleteAppConfirm, setDeleteAppConfirm] = useState(false)

  const app = useMemo(() => apps.find(a => a.id === id), [apps, id])
  const appInterviews = useMemo(() => interviews.filter(i => i.application_id === id), [interviews, id])
  const activities = useMemo(() => mockActivities.filter(a => a.application_id === id), [id])
  const notes = useMemo(() => mockNotes.filter(n => n.application_id === id), [id])

  if (!app) {
    return (
      <div className="app-content">
        <div className="empty-state">
          <Briefcase size={48} />
          <h3>Application not found</h3>
          <button className="btn btn-primary" onClick={() => navigate('/applications')}>
            Back to Applications
          </button>
        </div>
      </div>
    )
  }

  const handleSaveApp = (updated: Application) => {
    setApps(prev => prev.map(a => a.id === updated.id ? updated : a))
  }

  const handleDeleteApp = () => {
    setApps(prev => prev.filter(a => a.id !== id))
    navigate('/applications')
  }

  const handleSaveInterview = (iv: Interview) => {
    setInterviews(prev => {
      const idx = prev.findIndex(i => i.id === iv.id)
      if (idx >= 0) return prev.map(i => i.id === iv.id ? { ...iv, company: app.company, job_title: app.job_title } : i)
      return [...prev, { ...iv, company: app.company, job_title: app.job_title }]
    })
  }

  const resultColor: Record<string, string> = {
    PENDING: 'var(--text-muted)',
    PASSED:  'var(--success)',
    FAILED:  'var(--error)',
  }

  return (
    <div className="app-content animate-fadein">
      {/* Back + Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <button className="btn btn-ghost" onClick={() => navigate('/applications')} id="detail-back-btn">
          <ArrowLeft size={16} />
          Back to Applications
        </button>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn-secondary" onClick={() => setFormOpen(true)} id="detail-edit-btn">
            <Edit size={15} />
            Edit
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => setDeleteAppConfirm(true)} id="detail-delete-btn">
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      </div>

      {/* Header Card */}
      <div className="card" style={{ marginBottom: 'var(--space-6)', position: 'relative', overflow: 'hidden' }}>
        {/* Gradient accent top */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, var(--brand-600), var(--brand-400))',
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>{app.company}</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-4)', fontFamily: 'var(--font-display)' }}>
              {app.job_title}
            </h2>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <StatusBadge status={app.status} />
              <PriorityBadge priority={app.priority} />
            </div>
          </div>

          {/* Quick stats */}
          <div className="quick-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 'var(--space-4)', flex: 1 }}>
            <QuickStat icon={<MapPin size={14} />} label="Location" value={app.location} />
            <QuickStat icon={<Briefcase size={14} />} label="Mode" value={WORK_MODE_LABELS[app.work_mode]} />
            <QuickStat icon={<Calendar size={14} />} label="Applied" value={formatDate(app.application_date)} />
            <QuickStat icon={<Clock size={14} />} label="Updated" value={formatRelative(app.updated_at)} />
          </div>
        </div>

        {/* Salary + Source */}
        <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-5)', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Salary</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              {formatSalary(app.salary_min, app.salary_max)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Source</div>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{app.source}</div>
          </div>
          {app.resume_version && (
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Resume</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontWeight: 600 }}>
                <FileText size={14} />
                {app.resume_version}
              </div>
            </div>
          )}
          {app.job_url && (
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Job Link</div>
              <a href={app.job_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-accent)', fontWeight: 600, fontSize: '0.875rem' }}>
                <Link2 size={14} />
                Open listing
                <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
        {(['overview', 'interviews', 'timeline', 'notes'] as const).map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            id={`detail-tab-${tab}`}
          >
            {tab === 'overview' ? '📋 Overview' :
             tab === 'interviews' ? `📅 Interviews (${appInterviews.length})` :
             tab === 'timeline' ? '🕐 Timeline' :
             `📝 Notes (${notes.length})`}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
          {app.description && (
            <div className="card" style={{ gridColumn: '1/-1' }}>
              <h4 style={{ marginBottom: 'var(--space-3)', color: 'var(--text-primary)' }}>Job Description</h4>
              <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9375rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>{app.description}</p>
            </div>
          )}
          {app.notes && (
            <div className="card">
              <h4 style={{ marginBottom: 'var(--space-3)', color: 'var(--text-primary)' }}>Notes</h4>
              <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9375rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>{app.notes}</p>
            </div>
          )}
          {/* Status Pipeline */}
          <div className="card">
            <h4 style={{ marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>Pipeline Status</h4>
            <StatusPipeline current={app.status} />
          </div>
        </div>
      )}

      {/* Tab: Interviews */}
      {activeTab === 'interviews' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-4)' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => { setEditInterview(null); setInterviewFormOpen(true) }}
              id="detail-add-interview-btn"
            >
              <Plus size={14} />
              Schedule Interview
            </button>
          </div>

          {appInterviews.length === 0 ? (
            <div className="empty-state">
              <Calendar size={40} />
              <p>No interviews yet</p>
              <button className="btn btn-secondary btn-sm" onClick={() => setInterviewFormOpen(true)}>
                Schedule first interview
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {appInterviews
                .sort((a, b) => a.round - b.round)
                .map(iv => (
                  <div key={iv.id} className="card" style={{
                    borderLeft: `3px solid ${iv.result === 'PASSED' ? 'var(--success)' : iv.result === 'FAILED' ? 'var(--error)' : 'var(--brand-500)'}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600, background: 'var(--bg-elevated)', padding: '2px 10px', borderRadius: 'var(--radius-full)', color: 'var(--text-muted)' }}>
                            Round {iv.round}
                          </span>
                          <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {INTERVIEW_TYPE_LABELS[iv.type]}
                          </span>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: resultColor[iv.result] }}>
                            {INTERVIEW_RESULT_LABELS[iv.result]}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                          <span>📅 {formatDateTime(iv.scheduled_at)}</span>
                          {iv.interviewer && <span>👤 {iv.interviewer}</span>}
                          {iv.meeting_url && (
                            <a href={iv.meeting_url} target="_blank" rel="noreferrer" style={{ color: 'var(--text-accent)' }}>
                              🔗 Join meeting
                            </a>
                          )}
                        </div>
                        {iv.notes && (
                          <p style={{ marginTop: 'var(--space-3)', fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                            {iv.notes}
                          </p>
                        )}
                      </div>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => { setEditInterview(iv); setInterviewFormOpen(true) }}
                        id={`detail-edit-interview-${iv.id}`}
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Timeline */}
      {activeTab === 'timeline' && (
        <div className="timeline">
          {activities.length === 0 ? (
            <div className="empty-state">
              <Clock size={40} />
              <p>No activity recorded yet</p>
            </div>
          ) : activities.map(act => (
            <div key={act.id} className="timeline-item">
              <div className="timeline-dot active">⚡</div>
              <div className="timeline-content">
                <div className="timeline-date">{formatDate(act.created_at)}</div>
                <div className="timeline-text">{act.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Notes */}
      {activeTab === 'notes' && (
        <div>
          {notes.length === 0 ? (
            <div className="empty-state">
              <FileText size={40} />
              <p>No notes yet. Add notes in the application form.</p>
            </div>
          ) : notes.map(note => (
            <div key={note.id} className="card" style={{ marginBottom: 'var(--space-3)' }}>
              <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', lineHeight: 1.8 }}>{note.content}</p>
              <div style={{ marginTop: 'var(--space-3)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {formatRelative(note.updated_at)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <ApplicationForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveApp}
        initial={app}
      />

      <InterviewForm
        isOpen={interviewFormOpen}
        onClose={() => setInterviewFormOpen(false)}
        onSave={handleSaveInterview}
        applicationId={id!}
        initial={editInterview}
      />

      <ConfirmDialog
        isOpen={deleteAppConfirm}
        onClose={() => setDeleteAppConfirm(false)}
        onConfirm={handleDeleteApp}
        title="Delete Application"
        message={`Are you sure you want to delete the "${app.job_title}" application at ${app.company}? This cannot be undone.`}
        confirmLabel="Delete"
        isDestructive
      />
    </div>
  )
}

function QuickStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
        {icon}{label}
      </div>
      <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{value}</div>
    </div>
  )
}

const PIPELINE: Application['status'][] = ['SAVED', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER']
const STATUS_COLOR_MAP: Record<string, string> = {
  SAVED: '#64748b', APPLIED: '#3b82f6', SCREENING: '#f59e0b',
  INTERVIEW: '#8b5cf6', OFFER: '#10b981', REJECTED: '#ef4444',
}

function StatusPipeline({ current }: { current: Application['status'] }) {
  const currentIdx = PIPELINE.indexOf(current as Application['status'])
  const isRejected = current === 'REJECTED' || current === 'WITHDRAWN'

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {PIPELINE.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < PIPELINE.length - 1 ? 1 : 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: isRejected ? 'var(--bg-elevated)' :
                i < currentIdx ? STATUS_COLOR_MAP[PIPELINE[currentIdx]] + '44' :
                i === currentIdx ? STATUS_COLOR_MAP[s] :
                'var(--bg-elevated)',
              border: `2px solid ${isRejected ? 'var(--bg-border)' : i <= currentIdx ? STATUS_COLOR_MAP[PIPELINE[Math.max(i, currentIdx)]] : 'var(--bg-border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', fontWeight: 700,
              color: i <= currentIdx && !isRejected ? 'var(--text-primary)' : 'var(--text-muted)',
              flexShrink: 0, transition: 'all 0.3s',
            }}>
              {i < currentIdx && !isRejected ? '✓' : i + 1}
            </div>
            {i < PIPELINE.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: '0 4px',
                background: i < currentIdx && !isRejected ? STATUS_COLOR_MAP[PIPELINE[currentIdx]] : 'var(--bg-border)',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)' }}>
        {PIPELINE.map(s => (
          <span key={s} style={{ fontSize: '0.7rem', color: s === current ? 'var(--text-accent)' : 'var(--text-muted)', fontWeight: s === current ? 700 : 400, textAlign: 'center', flex: 1 }}>
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </span>
        ))}
      </div>
      {isRejected && (
        <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)', background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', color: 'var(--error)', fontWeight: 600 }}>
          {current === 'REJECTED' ? '❌ Application Rejected' : '↩ Application Withdrawn'}
        </div>
      )}
    </div>
  )
}
