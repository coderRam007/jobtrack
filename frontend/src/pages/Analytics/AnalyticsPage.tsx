import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend, LineChart, Line,
} from 'recharts'
import { TrendingUp, Target, BarChart3 } from 'lucide-react'
import { mockApplications } from '../../data/mockData'
import { STATUS_LABELS, STATUS_COLORS } from '../../utils/helpers'
import type { AppStatus } from '../../types'

// ─── Build chart data ─────────────────────────────────────────────
const statusData = Object.entries(STATUS_LABELS).map(([k, label]) => ({
  status: label,
  count: mockApplications.filter(a => a.status === k).length,
  color: STATUS_COLORS[k as AppStatus],
})).filter(d => d.count > 0)

const sourceData = (() => {
  const counts: Record<string, number> = {}
  mockApplications.forEach(a => { counts[a.source] = (counts[a.source] ?? 0) + 1 })
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
})()

const locationData = (() => {
  const counts: Record<string, number> = {}
  mockApplications.forEach(a => {
    const city = a.location.split(',')[0].trim()
    counts[city] = (counts[city] ?? 0) + 1
  })
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
})()

const weeklyData = (() => {
  const weeks: Record<string, number> = {}
  const now = new Date()
  mockApplications.forEach(a => {
    const d = new Date(a.application_date)
    const weekDiff = Math.floor((now.getTime() - d.getTime()) / (7 * 86400000))
    const label = weekDiff === 0 ? 'This week' : `${weekDiff}w ago`
    weeks[label] = (weeks[label] ?? 0) + 1
  })
  return Object.entries(weeks).reverse().map(([week, apps]) => ({ week, apps }))
})()

const radarData = [
  { subject: 'Response Rate', value: 62.5 },
  { subject: 'Interview Rate', value: 37.5 },
  { subject: 'Offer Rate', value: 12.5 },
  { subject: 'Applications/wk', value: 75 },
  { subject: 'Diversity', value: 60 },
]

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '0.875rem' }}>
      {label && <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || 'var(--text-primary)', fontWeight: 600 }}>{p.name || ''}: {p.value}</div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const total = mockApplications.length
  const offers = mockApplications.filter(a => a.status === 'OFFER').length

  return (
    <div className="app-content animate-fadein">
      <div className="page-header">
        <div>
          <h2 className="page-title">Analytics</h2>
          <p className="page-subtitle">Insights into your job search performance</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <KPICard
          icon={<TrendingUp size={24} color="var(--brand-400)" />}
          label="Response Rate"
          value="62.5%"
          description="Applications that received a reply"
          color="var(--brand-500)"
        />
        <KPICard
          icon={<BarChart3 size={24} color="#8b5cf6" />}
          label="Interview Conversion"
          value="37.5%"
          description="Applications reaching interview stage"
          color="#8b5cf6"
        />
        <KPICard
          icon={<Target size={24} color="var(--success)" />}
          label="Offer Rate"
          value={`${((offers / total) * 100).toFixed(1)}%`}
          description="Applications resulting in offers"
          color="var(--success)"
        />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
        {/* Status Breakdown */}
        <div className="chart-card">
          <div className="chart-title">
            <BarChart3 size={18} color="var(--brand-400)" />
            Applications by Status
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" />
              <XAxis dataKey="status" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {statusData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Source Distribution */}
        <div className="chart-card">
          <div className="chart-title">
            <Target size={18} color="var(--brand-400)" />
            Applications by Source
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sourceData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]}>
                {sourceData.map((_, idx) => (
                  <Cell key={idx} fill={['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'][idx % 6]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Trend */}
        <div className="chart-card">
          <div className="chart-title">
            <TrendingUp size={18} color="var(--brand-400)" />
            Weekly Application Trend
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyData} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" />
              <XAxis dataKey="week" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="apps"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ fill: '#6366f1', r: 5 }}
                activeDot={{ r: 7, stroke: '#818cf8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Location Distribution */}
        <div className="chart-card">
          <div className="chart-title">
            <BarChart3 size={18} color="var(--brand-400)" />
            Applications by Location
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={locationData} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {locationData.map((_, idx) => (
                  <Cell key={idx} fill={['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'][idx % 5]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart */}
        <div className="chart-card" style={{ gridColumn: 'span 2' }}>
          <div className="chart-title">
            <Target size={18} color="var(--brand-400)" />
            Performance Overview
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="var(--bg-border)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <Radar
                name="Performance"
                dataKey="value"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Legend
                formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{value}</span>}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function KPICard({ icon, label, value, description, color }: {
  icon: React.ReactNode; label: string; value: string; description: string; color: string
}) {
  return (
    <div className="card" style={{ borderTop: `3px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
        {icon}
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
        {value}
      </div>
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{description}</p>
    </div>
  )
}
