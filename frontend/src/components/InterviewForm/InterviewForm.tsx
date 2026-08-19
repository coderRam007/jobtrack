import { useState, useEffect } from 'react'
import { Modal } from '../Modal/Modal'
import type { Interview, InterviewType, InterviewResult } from '../../types'
import { INTERVIEW_TYPE_LABELS, generateId } from '../../utils/helpers'

interface InterviewFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (interview: Interview) => void
  applicationId: string
  initial?: Interview | null
}

const BLANK: Partial<Interview> = {
  round: 1,
  type: 'HR',
  scheduled_at: new Date().toISOString().slice(0, 16),
  interviewer: '',
  meeting_url: '',
  notes: '',
  result: 'PENDING',
}

export function InterviewForm({ isOpen, onClose, onSave, applicationId, initial }: InterviewFormProps) {
  const [form, setForm] = useState<Partial<Interview>>(BLANK)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setForm(initial ? { ...initial, scheduled_at: initial.scheduled_at.slice(0, 16) } : { ...BLANK })
    }
  }, [isOpen, initial])

  const set = (k: keyof Interview, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))

    const saved: Interview = {
      id: initial?.id ?? generateId(),
      application_id: applicationId,
      company: initial?.company,
      job_title: initial?.job_title,
      round: form.round ?? 1,
      type: form.type as InterviewType,
      scheduled_at: form.scheduled_at! + ':00Z',
      interviewer: form.interviewer?.trim() || undefined,
      meeting_url: form.meeting_url?.trim() || undefined,
      notes: form.notes?.trim() || undefined,
      result: form.result as InterviewResult,
      created_at: initial?.created_at ?? new Date().toISOString(),
    }

    onSave(saved)
    setSaving(false)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? 'Edit Interview' : 'Schedule Interview'}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} id="interview-form-cancel">Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving} id="interview-form-save">
            {saving ? <span className="loading-spinner" /> : null}
            {saving ? 'Saving…' : (initial ? 'Save Changes' : 'Schedule Interview')}
          </button>
        </>
      }
    >
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="int-round">Round #</label>
          <input
            id="int-round"
            className="form-input"
            type="number"
            min={1}
            value={form.round ?? 1}
            onChange={e => set('round', +e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="int-type">Interview Type</label>
          <select
            id="int-type"
            className="form-select"
            value={form.type ?? 'HR'}
            onChange={e => set('type', e.target.value)}
          >
            {Object.entries(INTERVIEW_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="int-scheduled">Scheduled Date & Time</label>
        <input
          id="int-scheduled"
          className="form-input"
          type="datetime-local"
          value={form.scheduled_at ?? ''}
          onChange={e => set('scheduled_at', e.target.value)}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="int-interviewer">Interviewer Name</label>
          <input
            id="int-interviewer"
            className="form-input"
            value={form.interviewer ?? ''}
            onChange={e => set('interviewer', e.target.value)}
            placeholder="Optional"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="int-result">Result</label>
          <select
            id="int-result"
            className="form-select"
            value={form.result ?? 'PENDING'}
            onChange={e => set('result', e.target.value)}
          >
            <option value="PENDING">Pending</option>
            <option value="PASSED">Passed ✅</option>
            <option value="FAILED">Failed ❌</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="int-meeting-url">Meeting Link</label>
        <input
          id="int-meeting-url"
          className="form-input"
          type="url"
          value={form.meeting_url ?? ''}
          onChange={e => set('meeting_url', e.target.value)}
          placeholder="https://meet.google.com/..."
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="int-notes">Notes</label>
        <textarea
          id="int-notes"
          className="form-textarea"
          value={form.notes ?? ''}
          onChange={e => set('notes', e.target.value)}
          placeholder="Topics to cover, questions asked, preparation notes..."
          rows={3}
        />
      </div>
    </Modal>
  )
}
