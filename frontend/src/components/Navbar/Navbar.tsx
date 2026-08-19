import { useState } from 'react'
import { Menu, Bell, Plus, Search, Sun, Moon } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'

interface NavbarProps {
  onMenuClick: () => void
  onNewApplication?: () => void
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/applications': 'Applications',
  '/kanban':       'Pipeline',
  '/interviews':   'Interviews',
  '/analytics':    'Analytics',
  '/profile':      'Profile',
}

export function Navbar({ onMenuClick, onNewApplication }: NavbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [searchVal, setSearchVal] = useState('')

  const title = PAGE_TITLES[location.pathname] ?? 'JobTrack'

  return (
    <header className="app-navbar">
      {/* Mobile menu button */}
      <button
        className="btn btn-ghost btn-icon"
        onClick={onMenuClick}
        id="navbar-menu-btn"
        aria-label="Open menu"
        style={{ display: 'none' }}
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, flex: '0 0 auto' }}>
        {title}
      </h1>

      {/* Search */}
      <div className="search-bar" style={{ flex: 1, maxWidth: 400 }}>
        <Search size={16} className="search-icon" />
        <input
          type="search"
          className="form-input"
          placeholder="Search applications..."
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && searchVal.trim()) {
              navigate(`/applications?search=${encodeURIComponent(searchVal.trim())}`)
            }
          }}
          id="navbar-search"
          style={{ paddingLeft: '2.5rem', height: 38, fontSize: '0.875rem' }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginLeft: 'auto' }}>
        {/* Theme Toggle Button */}
        <button
          className="btn btn-ghost btn-icon"
          onClick={toggleTheme}
          id="navbar-theme-toggle-btn"
          aria-label="Toggle dark/light theme"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
        </button>

        {/* Notifications */}
        <button
          className="btn btn-ghost btn-icon"
          id="navbar-notifications-btn"
          aria-label="Notifications"
          style={{ position: 'relative' }}
        >
          <Bell size={18} />
          <span style={{
            position: 'absolute', top: 4, right: 4,
            width: 8, height: 8,
            background: 'var(--brand-500)',
            borderRadius: '50%',
            border: '2px solid var(--bg-surface)',
          }} />
        </button>

        {/* New application button */}
        <button
          className="btn btn-primary btn-sm"
          onClick={onNewApplication}
          id="navbar-new-application-btn"
          style={{ gap: 'var(--space-2)' }}
        >
          <Plus size={16} strokeWidth={2.5} />
          New Application
        </button>
      </div>
    </header>
  )
}
