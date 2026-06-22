'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Clock, CheckCircle2, Users, AlertCircle, 
  ChevronRight, Calendar, FolderKanban, Lightbulb, Bell,
  ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react'
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { 
  getCurrentUser, 
  fetchProjects, 
  fetchTasks, 
  fetchLeaveRequests, 
  fetchAllUsers, 
  fetchAttendance,
  fetchAssignments,
  type User 
} from '@/lib/data'
import { cn, formatDate } from '@/lib/utils'

const attendanceData = [
  { day: 'Mon', present: 87, late: 5, absent: 8 },
  { day: 'Tue', present: 92, late: 3, absent: 5 },
  { day: 'Wed', present: 78, late: 8, absent: 14 },
  { day: 'Thu', present: 95, late: 2, absent: 3 },
  { day: 'Fri', present: 89, late: 6, absent: 5 },
  { day: 'Sat', present: 45, late: 2, absent: 53 },
]

const taskTrendData = [
  { week: 'W1', completed: 24, created: 32 },
  { week: 'W2', completed: 38, created: 28 },
  { week: 'W3', completed: 29, created: 35 },
  { week: 'W4', completed: 45, created: 40 },
  { week: 'W5', completed: 52, created: 44 },
  { week: 'W6', completed: 41, created: 38 },
]

const projectStatusData = [
  { name: 'Active', value: 2, color: '#2563EB' },
  { name: 'Planning', value: 1, color: '#94A3B8' },
  { name: 'Completed', value: 1, color: '#475569' },
]

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [checkedIn, setCheckedIn] = useState(false)
  const [checkInTime, setCheckInTime] = useState('')
  const [myTasks, setMyTasks] = useState<any[]>([])
  const [projectsList, setProjectsList] = useState<any[]>([])
  const [stats, setStats] = useState({
    activeProjects: 0,
    myTasks: 0,
    myCompletedTasks: 0,
    pendingLeaves: 0,
    teamMembers: 0,
    totalClients: 0,
    totalProjects: 0,
    completedProjects: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      const currentUser = getCurrentUser()
      if (!currentUser) return
      setUser(currentUser)

      // Fetch dynamic stats from database
      const [allProjList, taskList, leaveList, userList, attendanceList, assignmentList] = await Promise.all([
        fetchProjects(),
        fetchTasks(),
        fetchLeaveRequests(),
        fetchAllUsers(),
        fetchAttendance(currentUser.id),
        fetchAssignments()
      ])

      // Check attendance for today
      const today = new Date().toISOString().split('T')[0]
      const todayAttendance = attendanceList.find(a => a.date === today)
      if (todayAttendance?.checkIn) {
        setCheckedIn(true)
        setCheckInTime(todayAttendance.checkIn)
      }

      const isAdmin = currentUser.role === 'super_admin' || currentUser.role === 'hr_admin'
      
      const userTasks = isAdmin ? taskList : taskList.filter(t => t.assigneeId === currentUser.id)
      
      let projList = allProjList
      if (!isAdmin) {
        const assignedProjectIds = new Set(assignmentList.filter(a => a.employeeId === currentUser.id).map(a => a.projectId))
        projList = allProjList.filter(p => 
          p.managerId === currentUser.id || 
          assignedProjectIds.has(p.id) ||
          userTasks.some(t => t.projectId === p.id)
        )
      }

      setMyTasks(userTasks)
      setProjectsList(projList)

      setStats({
        activeProjects: projList.filter(p => p.status === 'active').length,
        myTasks: userTasks.length,
        myCompletedTasks: userTasks.filter(t => t.status === 'done').length,
        pendingLeaves: leaveList.filter(l => l.status === 'pending').length,
        teamMembers: userList.filter(u => u.isActive && u.role !== 'client').length,
        totalClients: userList.filter(u => u.role === 'client').length,
        totalProjects: projList.length,
        completedProjects: projList.filter(p => p.status === 'completed').length
      })
      setIsLoading(false)
    }
    loadDashboardData()
  }, [])

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="spinner" />
      </div>
    )
  }

  const isAdmin = user.role === 'super_admin' || user.role === 'hr_admin';
  const statsCards = isAdmin ? [
    {
      label: 'Total Employees',
      value: stats.teamMembers,
      trend: 'Registered',
      trendUp: true,
      link: '/employees'
    },
    {
      label: 'Total Clients',
      value: stats.totalClients,
      trend: 'Registered',
      trendUp: true,
      link: '/clients'
    },
    {
      label: 'Total Projects',
      value: stats.totalProjects,
      trend: `${stats.activeProjects} active, ${stats.completedProjects} done`,
      trendUp: true,
      link: '/projects'
    },
    {
      label: 'Pending Leaves',
      value: stats.pendingLeaves,
      trend: 'Need approval',
      trendUp: false,
      link: '/attendance'
    },
  ] : [
    {
      label: 'Active Projects',
      value: stats.activeProjects,
      trend: 'Real-time database',
      trendUp: true,
      link: '/projects'
    },
    {
      label: 'My Tasks',
      value: stats.myTasks,
      trend: `${stats.myCompletedTasks} completed`,
      trendUp: true,
      link: '/projects'
    },
    {
      label: 'Pending Leaves',
      value: stats.pendingLeaves,
      trend: 'Need approval',
      trendUp: false,
      link: '/attendance'
    },
    {
      label: 'Team Members',
      value: stats.teamMembers,
      trend: 'Directory',
      trendUp: true,
      link: '/employees'
    },
  ]

  return (
    <div className="space-y-6 text-text">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-text-muted mt-1">{formatDate(new Date())} · Here&apos;s what&apos;s happening today</p>
        </div>
        {/* Check-in button */}
        <div className="hidden sm:block">
          {!checkedIn ? (
            <button
              onClick={() => { setCheckedIn(true); setCheckInTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })) }}
              className="btn btn-primary flex items-center gap-2 border-0 bg-primary text-white"
            >
              <Clock className="w-4 h-4" /> Check In
            </button>
          ) : (
            <div className="card px-4 py-2 flex items-center gap-2 bg-surface border-border shadow-none cursor-default hover:transform-none">
              <div className="status-dot status-dot-green" />
              <span className="text-sm text-text font-medium">Checked in at {checkInTime}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link href={card.link} className="no-underline">
              <div className="card p-5 border cursor-pointer bg-surface border-border hover:bg-surface-2 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{card.label}</span>
                  <ArrowUpRight className="w-4 h-4 text-text-subtle" />
                </div>
                <div className="text-2xl font-bold text-text mb-1">{card.value}</div>
                <div className={cn('flex items-center gap-1 text-xs font-semibold', card.trendUp ? 'text-success' : 'text-text-muted')}>
                  {card.trend}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Attendance chart */}
        <div className="lg:col-span-2 card p-5 bg-surface cursor-default hover:transform-none">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Weekly Attendance</h2>
            <span className="badge badge-gray">This week</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={attendanceData} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#1E293B' }}
                cursor={{ fill: 'rgba(37, 99, 235, 0.04)' }}
              />
              <Bar dataKey="present" fill="#2563EB" radius={[4, 4, 0, 0]} name="Present" />
              <Bar dataKey="late" fill="#94A3B8" radius={[4, 4, 0, 0]} name="Late" />
              <Bar dataKey="absent" fill="#E2E8F0" radius={[4, 4, 0, 0]} name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Project status */}
        <div className="card p-5 bg-surface cursor-default hover:transform-none">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Project Status</h2>
            <Link href="/projects" className="text-xs text-primary hover:underline flex items-center gap-1 no-underline">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex justify-center mb-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={projectStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                  {projectStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {projectStatusData.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                  <span className="text-sm text-text-muted">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-text">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* My tasks */}
        <div className="lg:col-span-2 card p-5 bg-surface cursor-default hover:transform-none">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">My Tasks</h2>
            <Link href="/projects" className="text-xs text-primary hover:underline flex items-center gap-1 no-underline font-medium">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-1">
            {myTasks.slice(0, 5).map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-2 transition-all cursor-pointer group">
                <div className={cn(
                  "status-dot",
                  task.status === 'done' ? 'status-dot-green' :
                  task.status === 'in_progress' ? 'status-dot-blue' :
                  task.status === 'review' ? 'status-dot-amber' : 'status-dot-gray'
                )} />
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium truncate", task.status === 'done' ? 'line-through text-text-muted' : 'text-text')}>
                    {task.title}
                  </p>
                  <p className="text-xs text-text-muted">{projectsList.find(p => p.id === task.projectId)?.name || 'Project'}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {task.dueDate && (
                    <span className={cn('text-xs font-semibold', new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'text-error' : 'text-text-muted')}>
                      {formatDate(task.dueDate)}
                    </span>
                  )}
                  <span className={cn('badge',
                    task.priority === 'critical' ? 'badge-red' :
                    task.priority === 'high' ? 'badge-amber' :
                    task.priority === 'medium' ? 'badge-blue' : 'badge-gray'
                  )}>
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
            {myTasks.length === 0 && (
              <div className="text-center py-8 text-text-muted">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-success/50" />
                <p className="text-sm">All caught up! No pending tasks.</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity feed */}
        <div className="card p-5 bg-surface cursor-default hover:transform-none">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Activity</h2>
            <Activity className="w-4 h-4 text-text-muted" />
          </div>
          <div className="space-y-4">
            {[
              { icon: CheckCircle2, color: 'text-text-muted bg-surface-2 border border-border', text: 'Authentication middleware completed', time: '2h ago' },
              { icon: Lightbulb, color: 'text-text-muted bg-surface-2 border border-border', text: 'New idea: AI meeting summarizer approved', time: '4h ago' },
              { icon: AlertCircle, color: 'text-text-muted bg-surface-2 border border-border', text: 'Problem: Deployment pipeline flagged', time: '5h ago' },
              { icon: FolderKanban, color: 'text-text-muted bg-surface-2 border border-border', text: 'Joined SAY IT Platform v2.0 project', time: '1d ago' },
              { icon: Bell, color: 'text-text-muted bg-surface-2 border border-border', text: 'Leave request approved for Jun 12', time: '3d ago' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', item.color)}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text leading-relaxed font-medium">{item.text}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task trend */}
      <div className="card p-5 bg-surface cursor-default hover:transform-none">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Task Completion Trend</h2>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2"><div className="w-3 h-2 rounded bg-primary" /><span className="text-text-muted">Completed</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-2 rounded bg-slate-300" /><span className="text-text-muted">Created</span></div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={taskTrendData}>
            <defs>
              <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#1E293B' }} />
            <Area type="monotone" dataKey="created" stroke="#CBD5E1" fill="rgba(203, 213, 225, 0.2)" strokeWidth={2} name="Created" />
            <Area type="monotone" dataKey="completed" stroke="#2563EB" fill="url(#completedGrad)" strokeWidth={2} name="Completed" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
