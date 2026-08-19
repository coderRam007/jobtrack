import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Briefcase, CalendarCheck, BarChart3,
  User, LogOut, ChevronRight, Zap, X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/applications', icon: Briefcase,       label: 'Applications' },
  { to: '/kanban',       icon: ChevronRight,    label: 'Pipeline' },
  { to: '/interviews',   icon: CalendarCheck,   label: 'Interviews' },
  { to: '/analytics',    icon: BarChart3,       label: 'Analytics' },
  { to: '/profile',      icon: User,            label: 'Profile' },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 99 }}
          onClick={onClose}
        />
      )}

      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div style={{
          padding: 'var(--space-6)',
          borderBottom: '1px solid var(--bg-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, var(--brand-600), var(--brand-500))',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
            }}>
              <Zap size={18} color="white" strokeWidth={2.5} />
            </div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.2rem',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}>
              JobTrack
            </span>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ display: 'none' }} id="sidebar-close">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ padding: 'var(--space-4)', flex: 1, overflowY: 'auto' }}>
          <div style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 'var(--space-3)',
            paddingLeft: 'var(--space-3)',
          }}>
            Navigation
          </div>

          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              id={`nav-${label.toLowerCase()}`}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 4,
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                background: isActive ? 'var(--bg-card)' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.9375rem',
                transition: 'all var(--transition-fast)',
                textDecoration: 'none',
                borderLeft: isActive ? '2px solid var(--brand-500)' : '2px solid transparent',
                position: 'relative' as const,
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    color={isActive ? 'var(--brand-400)' : 'currentColor'}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div style={{
          padding: 'var(--space-4)',
          borderTop: '1px solid var(--bg-border)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-elevated)',
            marginBottom: 'var(--space-2)',
          }}>
            <div style={{
              width: 34, height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--brand-600), var(--brand-400))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.875rem', fontWeight: 700, color: 'white',
              flexShrink: 0,
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
          </div>
          <button
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'flex-start', gap: 'var(--space-3)' }}
            onClick={handleLogout}
            id="sidebar-logout-btn"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
