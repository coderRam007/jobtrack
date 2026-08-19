import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search, Filter, Plus, ArrowUpDown, LayoutGrid, List, Trash2, Edit, ExternalLink, SlidersHorizontal } from 'lucide-react'
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge/StatusBadge'
import { ApplicationForm } from '../../components/ApplicationForm/ApplicationForm'
import { ConfirmDialog } from '../../components/Modal/Modal'
import { mockApplications as initialApps, mockResumeVersions } from '../../data/mockData'
import { formatDate, formatSalary, STATUS_LABELS, WORK_MODE_LABELS } from '../../utils/helpers'
import type { Application, AppStatus, Priority, WorkMode } from '../../types'

type SortKey = 'application_date' | 'company' | 'job_title' | 'priority' | 'updated_at'
type ViewMode = 'table' | 'grid'

const PRIORITY_ORDER: Record<Priority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }

export default function ApplicationsPage({ onNewApp }: { onNewApp?: () => void }) {
  const [apps, setApps] = useState<Application[]>(initialApps)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [statusFilter, setStatusFilter] = useState<AppStatus | ''>('')
  const [priorityFilter, setPriorityFilter] = useState<Priority | ''>('')
  const [workModeFilter, setWorkModeFilter] = useState<WorkMode | ''>('')
  const [sortBy, setSortBy] = useState<SortKey>('application_date')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [view, setView] = useState<ViewMode>(window.innerWidth <= 768 ? 'grid' : 'table')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [page, setPage] = useState(1)
  const PER_PAGE = 8

  const [formOpen, setFormOpen] = useState(false)
  const [editApp, setEditApp] = useState<Application | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    const s = searchParams.get('search')
    if (s) setSearch(s)
  }, [searchParams])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768 && view === 'table') {
        setView('grid')
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [view])

  const filtered = useMemo(() => {
    let result = apps.filter(a => {
      const q = search.toLowerCase()
      if (q && !a.company.toLowerCase().includes(q) && !a.job_title.toLowerCase().includes(q) && !a.location.toLowerCase().includes(q)) return false
      if (statusFilter && a.status !== statusFilter) return false
      if (priorityFilter && a.priority !== priorityFilter) return false
      if (workModeFilter && a.work_mode !== workModeFilter) return false
      return true
    })

    result = result.sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case 'company': cmp = a.company.localeCompare(b.company); break
        case 'job_title': cmp = a.job_title.localeCompare(b.job_title); break
        case 'priority': cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]; break
        case 'updated_at': cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(); break
        default: cmp = new Date(a.application_date).getTime() - new Date(b.application_date).getTime()
      }
      return order === 'asc' ? cmp : -cmp
    })

    return result
  }, [apps, search, statusFilter, priorityFilter, workModeFilter, sortBy, order])

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)

  const handleSave = (app: Application) => {
    setApps(prev => {
      const idx = prev.findIndex(a => a.id === app.id)
      if (idx >= 0) return prev.map(a => a.id === app.id ? app : a)
      return [app, ...prev]
    })
  }

  const handleDelete = (id: string) => {
    setApps(prev => prev.filter(a => a.id !== id))
  }

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setOrder(o => o === 'asc' ? 'desc' : 'asc')
    else { setSortBy(key); setOrder('desc') }
  }

  const clearFilters = () => {
    setSearch(''); setStatusFilter(''); setPriorityFilter(''); setWorkModeFilter('')
    setPage(1)
  }
  const hasFilters = search || statusFilter || priorityFilter || workModeFilter

  return (
    <div className="app-content animate-fadein">
      <div className="page-header">
        <div>
          <h2 className="page-title">Applications</h2>
          <p className="page-subtitle">{filtered.length} application{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', width: '100%', maxWidth: 400 }}>
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={() => { setEditApp(null); setFormOpen(true); onNewApp?.() }}
            id="apps-new-btn"
          >
            <Plus size={16} strokeWidth={2.5} />
            New Application
          </button>
          <button
            className="btn btn-secondary btn-icon mobile-only-inline"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            id="apps-mobile-filter-toggle"
            aria-label="Toggle filters"
            style={{ display: 'none' }}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={`filter-bar ${showMobileFilters ? 'mobile-show' : ''}`}>
        {/* Search */}
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <Search size={15} className="search-icon" />
          <input
            className="form-input"
            style={{ paddingLeft: '2.2rem', height: 38, fontSize: '0.875rem' }}
            placeholder="Search company, title, location…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            id="apps-search"
          />
        </div>

        {/* Status filter */}
        <select
          className="form-select"
          style={{ width: 160, height: 38, fontSize: '0.875rem' }}
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value as AppStatus | ''); setPage(1) }}
          id="apps-filter-status"
        >
          <option value="">All Status</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        {/* Priority filter */}
        <select
          className="form-select"
          style={{ width: 140, height: 38, fontSize: '0.875rem' }}
          value={priorityFilter}
          onChange={e => { setPriorityFilter(e.target.value as Priority | ''); setPage(1) }}
          id="apps-filter-priority"
        >
          <option value="">All Priority</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {/* Work mode filter */}
        <select
          className="form-select"
          style={{ width: 140, height: 38, fontSize: '0.875rem' }}
          value={workModeFilter}
          onChange={e => { setWorkModeFilter(e.target.value as WorkMode | ''); setPage(1) }}
          id="apps-filter-workmode"
        >
          <option value="">All Modes</option>
          <option value="REMOTE">🌐 Remote</option>
          <option value="HYBRID">🏢 Hybrid</option>
          <option value="ONSITE">📍 On-site</option>
        </select>

        {hasFilters && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters} id="apps-clear-filters">
            Clear filters
          </button>
        )}

        {/* View toggle */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }} className="desktop-only-flex">
          <button
            className={`btn btn-icon btn-sm ${view === 'table' ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={() => setView('table')}
            id="apps-view-table"
            aria-label="Table view"
          >
            <List size={16} />
          </button>
          <button
            className={`btn btn-icon btn-sm ${view === 'grid' ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={() => setView('grid')}
            id="apps-view-grid"
            aria-label="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {/* Table View (Desktop) */}
      {view === 'table' && (
        <div className="table-container desktop-only-block">
          {paginated.length === 0 ? (
            <div className="empty-state">
              <Filter size={40} />
              <p>No applications match your filters</p>
              {hasFilters && <button className="btn btn-secondary btn-sm" onClick={clearFilters}>Clear filters</button>}
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <SortTh label="Company" sortKey="company" current={sortBy} order={order} onToggle={toggleSort} />
                  <SortTh label="Job Title" sortKey="job_title" current={sortBy} order={order} onToggle={toggleSort} />
                  <th>Status</th>
                  <SortTh label="Priority" sortKey="priority" current={sortBy} order={order} onToggle={toggleSort} />
                  <th>Location</th>
                  <th>Salary</th>
                  <SortTh label="Applied" sortKey="application_date" current={sortBy} order={order} onToggle={toggleSort} />
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(app => (
                  <tr key={app.id} onClick={() => navigate(`/applications/${app.id}`)}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{app.company}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {WORK_MODE_LABELS[app.work_mode]}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{app.job_title}</td>
                    <td><StatusBadge status={app.status} /></td>
                    <td><PriorityBadge priority={app.priority} /></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{app.location}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{formatSalary(app.salary_min, app.salary_max)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{formatDate(app.application_date)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {app.job_url && (
                          <a href={app.job_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-icon btn-sm" title="Open job URL">
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => { setEditApp(app); setFormOpen(true) }}
                          id={`apps-edit-${app.id}`}
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          style={{ color: 'var(--error)' }}
                          onClick={() => setDeleteId(app.id)}
                          id={`apps-delete-${app.id}`}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Card / Mobile Grid View */}
      {view === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {paginated.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <Filter size={40} />
              <p>No applications match your filters</p>
              {hasFilters && <button className="btn btn-secondary btn-sm" onClick={clearFilters}>Clear filters</button>}
            </div>
          ) : paginated.map(app => (
            <AppCard
              key={app.id}
              app={app}
              onEdit={() => { setEditApp(app); setFormOpen(true) }}
              onDelete={() => setDeleteId(app.id)}
              onClick={() => navigate(`/applications/${app.id}`)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)} id="apps-prev-page">‹</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`page-btn ${page === p ? 'active' : ''}`}
              onClick={() => setPage(p)}
              id={`apps-page-${p}`}
            >
              {p}
            </button>
          ))}
          <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} id="apps-next-page">›</button>
        </div>
      )}

      {/* Application Form Modal */}
      <ApplicationForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initial={editApp}
        resumeVersions={mockResumeVersions}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) handleDelete(deleteId); setDeleteId(null) }}
        title="Delete Application"
        message="Are you sure you want to delete this application? This cannot be undone."
        confirmLabel="Delete"
        isDestructive
      />
    </div>
  )
}

// ─── Sort Header ─────────────────────────────────────────────────
function SortTh({ label, sortKey, current, order, onToggle }: {
  label: string; sortKey: SortKey
  current: SortKey; order: 'asc' | 'desc'
  onToggle: (k: SortKey) => void
}) {
  const active = current === sortKey
  return (
    <th onClick={() => onToggle(sortKey)} style={{ cursor: 'pointer' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {label}
        <ArrowUpDown size={13} style={{ opacity: active ? 1 : 0.4, color: active ? 'var(--brand-400)' : 'inherit' }} />
        {active && <span style={{ fontSize: '0.65rem', color: 'var(--brand-400)' }}>{order === 'asc' ? '↑' : '↓'}</span>}
      </span>
    </th>
  )
}

// ─── App Card (Mobile & Grid View) ──────────────────────────────
function AppCard({ app, onEdit, onDelete, onClick }: {
  app: Application; onEdit: () => void; onDelete: () => void; onClick: () => void
}) {
  return (
    <div className="card" style={{ cursor: 'pointer', position: 'relative', padding: 'var(--space-4)' }} onClick={onClick}>
      <div style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)', display: 'flex', gap: 2 }}
        onClick={e => e.stopPropagation()}>
        {app.job_url && (
          <a href={app.job_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-icon btn-sm">
            <ExternalLink size={14} />
          </a>
        )}
        <button className="btn btn-ghost btn-icon btn-sm" onClick={onEdit}><Edit size={14} /></button>
        <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--error)' }} onClick={onDelete}><Trash2 size={14} /></button>
      </div>

      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 2, fontWeight: 500 }}>{app.company}</div>
      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-3)', paddingRight: 'var(--space-12)' }}>{app.job_title}</div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
        <StatusBadge status={app.status} />
        <PriorityBadge priority={app.priority} />
      </div>

      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4, background: 'var(--bg-elevated)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
        <span>📍 {app.location} · {WORK_MODE_LABELS[app.work_mode]}</span>
        <span>💰 {formatSalary(app.salary_min, app.salary_max)}</span>
        <span>📅 Applied {formatDate(app.application_date)}</span>
      </div>
    </div>
  )
}
