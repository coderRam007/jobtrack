import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { Sidebar } from './components/Sidebar/Sidebar'
import { Navbar } from './components/Navbar/Navbar'
import { ApplicationForm } from './components/ApplicationForm/ApplicationForm'

import LoginPage from './pages/Login/LoginPage'
import RegisterPage from './pages/Register/RegisterPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import ApplicationsPage from './pages/Applications/ApplicationsPage'
import ApplicationDetailPage from './pages/ApplicationDetails/ApplicationDetailPage'
import KanbanPage from './pages/Kanban/KanbanPage'
import InterviewsPage from './pages/Interviews/InterviewsPage'
import AnalyticsPage from './pages/Analytics/AnalyticsPage'
import ProfilePage from './pages/Profile/ProfilePage'

// ─── Protected Layout ────────────────────────────────────────────
function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [globalFormOpen, setGlobalFormOpen] = useState(false)

  if (isLoading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          onNewApplication={() => setGlobalFormOpen(true)}
        />
        <Routes>
          <Route path="/dashboard"       element={<DashboardPage />} />
          <Route path="/applications"    element={<ApplicationsPage />} />
          <Route path="/applications/:id" element={<ApplicationDetailPage />} />
          <Route path="/kanban"          element={<KanbanPage />} />
          <Route path="/interviews"      element={<InterviewsPage />} />
          <Route path="/analytics"       element={<AnalyticsPage />} />
          <Route path="/profile"         element={<ProfilePage />} />
          <Route path="*"                element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>

      {/* Global "New Application" modal from navbar */}
      <ApplicationForm
        isOpen={globalFormOpen}
        onClose={() => setGlobalFormOpen(false)}
        onSave={() => {}}
      />
    </div>
  )
}

// ─── Loading Screen ──────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)',
      flexDirection: 'column', gap: 'var(--space-4)',
    }}>
      <div style={{
        width: 48, height: 48,
        background: 'linear-gradient(135deg, var(--brand-600), var(--brand-500))',
        borderRadius: 'var(--radius-md)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.5rem',
        animation: 'pulse 2s ease-in-out infinite',
      }}>
        ⚡
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Loading JobTrack…</div>
    </div>
  )
}

// ─── Auth Routes Guard ────────────────────────────────────────────
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <LoadingScreen />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

// ─── App Root ────────────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={
              <AuthRoute><LoginPage /></AuthRoute>
            } />
            <Route path="/register" element={
              <AuthRoute><RegisterPage /></AuthRoute>
            } />
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--bg-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  )
}
