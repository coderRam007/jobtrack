import { useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  Briefcase, TrendingUp, CalendarCheck, Trophy,
  XCircle, Clock, ArrowUpRight, Target, Activity,
} from 'lucide-react'
import { StatusBadge } from '../../components/StatusBadge/StatusBadge'
import { mockApplications, mockDashboard, mockInterviews } from '../../data/mockData'
import { formatDate, formatSalary, STATUS_LABELS, STATUS_COLORS } from '../../utils/helpers'
import type { Application } from '../../types'

// ─── Chart helpers ───────────────────────────────────────────────
const STATUS_CHART_DATA = Object.entries(STATUS_LABELS)
  .map(([key, label]) => ({
    name: label,
    value: mockApplications.filter(a => a.status === key).length,
    color: STATUS_COLORS[key as keyof typeof STATUS_COLORS],
  }))
  .filter(d => d.value > 0)

const SOURCE_DATA = (() => {
  const counts: Record<string, number> = {}
  mockApplications.forEach(a => {
    counts[a.source] = (counts[a.source] ?? 0) + 1
  })
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
})()

const TIMELINE_DATA = (() => {
  const counts: Record<string, number> = {}
  mockApplications.forEach(a => {
    const d = a.application_date.slice(0, 7) // YYYY-MM
    counts[d] = (counts[d] ?? 0) + 1
  })
  return Object.entries(counts).sort().map(([month, count]) => ({
    month: new Date(month + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
    applications: count,
  }))
})()

// ─── Custom Tooltip ───────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)',
      borderRadius: 'var(--radius-md)', padding: '10px 14px',
      fontSize: '0.875rem',
    }}>
      {label && <div style={{ color: 'var(--text-muted)', marginBottom: 4, fontSize: '0.8125rem' }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || 'var(--text-primary)', fontWeight: 600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const d = mockDashboard
  const recentApps = useMemo(() =>
    [...mockApplications].sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    ).slice(0, 5),
  [])

  const upcomingInterviews = useMemo(() =>
    mockInterviews
      .filter(i => i.result === 'PENDING')
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
      .slice(0, 3),
  [])

  return (
    <div className="app-content animate-fadein">
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">Your job search at a glance</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          label="Total Applications"
          value={d.total}
          icon={<Briefcase size={40} />}
          accentColor="#6366f1"
          sub={`${d.this_week} this week`}
        />
        <StatCard
          label="Active"
          value={d.active}
          icon={<Activity size={40} />}
          accentColor="#3b82f6"
          sub="In pipeline"
        />
        <StatCard
          label="Interviews"
          value={d.interviews}
          icon={<CalendarCheck size={40} />}
          accentColor="#8b5cf6"
          sub="Scheduled / completed"
        />
        <StatCard
          label="Offers"
          value={d.offers}
          icon={<Trophy size={40} />}
          accentColor="#10b981"
          sub="Received"
        />
        <StatCard
          label="Rejections"
          value={d.rejections}
          icon={<XCircle size={40} />}
          accentColor="#ef4444"
          sub="Keep going 💪"
        />
        <StatCard
          label="Response Rate"
          value={`${d.response_rate}%`}
          icon={<TrendingUp size={40} />}
          accentColor="#f59e0b"
          sub="Applications → responses"
        />
        <StatCard
          label="Interview Rate"
          value={`${d.interview_rate}%`}
          icon={<Target size={40} />}
          accentColor="#ec4899"
          sub="Applications → interviews"
        />
        <StatCard
          label="This Month"
          value={d.this_month}
          icon={<Clock size={40} />}
          accentColor="#14b8a6"
          sub="Applications sent"
        />
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Applications Over Time */}
        <div className="chart-card" style={{ gridColumn: 'span 2' }}>
          <div className="chart-title">
            <TrendingUp size={18} color="var(--brand-400)" />
            Applications Over Time
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={TIMELINE_DATA}>
              <defs>
                <linearGradient id="gradApp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="applications"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#gradApp)"
                dot={{ fill: '#6366f1', r: 4 }}
                activeDot={{ r: 6, stroke: '#818cf8' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Donut */}
        <div className="chart-card">
          <div className="chart-title">
            <Briefcase size={18} color="var(--brand-400)" />
            By Status
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={STATUS_CHART_DATA}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {STATUS_CHART_DATA.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{value}</span>}
                iconSize={10}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Source Bar Chart */}
        <div className="chart-card">
          <div className="chart-title">
            <ArrowUpRight size={18} color="var(--brand-400)" />
            By Source
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={SOURCE_DATA} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]}>
                {SOURCE_DATA.map((_, idx) => (
                  <Cell key={idx} fill={['#6366f1','#8b5cf6','#3b82f6','#10b981','#f59e0b','#ec4899'][idx % 6]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom: Recent + Upcoming Interviews */}
      <div className="dashboard-bottom-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
        {/* Recent Applications */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: 'var(--space-5) var(--space-6)',
            borderBottom: '1px solid var(--bg-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Recent Applications</h3>
            <a href="/applications" style={{ fontSize: '0.8125rem', color: 'var(--text-accent)' }}>View all →</a>
          </div>
          <div>
            {recentApps.map(app => <RecentAppRow key={app.id} app={app} />)}
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: 'var(--space-5) var(--space-6)',
            borderBottom: '1px solid var(--bg-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Upcoming Interviews</h3>
            <a href="/interviews" style={{ fontSize: '0.8125rem', color: 'var(--text-accent)' }}>View all →</a>
          </div>
          <div style={{ padding: 'var(--space-4)' }}>
            {upcomingInterviews.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-10)' }}>
                <CalendarCheck size={32} opacity={0.3} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No upcoming interviews</p>
              </div>
            ) : (
              upcomingInterviews.map(iv => (
                <div key={iv.id} style={{
                  padding: 'var(--space-4)',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--space-3)',
                  borderLeft: '3px solid var(--brand-500)',
                }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    {iv.company} — Round {iv.round}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {iv.job_title} · {iv.type}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-accent)', marginTop: 6, fontWeight: 500 }}>
                    📅 {formatDate(iv.scheduled_at)}
                    {iv.interviewer && ` · ${iv.interviewer}`}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Subcomponents ───────────────────────────────────────────────
function StatCard({ label, value, icon, accentColor, sub }: {
  label: string; value: number | string; icon: React.ReactNode
  accentColor: string; sub?: string
}) {
  return (
    <div className="stat-card" style={{ '--stat-accent': accentColor } as React.CSSProperties}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-change">{sub}</div>}
      <div className="stat-icon">{icon}</div>
    </div>
  )
}

function RecentAppRow({ app }: { app: Application }) {
  return (
    <a href={`/applications/${app.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'var(--space-4) var(--space-6)',
        borderBottom: '1px solid var(--bg-border)',
        transition: 'background var(--transition-fast)',
        cursor: 'pointer',
      }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
            {app.company}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {app.job_title} · {formatSalary(app.salary_min, app.salary_max)}
          </div>
        </div>
        <StatusBadge status={app.status} />
      </div>
    </a>
  )
}
