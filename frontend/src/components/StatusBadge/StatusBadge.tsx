import type { AppStatus, Priority } from '../../types'
import { STATUS_LABELS, PRIORITY_LABELS } from '../../utils/helpers'

interface StatusBadgeProps {
  status: AppStatus
}

interface PriorityBadgeProps {
  priority: Priority
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorMap: Record<AppStatus, string> = {
    SAVED:     '#64748b',
    APPLIED:   '#3b82f6',
    SCREENING: '#f59e0b',
    INTERVIEW: '#8b5cf6',
    OFFER:     '#10b981',
    REJECTED:  '#ef4444',
    WITHDRAWN: '#6b7280',
  }
  const color = colorMap[status]

  return (
    <span
      className="badge"
      style={{
        background: `${color}22`,
        color,
        border: `1px solid ${color}44`,
      }}
    >
      <span
        className="badge-dot"
        style={{ background: color }}
      />
      {STATUS_LABELS[status]}
    </span>
  )
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const colorMap: Record<Priority, string> = {
    LOW:    '#6b7280',
    MEDIUM: '#f59e0b',
    HIGH:   '#ef4444',
  }
  const color = colorMap[priority]

  return (
    <span
      className="badge"
      style={{
        background: `${color}22`,
        color,
        border: `1px solid ${color}44`,
        textTransform: 'capitalize',
      }}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  )
}
