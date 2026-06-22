'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Download, Clock, CheckCircle2, FolderKanban, TrendingUp, Calendar, Shield
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts'
import { cn } from '@/lib/utils'
import { getCurrentUser, type User } from '@/lib/data'
import { useEffect } from 'react'

const attendanceMonthly = [
  { month: 'Jan', rate: 94 }, { month: 'Feb', rate: 91 }, { month: 'Mar', rate: 96 },
  { month: 'Apr', rate: 89 }, { month: 'May', rate: 93 }, { month: 'Jun', rate: 88 },
]

const projectCompletionData = [
  { name: 'SAY IT v2', done: 45, remaining: 55 },
  { name: 'Mobile App', done: 62, remaining: 38 },
  { name: 'Analytics', done: 12, remaining: 88 },
  { name: 'Portal', done: 100, remaining: 0 },
]

const ideaCategoryData = [
  { name: 'Technology', value: 8, color: '#2563EB' },
  { name: 'Process', value: 5, color: '#475569' },
  { name: 'People', value: 3, color: '#94A3B8' },
  { name: 'Cost Saving', value: 2, color: '#CBD5E1' },
]

const leaveTypeData = [
  { month: 'Jan', annual: 12, sick: 5, emergency: 2 },
  { month: 'Feb', annual: 8, sick: 9, emergency: 1 },
  { month: 'Mar', annual: 15, sick: 4, emergency: 3 },
  { month: 'Apr', annual: 10, sick: 7, emergency: 0 },
  { month: 'May', annual: 18, sick: 3, emergency: 2 },
  { month: 'Jun', annual: 14, sick: 6, emergency: 1 },
]

const deptProductivityData = [
  { dept: 'Engineering', tasks: 48, completion: 87 },
  { dept: 'Product', tasks: 32, completion: 92 },
  { dept: 'Design', tasks: 24, completion: 78 },
  { dept: 'HR', tasks: 15, completion: 95 },
]

const TOOLTIP_STYLE = {
  contentStyle: { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#1E293B' },
  cursor: { fill: 'rgba(37, 99, 235, 0.04)' }
}

export default function ReportsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<'attendance' | 'projects' | 'ideas' | 'hr'>('attendance')
  const [dateRange, setDateRange] = useState('last_6_months')

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  const kpiCards = [
    { label: 'Avg Attendance Rate', value: '91.8%', trend: '+2.3%', trendUp: true },
    { label: 'Task Completion', value: '87.4%', trend: '+5.1%', trendUp: true },
    { label: 'Active Projects', value: '4', trend: '0', trendUp: true },
    { label: 'Ideas Submitted', value: '23', trend: '+7 this month', trendUp: true },
  ]

  if (user && !['super_admin', 'hr_admin'].includes(user.role as string)) {
    return (
      <div className="card p-12 text-center bg-surface border border-border max-w-xl mx-auto mt-12">
        <Shield className="w-12 h-12 mx-auto mb-4 text-text-subtle" />
        <h2 className="text-lg font-bold text-text mb-2">Access Denied</h2>
        <p className="text-text-muted text-sm leading-relaxed">
          You do not have permission to view this page. System and HR analytics reports are restricted to authorized administrators.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-text">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Reports & Analytics</h1>
          <p className="text-text-muted mt-1">Data-driven insights for better decisions</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="form-select w-auto">
            <option value="last_30_days">Last 30 days</option>
            <option value="last_3_months">Last 3 months</option>
            <option value="last_6_months">Last 6 months</option>
            <option value="this_year">This year</option>
          </select>
          <button className="btn btn-primary flex items-center gap-2 border-0 bg-primary text-white">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div className="card p-5 bg-surface border border-border cursor-default hover:transform-none">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{kpi.label}</span>
                <span className={cn('text-xs font-semibold', kpi.trendUp ? 'text-success' : 'text-text-muted')}>
                  {kpi.trend}
                </span>
              </div>
              <div className="text-3xl font-bold text-text mb-1">{kpi.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Report tabs */}
      <div className="tab-segment">
        {(['attendance', 'projects', 'ideas', 'hr'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('tab-seg-item border-0 bg-transparent cursor-pointer capitalize', activeTab === tab && 'active')}
          >
            {tab === 'hr' ? 'HR Metrics' : tab}
          </button>
        ))}
      </div>

      {/* Attendance report */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-5 bg-surface cursor-default hover:transform-none">
              <h3 className="section-title mb-4">Monthly Attendance Rate</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={attendanceMonthly}>
                  <defs>
                    <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[80, 100]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="rate" stroke="#2563EB" fill="url(#attGrad)" strokeWidth={2} name="Attendance %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-5 bg-surface cursor-default hover:transform-none">
              <h3 className="section-title mb-4">Leave Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={leaveTypeData} barSize={10}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ color: '#64748B', fontSize: '12px', fontWeight: '600' }} />
                  <Bar dataKey="annual" fill="#2563EB" radius={[4, 4, 0, 0]} name="Annual" />
                  <Bar dataKey="sick" fill="#94A3B8" radius={[4, 4, 0, 0]} name="Sick" />
                  <Bar dataKey="emergency" fill="#E2E8F0" radius={[4, 4, 0, 0]} name="Emergency" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="table-wrapper bg-surface">
            <div className="p-4 border-b border-border bg-surface"><h3 className="section-title">Attendance Summary by Employee</h3></div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Present</th>
                    <th>Late</th>
                    <th>Absent</th>
                    <th className="text-right">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Marcus Johnson', dept: 'Engineering', present: 22, late: 1, absent: 0, rate: 96 },
                    { name: 'Emily Rodriguez', dept: 'Design', present: 20, late: 3, absent: 0, rate: 91 },
                    { name: 'David Kim', dept: 'Engineering', present: 21, late: 2, absent: 0, rate: 93 },
                    { name: 'Lisa Thompson', dept: 'Product', present: 19, late: 0, absent: 4, rate: 82 },
                    { name: 'James Wilson', dept: 'Product', present: 22, late: 0, absent: 1, rate: 96 },
                  ].map(emp => (
                    <tr key={emp.name}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full avatar flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold">{emp.name}</p>
                            <p className="text-xs text-text-muted font-normal mt-0.5">{emp.dept}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-success font-semibold">{emp.present} present</td>
                      <td className="text-warning font-semibold">{emp.late} late</td>
                      <td className="text-error font-semibold">{emp.absent} absent</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 progress-track min-w-20">
                            <div className="progress-fill progress-blue" style={{ width: `${emp.rate}%` }} />
                          </div>
                          <span className="text-xs text-text-muted font-bold w-8">{emp.rate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Projects report */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-5 bg-surface cursor-default hover:transform-none">
              <h3 className="section-title mb-4">Project Completion %</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={projectCompletionData} layout="vertical" barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="done" fill="#2563EB" radius={[0, 4, 4, 0]} name="Completed %" stackId="a" />
                  <Bar dataKey="remaining" fill="#E2E8F0" radius={[0, 4, 4, 0]} name="Remaining %" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-5 bg-surface cursor-default hover:transform-none">
              <h3 className="section-title mb-4">Department Productivity</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptProductivityData} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="dept" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="completion" fill="#10B981" radius={[4, 4, 0, 0]} name="Completion %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Ideas report */}
      {activeTab === 'ideas' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-5 bg-surface cursor-default hover:transform-none">
            <h3 className="section-title mb-4">Ideas by Category</h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={ideaCategoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={3} dataKey="value">
                    {ideaCategoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 flex-1">
                {ideaCategoryData.map(item => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                      <span className="text-sm text-text-muted">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-text">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="card p-5 bg-surface cursor-default hover:transform-none">
            <h3 className="section-title mb-4">Innovation Pipeline</h3>
            <div className="space-y-4">
              {[
                { label: 'Submitted', count: 23, color: 'progress-blue', pct: 100 },
                { label: 'Under Review', count: 8, color: 'progress-blue', pct: 35 },
                { label: 'Approved', count: 5, color: 'progress-blue', pct: 22 },
                { label: 'Implemented', count: 2, color: 'progress-blue', pct: 9 },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="text-sm text-text-muted font-medium w-28">{s.label}</span>
                  <div className="flex-1 progress-track">
                    <div className={cn('progress-fill', s.color)} style={{ width: `${s.pct}%` }} />
                  </div>
                  <span className="text-sm font-bold text-text w-4">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HR report */}
      {activeTab === 'hr' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Headcount', value: '8', sub: 'active employees', change: '+2 this quarter' },
              { title: 'Avg Tenure', value: '2.1 yrs', sub: 'average tenure', change: 'Stable' },
              { title: 'Retention Rate', value: '94%', sub: 'employee retention', change: '+3% vs last year' },
            ].map(card => (
              <div key={card.title} className="card p-5 bg-surface border border-border cursor-default hover:transform-none">
                <p className="text-text-muted text-sm font-medium mb-1.5">{card.title}</p>
                <p className="text-4xl font-bold text-text mb-1">{card.value}</p>
                <p className="text-xs text-text-muted font-medium">{card.sub}</p>
                <p className="text-xs text-text-muted font-semibold mt-3">{card.change}</p>
              </div>
            ))}
          </div>
          <div className="table-wrapper bg-surface">
            <div className="p-4 border-b border-border bg-surface"><h3 className="section-title">Leave Balance Overview</h3></div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th className="text-center">Annual (rem.)</th>
                    <th className="text-center">Sick (rem.)</th>
                    <th className="text-center">Emergency (rem.)</th>
                    <th className="text-center">Days Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Marcus Johnson', annual: 15, sick: 10, emergency: 5, taken: 3 },
                    { name: 'Emily Rodriguez', annual: 18, sick: 8, emergency: 5, taken: 0 },
                    { name: 'David Kim', annual: 12, sick: 10, emergency: 5, taken: 6 },
                    { name: 'Lisa Thompson', annual: 16, sick: 6, emergency: 5, taken: 4 },
                  ].map(emp => (
                    <tr key={emp.name}>
                      <td className="font-semibold">{emp.name}</td>
                      <td className="text-center text-text font-semibold">{emp.annual}</td>
                      <td className="text-center text-text-muted font-semibold">{emp.sick}</td>
                      <td className="text-center text-text-muted font-semibold">{emp.emergency}</td>
                      <td className="text-center text-text-muted font-semibold">{emp.taken}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
