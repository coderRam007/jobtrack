import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus } from 'lucide-react'
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge/StatusBadge'
import { ApplicationForm } from '../../components/ApplicationForm/ApplicationForm'
import { mockApplications as initApps } from '../../data/mockData'
import { formatDate, STATUS_LABELS, STATUS_COLORS, WORK_MODE_LABELS } from '../../utils/helpers'
import type { Application, AppStatus } from '../../types'

const COLUMNS: AppStatus[] = ['SAVED', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED']

export default function KanbanPage() {
  const navigate = useNavigate()
  const [apps, setApps] = useState<Application[]>(initApps)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedMobileStage, setSelectedMobileStage] = useState<AppStatus>('SAVED')
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768)
  const [formOpen, setFormOpen] = useState(false)
  const [editApp, setEditApp] = useState<Application | null>(null)

  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth <= 768)
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const byStatus = (status: AppStatus) => apps.filter(a => a.status === status)
  const activeApp = activeId ? apps.find(a => a.id === activeId) : null

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(e.active.id as string)
  }

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    setActiveId(null)
    if (!over) return

    if (COLUMNS.includes(over.id as AppStatus)) {
      const newStatus = over.id as AppStatus
      setApps(prev => prev.map(a =>
        a.id === active.id ? { ...a, status: newStatus, updated_at: new Date().toISOString() } : a
      ))
      return
    }

    const targetApp = apps.find(a => a.id === over.id)
    if (targetApp && targetApp.status !== apps.find(a => a.id === active.id)?.status) {
      setApps(prev => prev.map(a =>
        a.id === active.id ? { ...a, status: targetApp.status, updated_at: new Date().toISOString() } : a
      ))
    }
  }

  const handleSave = (app: Application) => {
    setApps(prev => {
      const idx = prev.findIndex(a => a.id === app.id)
      if (idx >= 0) return prev.map(a => a.id === app.id ? app : a)
      return [app, ...prev]
    })
  }

  const handleStatusChange = (appId: string, newStatus: AppStatus) => {
    setApps(prev => prev.map(a =>
      a.id === appId ? { ...a, status: newStatus, updated_at: new Date().toISOString() } : a
    ))
  }

  return (
    <div className="app-content animate-fadein" style={{ maxWidth: '100%' }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">Pipeline Board</h2>
          <p className="page-subtitle">Track job applications across stages</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditApp(null); setFormOpen(true) }} id="kanban-new-btn">
          <Plus size={16} strokeWidth={2.5} />
          New Application
        </button>
      </div>

      {/* Mobile Stage Selector Tabs */}
      {isMobileView && (
        <div style={{
          display: 'flex', gap: 'var(--space-2)', overflowX: 'auto',
          paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-4)',
          WebkitOverflowScrolling: 'touch',
        }}>
          {COLUMNS.map(col => {
            const count = byStatus(col).length
            const active = selectedMobileStage === col
            const color = STATUS_COLORS[col]

            return (
              <button
                key={col}
                className="btn btn-sm"
                onClick={() => setSelectedMobileStage(col)}
                style={{
                  background: active ? color : 'var(--bg-card)',
                  color: active ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${active ? color : 'var(--bg-border)'}`,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  fontWeight: active ? 600 : 500,
                }}
              >
                {STATUS_LABELS[col]} ({count})
              </button>
            )
          })}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {isMobileView ? (
          /* Single Column Focused Mobile View */
          <div style={{ width: '100%' }}>
            <KanbanColumn
              status={selectedMobileStage}
              color={STATUS_COLORS[selectedMobileStage]}
              apps={byStatus(selectedMobileStage)}
              onCardClick={id => navigate(`/applications/${id}`)}
              onStatusChange={handleStatusChange}
              isFullWidth
            />
          </div>
        ) : (
          /* Desktop Multi-column Kanban View */
          <div className="kanban-board">
            {COLUMNS.map(status => {
              const columnApps = byStatus(status)
              const color = STATUS_COLORS[status]
              return (
                <KanbanColumn
                  key={status}
                  status={status}
                  color={color}
                  apps={columnApps}
                  onCardClick={id => navigate(`/applications/${id}`)}
                  onStatusChange={handleStatusChange}
                />
              )
            })}
          </div>
        )}

        <DragOverlay>
          {activeApp ? <KanbanCardOverlay app={activeApp} /> : null}
        </DragOverlay>
      </DndContext>

      <ApplicationForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initial={editApp}
      />
    </div>
  )
}

// ─── Column ───────────────────────────────────────────────────────
function KanbanColumn({
  status, color, apps, onCardClick, onStatusChange, isFullWidth = false,
}: {
  status: AppStatus; color: string; apps: Application[]
  onCardClick: (id: string) => void
  onStatusChange: (id: string, status: AppStatus) => void
  isFullWidth?: boolean
}) {
  const { setNodeRef, isOver } = useSortable({
    id: status,
    data: { type: 'column', status },
  })

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column ${isOver ? 'drag-over' : ''}`}
      id={`kanban-col-${status}`}
      style={{
        borderTop: `3px solid ${color}`,
        ...(isFullWidth ? { minWidth: '100%', maxWidth: '100%' } : {})
      }}
    >
      <div className="kanban-column-header">
        <div className="kanban-column-title">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
          {STATUS_LABELS[status]}
        </div>
        <span className="kanban-count">{apps.length}</span>
      </div>

      <SortableContext items={apps.map(a => a.id)} strategy={verticalListSortingStrategy}>
        {apps.map(app => (
          <SortableKanbanCard
            key={app.id}
            app={app}
            onClick={() => onCardClick(app.id)}
            onStatusChange={onStatusChange}
          />
        ))}
      </SortableContext>

      {apps.length === 0 && (
        <div style={{
          padding: 'var(--space-6)',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.8125rem',
          border: '2px dashed var(--bg-border)',
          borderRadius: 'var(--radius-md)',
          marginTop: 'var(--space-2)',
        }}>
          No applications in {STATUS_LABELS[status]}
        </div>
      )}
    </div>
  )
}

// ─── Sortable Card Wrapper ────────────────────────────────────────
function SortableKanbanCard({
  app, onClick, onStatusChange,
}: {
  app: Application; onClick: () => void
  onStatusChange: (id: string, status: AppStatus) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: app.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCardUI app={app} onClick={onClick} onStatusChange={onStatusChange} />
    </div>
  )
}

function KanbanCardUI({
  app, onClick, onStatusChange,
}: {
  app: Application; onClick: () => void
  onStatusChange?: (id: string, status: AppStatus) => void
}) {
  const [showStatus, setShowStatus] = useState(false)

  return (
    <div className="kanban-card" id={`kanban-card-${app.id}`} style={{ padding: 'var(--space-4)' }}>
      <div className="kanban-card-company">{app.company}</div>
      <div className="kanban-card-title" onClick={onClick} style={{ fontSize: '1rem', fontWeight: 700 }}>
        {app.job_title}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
        <PriorityBadge priority={app.priority} />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
          {WORK_MODE_LABELS[app.work_mode]}
        </span>
      </div>

      <div className="kanban-card-meta">
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          📅 {formatDate(app.application_date)}
        </span>

        {onStatusChange && (
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '3px 10px' }}
              onClick={e => { e.stopPropagation(); setShowStatus(!showStatus) }}
              id={`kanban-move-${app.id}`}
            >
              Move Stage ▾
            </button>
            {showStatus && (
              <div className="dropdown-menu" style={{ right: 0, minWidth: 160, zIndex: 100 }}>
                {COLUMNS.filter(s => s !== app.status).map(s => (
                  <button
                    key={s}
                    className="dropdown-item"
                    onClick={e => {
                      e.stopPropagation()
                      onStatusChange(app.id, s)
                      setShowStatus(false)
                    }}
                  >
                    Move to {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function KanbanCardOverlay({ app }: { app: Application }) {
  return (
    <div className="kanban-card" style={{ boxShadow: 'var(--shadow-lg)', rotate: '2deg' }}>
      <div className="kanban-card-company">{app.company}</div>
      <div className="kanban-card-title">{app.job_title}</div>
      <StatusBadge status={app.status} />
    </div>
  )
}
