import { useState } from 'react'
import { User, Mail, Calendar, FileText, Plus, Edit, Trash2, Save } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Modal, ConfirmDialog } from '../../components/Modal/Modal'
import { mockResumeVersions as initVersions } from '../../data/mockData'
import { formatDate, generateId } from '../../utils/helpers'
import type { ResumeVersion } from '../../types'

export default function ProfilePage() {
  const { user } = useAuth()
  const [resumeVersions, setResumeVersions] = useState<ResumeVersion[]>(initVersions)
  const [resumeFormOpen, setResumeFormOpen] = useState(false)
  const [editResume, setEditResume] = useState<ResumeVersion | null>(null)
  const [deleteResumeId, setDeleteResumeId] = useState<string | null>(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileName, setProfileName] = useState(user?.name ?? '')

  // Resume form state
  const [resumeName, setResumeName] = useState('')
  const [resumeVersion, setResumeVersionStr] = useState('')
  const [resumeFile, setResumeFileRef] = useState('')

  const openResumeForm = (rv?: ResumeVersion) => {
    setEditResume(rv ?? null)
    setResumeName(rv?.name ?? '')
    setResumeVersionStr(rv?.version ?? '')
    setResumeFileRef(rv?.file_reference ?? '')
    setResumeFormOpen(true)
  }

  const handleSaveResume = () => {
    const now = new Date().toISOString()
    const rv: ResumeVersion = {
      id: editResume?.id ?? generateId(),
      user_id: user?.id ?? 'user-1',
      name: resumeName,
      version: resumeVersion,
      file_reference: resumeFile || undefined,
      created_at: editResume?.created_at ?? now,
      updated_at: now,
    }
    setResumeVersions(prev => {
      const idx = prev.findIndex(r => r.id === rv.id)
      if (idx >= 0) return prev.map(r => r.id === rv.id ? rv : r)
      return [...prev, rv]
    })
    setResumeFormOpen(false)
  }

  const handleDeleteResume = (id: string) => {
    setResumeVersions(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="app-content animate-fadein">
      <div className="page-header">
        <div>
          <h2 className="page-title">Profile</h2>
          <p className="page-subtitle">Your account and resume versions</p>
        </div>
      </div>

      <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)', alignItems: 'start' }}>
        {/* Profile Card */}
        <div>
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
              <div style={{
                width: 72, height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--brand-600), var(--brand-400))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.75rem', fontWeight: 800, color: 'white',
                flexShrink: 0,
                boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  {user?.email}
                </div>
              </div>
            </div>

            {editingProfile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-input"
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    id="profile-name-input"
                  />
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => setEditingProfile(false)} id="profile-save-btn">
                    <Save size={14} />
                    Save
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditingProfile(false)} id="profile-cancel-btn">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn btn-secondary btn-sm" onClick={() => setEditingProfile(true)} id="profile-edit-btn">
                <Edit size={14} />
                Edit Profile
              </button>
            )}
          </div>

          {/* Account Info */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--space-5)' }}>Account Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <InfoRow icon={<User size={16} />} label="Name" value={user?.name ?? '—'} />
              <InfoRow icon={<Mail size={16} />} label="Email" value={user?.email ?? '—'} />
              <InfoRow icon={<Calendar size={16} />} label="Member since" value={formatDate(user?.created_at ?? '')} />
            </div>
          </div>
        </div>

        {/* Resume Versions */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              <FileText size={18} style={{ display: 'inline', marginRight: 8, color: 'var(--brand-400)' }} />
              Resume Versions
            </h3>
            <button className="btn btn-primary btn-sm" onClick={() => openResumeForm()} id="resume-add-btn">
              <Plus size={14} />
              Add Version
            </button>
          </div>

          {resumeVersions.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-10)' }}>
              <FileText size={40} />
              <p>No resume versions yet</p>
              <button className="btn btn-secondary btn-sm" onClick={() => openResumeForm()}>Add your first resume</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {resumeVersions.map(rv => (
                <div
                  key={rv.id}
                  className="card"
                  style={{ padding: 'var(--space-4) var(--space-5)' }}
                  id={`resume-card-${rv.id}`}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                        {rv.name}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                        <span>Version: {rv.version}</span>
                        {rv.file_reference && <span>📎 {rv.file_reference}</span>}
                        <span>Added {formatDate(rv.created_at)}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => openResumeForm(rv)}
                        id={`resume-edit-${rv.id}`}
                        title="Edit"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        style={{ color: 'var(--error)' }}
                        onClick={() => setDeleteResumeId(rv.id)}
                        id={`resume-delete-${rv.id}`}
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Resume Form Modal */}
      <Modal
        isOpen={resumeFormOpen}
        onClose={() => setResumeFormOpen(false)}
        title={editResume ? 'Edit Resume Version' : 'Add Resume Version'}
        size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setResumeFormOpen(false)} id="resume-form-cancel">Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveResume} id="resume-form-save">
              {editResume ? 'Save Changes' : 'Add Resume'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Name *</label>
          <input
            className="form-input"
            value={resumeName}
            onChange={e => setResumeName(e.target.value)}
            placeholder="e.g. React-focused v3"
            id="resume-form-name"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Version *</label>
          <input
            className="form-input"
            value={resumeVersion}
            onChange={e => setResumeVersionStr(e.target.value)}
            placeholder="e.g. v3.0"
            id="resume-form-version"
          />
        </div>
        <div className="form-group">
          <label className="form-label">File Reference</label>
          <input
            className="form-input"
            value={resumeFile}
            onChange={e => setResumeFileRef(e.target.value)}
            placeholder="e.g. resume-react-v3.pdf"
            id="resume-form-file"
          />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteResumeId}
        onClose={() => setDeleteResumeId(null)}
        onConfirm={() => { if (deleteResumeId) handleDeleteResume(deleteResumeId); setDeleteResumeId(null) }}
        title="Delete Resume Version"
        message="Are you sure you want to delete this resume version?"
        confirmLabel="Delete"
        isDestructive
      />
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
      <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  )
}
