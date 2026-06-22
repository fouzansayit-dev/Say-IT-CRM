'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Calendar, CheckCircle2, XCircle, AlertCircle, Plus, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { 
  getCurrentUser, 
  fetchAttendance, 
  checkInEmployee, 
  checkOutEmployee, 
  fetchLeaveRequests, 
  createLeaveRequest, 
  updateLeaveRequestStatus, 
  type LeaveRequest, 
  type User 
} from '@/lib/data'
import { cn, formatDate } from '@/lib/utils'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function AttendancePage() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'leave' | 'feedback'>('overview')
  const [checkedIn, setCheckedIn] = useState(false)
  const [checkInTime, setCheckInTime] = useState('')
  const [checkOutTime, setCheckOutTime] = useState('')
  const [showLeaveForm, setShowLeaveForm] = useState(false)
  const [leaveForm, setLeaveForm] = useState({ type: 'annual', startDate: '', endDate: '', reason: '' })
  const [submitted, setSubmitted] = useState(false)
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([])
  const [currentAttendanceId, setCurrentAttendanceId] = useState<string>('')
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [hrLeaveFilter, setHrLeaveFilter] = useState<'pending' | 'all'>('pending')
  const [initialLoading, setInitialLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async (currentUser: User) => {
    const [attList, leaveList] = await Promise.all([
      fetchAttendance(currentUser.id),
      fetchLeaveRequests(['super_admin', 'hr_admin'].includes(currentUser.role as string) ? undefined : currentUser.id)
    ])
    setAttendanceHistory(attList)
    setLeaveRequests(leaveList)
    
    // Check if checked in today
    const todayStr = new Date().toISOString().split('T')[0]
    const todayRecord = attList.find(a => a.date === todayStr)
    if (todayRecord) {
      if (todayRecord.checkIn) {
        setCheckedIn(true)
        setCheckInTime(todayRecord.checkIn)
      }
      if (todayRecord.checkOut) {
        setCheckOutTime(todayRecord.checkOut)
      }
      setCurrentAttendanceId(todayRecord.id)
    }
  }

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      loadData(currentUser).then(() => setInitialLoading(false))
    }
  }, [])

  const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'rejected') => {
    if (!user) return
    setIsSubmitting(true)
    await updateLeaveRequestStatus(id, newStatus, user.id)
    const leaveList = await fetchLeaveRequests(['super_admin', 'hr_admin'].includes(user.role as string) ? undefined : user.id)
    setLeaveRequests(leaveList)
    setIsSubmitting(false)
  }

  if (!user || initialLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="spinner" />
    </div>
  )

  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()
  
  const myAttendance = attendanceHistory
  const myLeaves = leaveRequests.filter(l => l.employeeId === user.id)
  
  const presentDays = myAttendance.filter(a => a.status === 'present').length
  const lateDays = myAttendance.filter(a => a.status === 'late').length
  const totalWorkHours = myAttendance.reduce((acc, a) => acc + (a.workingHours || 0), 0)

  const handleCheckIn = async () => {
    if (!user) return
    setIsSubmitting(true)
    const t = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const res = await checkInEmployee(user.id, t)
    if (res) {
      setCheckedIn(true)
      setCheckInTime(t)
      setCurrentAttendanceId(res.id)
      const list = await fetchAttendance(user.id)
      setAttendanceHistory(list)
    }
    setIsSubmitting(false)
  }

  const handleCheckOut = async () => {
    if (!currentAttendanceId || !user) return
    setIsSubmitting(true)
    const t = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const res = await checkOutEmployee(currentAttendanceId, t)
    if (res) {
      setCheckOutTime(t)
      const list = await fetchAttendance(user.id)
      setAttendanceHistory(list)
    }
    setIsSubmitting(false)
  }

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSubmitting(true)
    
    const start = new Date(leaveForm.startDate)
    const end = new Date(leaveForm.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    
    const newRequest = await createLeaveRequest({
      employeeId: user.id,
      type: leaveForm.type as any,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      days: diffDays,
      reason: leaveForm.reason,
      status: 'pending'
    })
    
    if (newRequest) {
      const leaveList = await fetchLeaveRequests(['super_admin', 'hr_admin'].includes(user.role as string) ? undefined : user.id)
      setLeaveRequests(leaveList)
    }
    setIsSubmitting(false)

    setSubmitted(true)
    setTimeout(() => { 
      setShowLeaveForm(false)
      setSubmitted(false) 
      setLeaveForm({ type: 'annual', startDate: '', endDate: '', reason: '' })
    }, 2000)
  }

  // Build calendar days
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const calDays: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) calDays.push(null)
  for (let i = 1; i <= daysInMonth; i++) calDays.push(i)

  const getAttendanceForDay = (day: number) => {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return myAttendance.find(a => a.date === date)
  }

  return (
    <div className="space-y-6 text-text">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Attendance</h1>
          <p className="text-text-muted mt-1">{formatDate(new Date())}</p>
        </div>
        <button onClick={() => setShowLeaveForm(true)} className="btn btn-primary flex items-center gap-2 border-0 bg-primary text-white" disabled={isSubmitting}>
          <Plus className="w-4 h-4" /> Apply Leave
        </button>
      </div>

      {/* Check-in card */}
      <div className="card p-6 border border-border bg-surface hover:transform-none cursor-default">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-text mb-1">Today&apos;s Attendance</h2>
            <p className="text-text-muted text-sm">{DAYS[new Date().getDay()]} · {MONTHS[month]} {now.getDate()}, {year}</p>
          </div>
          <div className="flex items-center gap-6">
            {checkInTime && (
              <div className="text-center">
                <p className="text-xs text-text-muted font-medium">Check In</p>
                <p className="text-lg font-bold text-success">{checkInTime}</p>
              </div>
            )}
            {checkOutTime && (
              <div className="text-center">
                <p className="text-xs text-text-muted font-medium">Check Out</p>
                <p className="text-lg font-bold text-warning">{checkOutTime}</p>
              </div>
            )}
            {!checkedIn ? (
              <button onClick={handleCheckIn} className="btn btn-primary flex items-center gap-2 px-6 py-3 border-0 bg-primary text-white" disabled={isSubmitting}>
                <Clock className="w-4 h-4" /> Check In
              </button>
            ) : !checkOutTime ? (
              <button onClick={handleCheckOut} className="btn btn-secondary border-border border text-text hover:bg-surface-2 font-semibold px-6 py-3" disabled={isSubmitting}>
                <Clock className="w-4 h-4" /> Check Out
              </button>
            ) : (
              <div className="flex items-center gap-2 text-text bg-surface-2 border border-border px-4 py-2.5 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-text-muted" />
                <span className="font-medium text-sm">Day Complete</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Present Days', value: presentDays, icon: CheckCircle2, color: 'text-text-muted bg-surface-2 border border-border' },
          { label: 'Late Arrivals', value: lateDays, icon: AlertCircle, color: 'text-text-muted bg-surface-2 border border-border' },
          { label: 'Total Hours', value: `${totalWorkHours.toFixed(1)}h`, icon: Clock, color: 'text-text-muted bg-surface-2 border border-border' },
          { label: 'Leave Days', value: myLeaves.filter(l => l.status === 'approved').reduce((a, l) => a + l.days, 0), icon: Calendar, color: 'text-text-muted bg-surface-2 border border-border' },
        ].map(s => (
          <div key={s.label} className="card p-4 bg-surface cursor-default hover:transform-none">
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-3', s.color)}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-text">{s.value}</div>
            <div className="text-xs text-text-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-segment">
        {(['overview', 'calendar', 'leave', 'feedback'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'tab-seg-item border-0 bg-transparent',
              activeTab === tab && 'active'
            )}
          >
            {tab === 'leave' ? 'Leave Requests' : tab === 'feedback' ? 'HR Feedback' : tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="table-wrapper"
          >
            <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
              <h3 className="font-semibold text-text text-sm">Attendance History</h3>
              <button className="btn btn-ghost text-xs flex items-center gap-1">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th className="text-right">Hours</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {myAttendance.map(record => (
                    <tr key={record.id}>
                      <td className="w-8">
                        <div className={cn('status-dot',
                          record.status === 'present' ? 'status-dot-green' :
                          record.status === 'late' ? 'status-dot-amber' :
                          record.status === 'on_leave' ? 'status-dot-blue' : 'status-dot-gray'
                        )} />
                      </td>
                      <td className="font-medium">{formatDate(record.date)}</td>
                      <td className="text-text-muted">{record.checkIn || '—'}</td>
                      <td className="text-text-muted">{record.checkOut || '—'}</td>
                      <td className="text-right font-medium">{record.workingHours ? `${record.workingHours}h` : '—'}</td>
                      <td>
                        <span className={cn('badge capitalize',
                          record.status === 'present' ? 'badge-green' :
                          record.status === 'late' ? 'badge-amber' :
                          record.status === 'on_leave' ? 'badge-blue' : 'badge-gray'
                        )}>
                          {record.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'calendar' && (
          <motion.div key="calendar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="card p-5 bg-surface cursor-default hover:transform-none"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text">{MONTHS[month]} {year}</h3>
              <div className="flex gap-1">
                <button className="p-1 rounded hover:bg-surface-2 border-0 bg-transparent cursor-pointer"><ChevronLeft className="w-4 h-4 text-text-muted" /></button>
                <button className="p-1 rounded hover:bg-surface-2 border-0 bg-transparent cursor-pointer"><ChevronRight className="w-4 h-4 text-text-muted" /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map(d => <div key={d} className="text-xs text-center text-text-muted font-bold py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {calDays.map((day, i) => {
                if (!day) return <div key={i} />
                const att = getAttendanceForDay(day)
                const isToday = day === now.getDate()
                return (
                  <div key={i} className={cn(
                    'aspect-square flex flex-col items-center justify-center rounded-lg text-xs cursor-pointer transition-all border border-transparent',
                    isToday ? 'bg-primary text-white font-bold' : 'hover:bg-surface-2 border-slate-100',
                    att?.status === 'present' && !isToday ? 'bg-surface-2 text-text font-semibold border-border border' : '',
                    att?.status === 'late' && !isToday ? 'bg-surface-2 text-text-muted border-border border' : '',
                    att?.status === 'on_leave' && !isToday ? 'bg-surface-2 text-primary border-primary/20 border' : '',
                    !att && !isToday ? 'text-text-subtle' : '',
                  )}>
                    {day}
                    {att && <div className={cn('w-1 h-1 rounded-full mt-0.5',
                      att.status === 'present' ? 'bg-success' :
                      att.status === 'late' ? 'bg-warning' : 'bg-primary'
                    )} />}
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-6 mt-5 text-xs font-semibold text-text-muted">
              {[['bg-success', 'Present'], ['bg-warning', 'Late'], ['bg-primary', 'On Leave']].map(([color, label]) => (
                <div key={label} className="flex items-center gap-1.5"><div className={cn('w-2 h-2 rounded-full', color)} />{label}</div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'leave' && (() => {
          const sortedRequests = [...leaveRequests].sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1
            if (a.status !== 'pending' && b.status === 'pending') return 1
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          })

          const displayedRequests = ['super_admin', 'hr_admin'].includes(user.role as string)
            ? (hrLeaveFilter === 'pending' ? sortedRequests.filter(r => r.status === 'pending') : sortedRequests)
            : myLeaves

          return (
            <motion.div key="leave" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Leave balances */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { type: 'Annual Leave', total: 18, used: 3, color: 'progress-blue' },
                  { type: 'Sick Leave', total: 10, used: 0, color: 'progress-blue' },
                  { type: 'Emergency', total: 5, used: 0, color: 'progress-blue' },
                  { type: 'Unpaid', total: '∞', used: 0, color: 'progress-blue' },
                ].map(b => (
                  <div key={b.type} className="card p-4 bg-surface cursor-default hover:transform-none">
                    <p className="text-xs text-text-muted font-medium mb-1">{b.type}</p>
                    <p className="text-2xl font-bold text-text">{typeof b.total === 'number' ? b.total - b.used : '∞'}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">days remaining</p>
                    {typeof b.total === 'number' && (
                      <div className="progress-track mt-3">
                        <div className={cn("progress-fill", b.color)} style={{ width: `${(b.used / b.total) * 100}%` }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Leave requests list */}
              <div className="card overflow-hidden bg-surface border border-border cursor-default hover:transform-none">
                {['super_admin', 'hr_admin'].includes(user.role as string) ? (
                  <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
                    <h3 className="font-semibold text-text text-sm">Employee Leave Requests</h3>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setHrLeaveFilter('pending')}
                        className={cn(
                          'btn btn-secondary btn-sm py-1 px-3 border border-border text-xs rounded bg-surface text-text',
                          hrLeaveFilter === 'pending' && 'bg-surface-3 font-semibold border-text'
                        )}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => setHrLeaveFilter('all')}
                        className={cn(
                          'btn btn-secondary btn-sm py-1 px-3 border border-border text-xs rounded bg-surface text-text',
                          hrLeaveFilter === 'all' && 'bg-surface-3 font-semibold border-text'
                        )}
                      >
                        All Requests
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-b border-border bg-surface">
                    <h3 className="font-semibold text-text text-sm">My Leave Requests</h3>
                  </div>
                )}

                {displayedRequests.length === 0 ? (
                  <div className="p-10 text-center text-text-muted text-sm">
                    {['super_admin', 'hr_admin'].includes(user.role as string)
                      ? 'No leave requests requiring approval'
                      : 'No leave requests yet'}
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {displayedRequests.map(leave => (
                      <div key={leave.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 hover:bg-surface-2 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {['super_admin', 'hr_admin'].includes(user.role as string) && (
                              <span className="text-sm font-bold text-text">{leave.employeeName}</span>
                            )}
                            <span className="text-xs text-text-muted font-bold capitalize">
                              {leave.type} Leave
                            </span>
                          </div>
                          <p className="text-xs text-text-muted mt-1">
                            {formatDate(leave.startDate)} — {formatDate(leave.endDate)} · {leave.days}d
                          </p>
                          <p className="text-xs text-text mt-2 font-medium bg-surface-2 p-2 rounded border border-border/50 max-w-2xl leading-relaxed">
                            {leave.reason}
                          </p>
                        </div>

                        <div className="sm:ml-auto flex items-center gap-3">
                          {leave.status === 'pending' && ['super_admin', 'hr_admin'].includes(user.role as string) ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleStatusUpdate(leave.id, 'approved')}
                                className="btn btn-primary btn-sm bg-primary text-white border-0 py-1 px-3 flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(leave.id, 'rejected')}
                                className="btn btn-destructive btn-sm py-1 px-3 flex items-center gap-1"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Reject
                              </button>
                            </div>
                          ) : (
                            <>
                              {leave.approverName && (
                                <span className="text-xs text-text-muted font-medium">
                                  by {leave.approverName}
                                </span>
                              )}
                              <span className={cn('badge capitalize',
                                leave.status === 'approved' ? 'badge-green' :
                                leave.status === 'rejected' ? 'badge-red' : 'badge-amber'
                              )}>
                                {leave.status === 'approved' ? (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                ) : leave.status === 'rejected' ? (
                                  <XCircle className="w-3.5 h-3.5" />
                                ) : (
                                  <AlertCircle className="w-3.5 h-3.5" />
                                )}
                                {leave.status}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })()}
      </AnimatePresence>

      <AnimatePresence>
        {activeTab === 'feedback' && (
          <motion.div key="feedback" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="card p-6 bg-surface cursor-default hover:transform-none">
              <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
                <h3 className="font-semibold text-text text-sm">Performance & Feedback</h3>
                {['super_admin', 'hr_admin'].includes(user.role as string) && (
                  <button className="btn btn-primary flex items-center gap-2 border-0 bg-primary text-white text-xs py-1.5 px-3">
                    <Plus className="w-3.5 h-3.5" /> Give Feedback
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="p-4 border border-border bg-surface-2 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-amber">Warning</span>
                      <span className="text-xs font-semibold text-text">from HR Admin</span>
                    </div>
                    <span className="text-xs text-text-muted">2 days ago</span>
                  </div>
                  <p className="text-sm text-text">Consistent late arrivals noticed this week. Please ensure you are checking in by 9:00 AM.</p>
                </div>
                <div className="p-4 border border-border bg-surface-2 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-green">Commendation</span>
                      <span className="text-xs font-semibold text-text">from HR Admin</span>
                    </div>
                    <span className="text-xs text-text-muted">1 month ago</span>
                  </div>
                  <p className="text-sm text-text">Excellent performance reported by your project manager on the recent deployment.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leave application modal */}
      <AnimatePresence>
        {showLeaveForm && (
          <div
            className="modal-overlay"
            onClick={e => e.target === e.currentTarget && setShowLeaveForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal max-w-md bg-surface"
            >
              <div className="modal-header">
                <h3 className="text-lg font-bold text-text">Apply for Leave</h3>
              </div>
              <div className="modal-body">
                {submitted ? (
                  <div className="text-center py-6">
                    <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
                    <p className="text-text font-bold">Leave Request Submitted!</p>
                    <p className="text-text-muted text-sm mt-1">Your manager will be notified</p>
                  </div>
                ) : (
                  <form onSubmit={handleLeaveSubmit} className="space-y-4">
                    <div>
                      <label className="form-label">Leave Type</label>
                      <select className="form-select w-full" value={leaveForm.type} onChange={e => setLeaveForm(f => ({ ...f, type: e.target.value }))}>
                        <option value="annual">Annual Leave</option>
                        <option value="sick">Sick Leave</option>
                        <option value="emergency">Emergency Leave</option>
                        <option value="unpaid">Unpaid Leave</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="form-label">Start Date</label>
                        <input type="date" className="form-input" required value={leaveForm.startDate} onChange={e => setLeaveForm(f => ({ ...f, startDate: e.target.value }))} />
                      </div>
                      <div>
                        <label className="form-label">End Date</label>
                        <input type="date" className="form-input" required value={leaveForm.endDate} onChange={e => setLeaveForm(f => ({ ...f, endDate: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Reason</label>
                      <textarea className="form-input h-24 resize-none" placeholder="Describe your reason..." required value={leaveForm.reason} onChange={e => setLeaveForm(f => ({ ...f, reason: e.target.value }))} />
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button type="button" onClick={() => setShowLeaveForm(false)} className="flex-1 py-2.5 rounded-lg border border-border bg-transparent text-text-muted hover:bg-surface-2 transition-all text-sm font-semibold cursor-pointer">Cancel</button>
                      <button type="submit" className="flex-1 btn btn-primary py-2.5 bg-primary text-white border-0">Submit Request</button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
