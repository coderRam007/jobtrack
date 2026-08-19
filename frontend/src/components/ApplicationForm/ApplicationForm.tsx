import { useState, useEffect } from 'react'
import { Modal } from '../Modal/Modal'
import type { Application, AppStatus, Priority, WorkMode } from '../../types'
import { SOURCE_OPTIONS, generateId } from '../../utils/helpers'

interface ApplicationFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (app: Application) => void
  initial?: Application | null
  resumeVersions?: { id: string; name: string }[]
}

const BLANK: Partial<Application> = {
  company: '',
  job_title: '',
  location: '',
  work_mode: 'HYBRID',
  salary_min: undefined,
  salary_max: undefined,
  job_url: '',
  description: '',
  status: 'SAVED',
  priority: 'MEDIUM',
  source: 'LinkedIn',
  application_date: new Date().toISOString().slice(0, 10),
  notes: '',
  resume_version: '',
}

export function ApplicationForm({
  isOpen, onClose, onSave, initial, resumeVersions = [],
}: ApplicationFormProps) {
  const [form, setForm] = useState<Partial<Application>>(BLANK)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setForm(initial ? { ...initial } : { ...BLANK })
      setErrors({})
    }
  }, [isOpen, initial])

  const set = (key: keyof Application, val: unknown) =>
    setForm(f => ({ ...f, [key]: val }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.company?.trim()) e.company = 'Company is required'
    if (!form.job_title?.trim()) e.job_title = 'Job title is required'
    if (!form.location?.trim()) e.location = 'Location is required'
    if (form.salary_min && form.salary_max && +form.salary_min > +form.salary_max)
      e.salary_min = 'Min salary must be ≤ max salary'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))

    const now = new Date().toISOString()
    const saved: Application = {
      id: initial?.id ?? generateId(),
      user_id: 'user-1',
      company: form.company!.trim(),
      job_title: form.job_title!.trim(),
      location: form.location!.trim(),
      work_mode: form.work_mode as WorkMode,
      salary_min: form.salary_min ? +form.salary_min : undefined,
      salary_max: form.salary_max ? +form.salary_max : undefined,
      job_url: form.job_url?.trim() || undefined,
      description: form.description?.trim() || undefined,
      status: form.status as AppStatus,
      priority: form.priority as Priority,
      source: form.source ?? 'LinkedIn',
      application_date: form.application_date ?? now.slice(0, 10),
      notes: form.notes?.trim() || undefined,
      resume_version: form.resume_version?.trim() || undefined,
      created_at: initial?.created_at ?? now,
      updated_at: now,
    }

    onSave(saved)
    setSaving(false)
    onClose()
  }

  const field = (label: string, key: keyof Application, element: React.ReactNode) => (
    <div className="form-group">
      <label className="form-label" htmlFor={`app-form-${key}`}>{label}</label>
      {element}
      {errors[key] && <span className="form-error">{errors[key]}</span>}
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? 'Edit Application' : 'Add New Application'}
      size="lg"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} id="app-form-cancel">Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving}
            id="app-form-save"
          >
            {saving ? <span className="loading-spinner" /> : null}
            {saving ? 'Saving…' : (initial ? 'Save Changes' : 'Add Application')}
          </button>
        </>
      }
    >
      {/* Row 1: Company + Title */}
      <div className="form-row">
        {field('Company *', 'company',
          <input
            id="app-form-company"
            className={`form-input ${errors.company ? 'error' : ''}`}
            value={form.company ?? ''}
            onChange={e => set('company', e.target.value)}
            placeholder="e.g. Google"
            autoFocus
          />
        )}
        {field('Job Title *', 'job_title',
          <input
            id="app-form-job_title"
            className="form-input"
            value={form.job_title ?? ''}
            onChange={e => set('job_title', e.target.value)}
            placeholder="e.g. Senior Frontend Engineer"
          />
        )}
      </div>

      {/* Row 2: Location + Work Mode */}
      <div className="form-row">
        {field('Location *', 'location',
          <input
            id="app-form-location"
            className="form-input"
            value={form.location ?? ''}
            onChange={e => set('location', e.target.value)}
            placeholder="e.g. Bangalore, India"
          />
        )}
        {field('Work Mode', 'work_mode',
          <select
            id="app-form-work_mode"
            className="form-select"
            value={form.work_mode ?? 'HYBRID'}
            onChange={e => set('work_mode', e.target.value)}
          >
            <option value="REMOTE">🌐 Remote</option>
            <option value="HYBRID">🏢 Hybrid</option>
            <option value="ONSITE">📍 On-site</option>
          </select>
        )}
      </div>

      {/* Row 3: Status + Priority */}
      <div className="form-row">
        {field('Status', 'status',
          <select
            id="app-form-status"
            className="form-select"
            value={form.status ?? 'SAVED'}
            onChange={e => set('status', e.target.value)}
          >
            <option value="SAVED">Saved</option>
            <option value="APPLIED">Applied</option>
            <option value="SCREENING">Screening</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OFFER">Offer</option>
            <option value="REJECTED">Rejected</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>
        )}
        {field('Priority', 'priority',
          <select
            id="app-form-priority"
            className="form-select"
            value={form.priority ?? 'MEDIUM'}
            onChange={e => set('priority', e.target.value)}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        )}
      </div>

      {/* Row 4: Salary Range */}
      <div className="form-row">
        {field('Min Salary (₹)', 'salary_min',
          <input
            id="app-form-salary_min"
            className="form-input"
            type="number"
            value={form.salary_min ?? ''}
            onChange={e => set('salary_min', e.target.value)}
            placeholder="e.g. 2000000"
            min={0}
          />
        )}
        {field('Max Salary (₹)', 'salary_max',
          <input
            id="app-form-salary_max"
            className="form-input"
            type="number"
            value={form.salary_max ?? ''}
            onChange={e => set('salary_max', e.target.value)}
            placeholder="e.g. 4000000"
            min={0}
          />
        )}
      </div>

      {/* Row 5: Source + Date */}
      <div className="form-row">
        {field('Source', 'source',
          <select
            id="app-form-source"
            className="form-select"
            value={form.source ?? 'LinkedIn'}
            onChange={e => set('source', e.target.value)}
          >
            {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        {field('Application Date', 'application_date',
          <input
            id="app-form-application_date"
            className="form-input"
            type="date"
            value={form.application_date ?? ''}
            onChange={e => set('application_date', e.target.value)}
          />
        )}
      </div>

      {/* Job URL */}
      {field('Job URL', 'job_url',
        <input
          id="app-form-job_url"
          className="form-input"
          type="url"
          value={form.job_url ?? ''}
          onChange={e => set('job_url', e.target.value)}
          placeholder="https://..."
        />
      )}

      {/* Resume Version */}
      {field('Resume Version', 'resume_version',
        <input
          id="app-form-resume_version"
          className="form-input"
          value={form.resume_version ?? ''}
          onChange={e => set('resume_version', e.target.value)}
          placeholder="e.g. React-focused v3"
          list="resume-versions-list"
        />
      )}
      {resumeVersions.length > 0 && (
        <datalist id="resume-versions-list">
          {resumeVersions.map(r => <option key={r.id} value={r.name} />)}
        </datalist>
      )}

      {/* Description */}
      {field('Job Description', 'description',
        <textarea
          id="app-form-description"
          className="form-textarea"
          value={form.description ?? ''}
          onChange={e => set('description', e.target.value)}
          placeholder="Paste the job description here..."
          rows={3}
        />
      )}

      {/* Notes */}
      {field('Notes', 'notes',
        <textarea
          id="app-form-notes"
          className="form-textarea"
          value={form.notes ?? ''}
          onChange={e => set('notes', e.target.value)}
          placeholder="Recruiter name, expected salary, things to prepare..."
          rows={3}
        />
      )}
    </Modal>
  )
}
