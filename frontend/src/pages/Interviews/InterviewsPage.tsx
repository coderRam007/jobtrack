import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Calendar, ExternalLink, Edit, Clock } from 'lucide-react'
import { InterviewForm } from '../../components/InterviewForm/InterviewForm'
import { mockInterviews as initInterviews, mockApplications } from '../../data/mockData'
import {
  formatDateTime, formatRelative,
  INTERVIEW_TYPE_LABELS, INTERVIEW_RESULT_LABELS,
} from '../../utils/helpers'
import type { Interview } from '../../types'

type ResultFilter = 'ALL' | 'PENDING' | 'PASSED' | 'FAILED'

const RESULT_COLORS: Record<string, string> = {
  PENDING: 'var(--brand-400)',
  PASSED:  'var(--success)',
  FAILED:  'var(--error)',
}

export default function InterviewsPage() {
  const navigate = useNavigate()
  const [interviews, setInterviews] = useState<Interview[]>(
    initInterviews.map(iv => ({
      ...iv,
      company: mockApplications.find(a => a.id === iv.application_id)?.company ?? iv.company,
      job_title: mockApplications.find(a => a.id === iv.application_id)?.job_title ?? iv.job_title,
    }))
  )
  const [filter, setFilter] = useState<ResultFilter>('ALL')
  const [formOpen, setFormOpen] = useState(false)
  const [editIv, setEditIv] = useState<Interview | null>(null)

  const filtered = useMemo(() => {
    let result = [...interviews]
    if (filter !== 'ALL') result = result.filter(i => i.result === filter)
    return result.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
  }, [interviews, filter])

  // Group by upcoming vs past
  const now = new Date()
  const upcoming = filtered.filter(i => new Date(i.scheduled_at) >= now)
  const past = filtered.filter(i => new Date(i.scheduled_at) < now)

  const handleSave = (iv: Interview) => {
    setInterviews(prev => {
      const idx = prev.findIndex(i => i.id === iv.id)
      const app = mockApplications.find(a => a.id === iv.application_id)
      const withMeta = { ...iv, company: app?.company, job_title: app?.job_title }
      if (idx >= 0) return prev.map(i => i.id === iv.id ? withMeta : i)
      return [...prev, withMeta]
    })
  }

  const appOptions = mockApplications.filter(a =>
    ['SCREENING', 'INTERVIEW', 'OFFER'].includes(a.status)
  )

  return (
    <div className="app-content animate-fadein">
      <div className="page-header">
        <div>
          <h2 className="page-title">Interviews</h2>
          <p className="page-subtitle">{upcoming.length} upcoming · {past.length} past</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setEditIv(null); setFormOpen(true) }}
          id="interviews-new-btn"
        >
          <Plus size={16} />
          Schedule Interview
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        {(['ALL', 'PENDING', 'PASSED', 'FAILED'] as ResultFilter[]).map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f)}
            id={`interviews-filter-${f.toLowerCase()}`}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} />
          <h3>No interviews found</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setFormOpen(true)}>
            Schedule your first interview
          </button>
        </div>
      ) : (
        <>
          {/* Upcoming Interviews */}
          {upcoming.length > 0 && (
            <section style={{ marginBottom: 'var(--space-8)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 'var(--space-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📅 Upcoming ({upcoming.length})
              </h3>
              <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                {upcoming.map(iv => (
                  <InterviewCard
                    key={iv.id}
                    interview={iv}
                    isUpcoming
                    onEdit={() => { setEditIv(iv); setFormOpen(true) }}
                    onAppClick={() => navigate(`/applications/${iv.application_id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Past Interviews */}
          {past.length > 0 && (
            <section>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 'var(--space-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                🕐 Past ({past.length})
              </h3>
              <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                {[...past].reverse().map(iv => (
                  <InterviewCard
                    key={iv.id}
                    interview={iv}
                    isUpcoming={false}
                    onEdit={() => { setEditIv(iv); setFormOpen(true) }}
                    onAppClick={() => navigate(`/applications/${iv.application_id}`)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <InterviewForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        applicationId={editIv?.application_id ?? appOptions[0]?.id ?? ''}
        initial={editIv}
      />
    </div>
  )
}

function InterviewCard({
  interview: iv, isUpcoming, onEdit, onAppClick,
}: {
  interview: Interview; isUpcoming: boolean
  onEdit: () => void; onAppClick: () => void
}) {
  const color = RESULT_COLORS[iv.result]

  return (
    <div
      className="card"
      style={{
        borderLeft: `3px solid ${isUpcoming ? 'var(--brand-500)' : color}`,
        opacity: isUpcoming ? 1 : 0.85,
      }}
      id={`interview-card-${iv.id}`}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.75rem', fontWeight: 600,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--bg-border)',
              padding: '2px 10px', borderRadius: 'var(--radius-full)',
              color: 'var(--text-muted)',
            }}>
              Round {iv.round}
            </span>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {INTERVIEW_TYPE_LABELS[iv.type]}
            </span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color }}>
              {INTERVIEW_RESULT_LABELS[iv.result]}
            </span>
          </div>

          <div
            style={{ cursor: 'pointer', marginBottom: 'var(--space-3)' }}
            onClick={onAppClick}
          >
            <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-accent)' }}>
              {iv.company}
            </span>
            <span style={{ color: 'var(--text-muted)', margin: '0 6px' }}>·</span>
            <span style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
              {iv.job_title}
            </span>
            <ExternalLink size={12} style={{ marginLeft: 4, color: 'var(--text-muted)' }} />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-5)', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={13} />
              {formatDateTime(iv.scheduled_at)}
            </span>
            {iv.interviewer && (
              <span>👤 {iv.interviewer}</span>
            )}
            {iv.meeting_url && (
              <a
                href={iv.meeting_url}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--text-accent)', display: 'flex', alignItems: 'center', gap: 4 }}
                id={`interview-join-${iv.id}`}
              >
                🔗 Join meeting
              </a>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={13} />
              {formatRelative(iv.scheduled_at)}
            </span>
          </div>

          {iv.notes && (
            <p style={{ marginTop: 'var(--space-3)', fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
              {iv.notes}
            </p>
          )}
        </div>

        <button className="btn btn-ghost btn-icon btn-sm" onClick={onEdit} id={`interview-edit-${iv.id}`}>
          <Edit size={14} />
        </button>
      </div>
    </div>
  )
}
