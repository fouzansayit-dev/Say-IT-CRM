'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, ChevronRight, Users, Calendar, DollarSign, 
  Plus, GripVertical, Clock, CheckCircle2, Circle, 
  AlertCircle, FolderKanban, MessageSquare, X, Send
} from 'lucide-react'
import { 
  fetchProjects, 
  fetchTasks, 
  createTask, 
  updateTaskStatus, 
  fetchAllUsers, 
  getCurrentUser,
  fetchMilestones,
  createMilestone,
  updateMilestoneStatus,
  fetchAssignments,
  createAssignment,
  deleteAssignment,
  type Project, 
  type Task, 
  type User,
  type ProjectMilestone,
  type Assignment
} from '@/lib/data'
import { cn, formatDate, formatCurrency, getInitials } from '@/lib/utils'

const COLUMNS = [
  { id: 'backlog', label: 'Backlog', color: 'text-text-muted', bg: 'bg-surface-2 border-border' },
  { id: 'todo', label: 'To Do', color: 'text-primary', bg: 'bg-primary-50/50 border-primary-100' },
  { id: 'in_progress', label: 'In Progress', color: 'text-amber-500', bg: 'bg-amber-50/50 border-amber-100' },
  { id: 'review', label: 'Review', color: 'text-purple-500', bg: 'bg-purple-50/50 border-purple-100' },
  { id: 'done', label: 'Done', color: 'text-success', bg: 'bg-success-bg/50 border-success-border' },
]

const PRIORITY_DOT: Record<string, string> = {
  low: 'bg-gray-400', medium: 'bg-primary', high: 'bg-amber-500', critical: 'bg-error',
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'kanban' | 'list' | 'overview' | 'milestones' | 'assignments' | 'documents'>('kanban')
  
  // Selection and drag states
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  // Task creation form modal states
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    assigneeId: '',
    estimatedHours: '4',
    dueDate: '',
    labels: ''
  })

  const loadProjectData = async () => {
    setIsLoading(true)
    const currentUser = getCurrentUser()
    setUser(currentUser)
    
    const [projList, taskList, userList, mList, aList] = await Promise.all([
      fetchProjects(),
      fetchTasks(projectId),
      fetchAllUsers(),
      fetchMilestones(projectId),
      fetchAssignments(projectId)
    ])
    
    const foundProject = projList.find(p => p.id === projectId)
    if (foundProject) {
      setProject(foundProject)
      setTasks(taskList)
      setUsers(userList)
      setMilestones(mList)
      setAssignments(aList)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (projectId) {
      loadProjectData()
    }
  }, [projectId])

  const handleDrop = async (newStatus: string) => {
    if (!dragging) return
    const originalTasks = [...tasks]
    
    // Optimistic local state update
    setTasks(prev => prev.map(t => t.id === dragging ? { ...t, status: newStatus as Task['status'] } : t))
    setDragging(null)
    setDragOver(null)
    
    // Sync with backend
    const ok = await updateTaskStatus(dragging, newStatus)
    if (!ok) {
      // Revert if error
      setTasks(originalTasks)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.title.trim() || !project) return
    setIsSubmitting(true)

    const labelArray = newTask.labels
      ? newTask.labels.split(',').map(l => l.trim()).filter(Boolean)
      : []

    const created = await createTask({
      projectId: project.id,
      title: newTask.title,
      description: newTask.description,
      status: 'todo',
      priority: newTask.priority,
      assigneeId: newTask.assigneeId || undefined,
      estimatedHours: Number(newTask.estimatedHours) || 0,
      actualHours: 0,
      dueDate: newTask.dueDate || undefined,
      labels: labelArray,
      position: 0
    })

    if (created) {
      setTasks(prev => [created, ...prev])
      setShowTaskModal(false)
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        assigneeId: '',
        estimatedHours: '4',
        dueDate: '',
        labels: ''
      })
    }
    setIsSubmitting(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="spinner" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="card p-12 text-center bg-surface border border-border max-w-lg mx-auto">
        <FolderKanban className="w-12 h-12 mx-auto mb-3 text-text-subtle animate-pulse" />
        <p className="text-text-muted">Project not found or database sync failed.</p>
        <button onClick={() => router.push('/projects')} className="btn btn-secondary mt-4 border border-border bg-transparent text-text-muted hover:text-text px-4 py-2">
          Back to Projects
        </button>
      </div>
    )
  }

  const spentPercent = project.budget > 0 ? Math.round((project.spent / project.budget) * 100) : 0
  const canAddTask = user && ['super_admin', 'project_manager'].includes(user.role as string)

  return (
    <div className="space-y-6 text-text max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => router.push('/projects')} className="p-2 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text transition-all mt-1 border-0 bg-transparent cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-text-muted mb-1 font-semibold uppercase tracking-wider">
            <span>Projects</span><ChevronRight className="w-3 h-3 text-text-subtle" /><span className="text-text font-bold">{project.name}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text">{project.name}</h1>
              <p className="text-text-muted mt-1 text-sm max-w-3xl leading-relaxed">{project.description}</p>
            </div>
            {canAddTask && (
              <button 
                onClick={() => setShowTaskModal(true)}
                className="btn btn-primary flex items-center gap-2 flex-shrink-0 border-0 bg-primary text-white"
              >
                <Plus className="w-4 h-4" /> Add Task
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Meta cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 bg-surface border border-border cursor-default hover:transform-none">
          <div className="flex items-center gap-2 mb-2"><Calendar className="w-4 h-4 text-text-subtle" /><span className="text-xs text-text-muted font-bold uppercase">Deadline</span></div>
          <p className="font-bold text-text text-sm">{formatDate(project.deadline) || 'No deadline'}</p>
        </div>
        <div className="card p-4 bg-surface border border-border cursor-default hover:transform-none">
          <div className="flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4 text-text-subtle" /><span className="text-xs text-text-muted font-bold uppercase">Budget Info</span></div>
          <p className="font-bold text-text text-sm">{formatCurrency(project.spent)} <span className="text-text-muted font-normal text-xs">/ {formatCurrency(project.budget)}</span></p>
          <div className="progress-track mt-3.5">
            <div className={cn('progress-fill', spentPercent > 90 ? 'bg-error' : 'bg-success')} style={{ width: `${Math.min(spentPercent, 100)}%` }} />
          </div>
        </div>
        <div className="card p-4 bg-surface border border-border cursor-default hover:transform-none">
          <div className="flex items-center gap-2 mb-2"><CheckCircle2 className="w-4 h-4 text-text-subtle" /><span className="text-xs text-text-muted font-bold uppercase">Progress</span></div>
          <p className="font-bold text-text text-sm">{project.progress}% complete</p>
          <div className="progress-track mt-3.5">
            <div className="progress-fill bg-primary" style={{ width: `${project.progress}%` }} />
          </div>
        </div>
        <div className="card p-4 bg-surface border border-border cursor-default hover:transform-none">
          <div className="flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-text-subtle" /><span className="text-xs text-text-muted font-bold uppercase">Project PM</span></div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-6 h-6 rounded-full bg-surface-3 border border-border flex items-center justify-center text-[10px] font-bold text-text">
              {getInitials(project.managerName)}
            </div>
            <span className="text-xs font-semibold text-text truncate max-w-40">{project.managerName}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-segment p-1 gap-1 flex items-center overflow-x-auto">
        {(['kanban', 'list', 'overview', 'milestones', 'assignments', 'documents'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('tab-seg-item capitalize border-0 bg-transparent px-4 py-2 text-xs font-semibold cursor-pointer rounded-lg whitespace-nowrap',
              activeTab === tab && 'active'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Kanban board */}
      {activeTab === 'kanban' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {COLUMNS.map(col => {
              const colTasks = tasks.filter(t => t.status === col.id)
              return (
                <div
                  key={col.id}
                  className={cn('w-72 rounded-xl border transition-all flex flex-col bg-surface/50 p-2.5',
                    dragOver === col.id ? 'border-primary/50 bg-surface-2' : 'border-border'
                  )}
                  onDragOver={e => { e.preventDefault(); setDragOver(col.id) }}
                  onDrop={() => handleDrop(col.id)}
                  onDragLeave={() => setDragOver(null)}
                >
                  <div className="px-1 py-2 flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-bold">
                      <span className={cn('text-xs font-bold uppercase tracking-wider', col.color)}>{col.label}</span>
                      <span className="text-[10px] bg-surface-3 text-text-muted px-2 py-0.5 rounded-full border border-border font-semibold">{colTasks.length}</span>
                    </div>
                    {canAddTask && (
                      <button 
                        onClick={() => { setNewTask(prev => ({ ...prev, status: col.id })); setShowTaskModal(true) }}
                        className="text-text-muted hover:text-text p-0.5 hover:bg-surface-3 rounded cursor-pointer border-0 bg-transparent"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 flex-1 min-h-[350px]">
                    {colTasks.length === 0 ? (
                      <div className="h-full border border-dashed border-border-light rounded-xl flex items-center justify-center p-6 text-center text-xs text-text-subtle">
                        No tasks here
                      </div>
                    ) : (
                      colTasks.map(task => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={() => setDragging(task.id)}
                          onDragEnd={() => { setDragging(null); setDragOver(null) }}
                          onClick={() => setSelectedTask(task)}
                          className={cn(
                            'card p-3.5 cursor-grab active:cursor-grabbing hover:border-border hover:shadow-sm transition-all bg-surface border border-border/60 flex flex-col justify-between',
                            dragging === task.id ? 'opacity-50 scale-95' : ''
                          )}
                        >
                          <div>
                            <div className="flex items-start gap-2 mb-2">
                              <GripVertical className="w-3.5 h-3.5 text-text-subtle mt-0.5 flex-shrink-0" />
                              <p className="text-xs font-bold text-text leading-relaxed flex-1 line-clamp-2">{task.title}</p>
                            </div>
                            {task.labels.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3.5 pl-5">
                                {task.labels.map(l => (
                                  <span key={l} className="badge badge-gray text-[9px] px-1.5 py-0.5 font-bold">{l}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between pl-5 border-t border-border-light pt-2.5 mt-2">
                            <div className="flex items-center gap-1.5">
                              <div className={cn('w-2 h-2 rounded-full', PRIORITY_DOT[task.priority])} />
                              <span className="text-[10px] text-text-muted font-bold capitalize">{task.priority}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {task.dueDate && (
                                <div className="flex items-center gap-1 text-[10px] text-text-subtle font-semibold">
                                  <Clock className="w-3 h-3" />{formatDate(task.dueDate).split(',')[0]}
                                </div>
                              )}
                              {task.assigneeName && (
                                <div className="w-5 h-5 rounded-full bg-surface-3 border border-border flex items-center justify-center text-[9px] font-bold text-text" title={task.assigneeName}>
                                  {getInitials(task.assigneeName)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* List view */}
      {activeTab === 'list' && (
        <div className="card overflow-hidden bg-surface border border-border hover:transform-none">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-2/5">Task Name</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assignee</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-text-muted text-sm font-semibold">
                      No tasks logged in this project.
                    </td>
                  </tr>
                ) : (
                  tasks.map(task => (
                    <tr key={task.id} onClick={() => setSelectedTask(task)} className="cursor-pointer hover:bg-surface-2 transition-colors">
                      <td>
                        <div className="flex items-center gap-3">
                          {task.status === 'done' ? (
                            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-text-subtle flex-shrink-0" />
                          )}
                          <span className={cn('text-xs font-semibold', task.status === 'done' ? 'line-through text-text-muted' : 'text-text')}>
                            {task.title}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={cn('badge capitalize text-[10px]',
                          task.status === 'done' ? 'badge-green' : 
                          task.status === 'in_progress' ? 'badge-blue' :
                          task.status === 'review' ? 'badge-amber' : 'badge-gray'
                        )}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span className={cn('badge capitalize text-[10px]',
                          task.priority === 'critical' ? 'badge-red' : 
                          task.priority === 'high' ? 'badge-amber' :
                          task.priority === 'medium' ? 'badge-blue' : 'badge-gray'
                        )}>
                          {task.priority}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs text-text font-semibold">
                          {task.assigneeName || 'Unassigned'}
                        </span>
                      </td>
                      <td className="text-xs text-text-muted font-bold">{task.dueDate ? formatDate(task.dueDate) : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-5 bg-surface border border-border cursor-default hover:transform-none">
            <h3 className="text-sm font-bold text-text mb-4 pb-2 border-b border-border">Task Aggregates</h3>
            <div className="space-y-4">
              {COLUMNS.map(col => {
                const count = tasks.filter(t => t.status === col.id).length
                const pct = tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0
                return (
                  <div key={col.id} className="flex items-center gap-3">
                    <span className={cn('text-xs font-semibold w-24 capitalize', col.color)}>{col.label}</span>
                    <div className="flex-1 progress-track">
                      <div className="progress-fill bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-text-muted w-6 font-bold text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="card p-5 bg-surface border border-border cursor-default hover:transform-none">
            <h3 className="text-sm font-bold text-text mb-4 pb-2 border-b border-border">General Information</h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border-light">
                <span className="text-text-muted font-medium">Department</span>
                <span className="font-bold">{project.department || 'Engineering'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border-light">
                <span className="text-text-muted font-medium">Project ID</span>
                <span className="font-bold font-mono text-[10px]">{project.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border-light">
                <span className="text-text-muted font-medium">Estimated Timeframe</span>
                <span className="font-bold">Active Board</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-text-muted font-medium">Total Project Tasks</span>
                <span className="font-bold">{tasks.length} tasks logged</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Milestones Tab Placeholder */}
      {activeTab === 'milestones' && (
        <div className="card p-6 bg-surface border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-text text-lg">Project Milestones</h3>
            {canAddTask && (
              <button className="btn btn-primary text-xs px-3 py-1.5 flex items-center gap-1 border-0 bg-primary text-white">
                <Plus className="w-3.5 h-3.5" /> Add Milestone
              </button>
            )}
          </div>
          
          {milestones.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <FolderKanban className="w-8 h-8 mx-auto mb-3 text-text-subtle" />
              <p className="text-sm">No milestones have been defined for this project.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {milestones.map(m => (
                <div key={m.id} className="flex items-start gap-4 p-4 border border-border rounded-lg bg-surface-2">
                  <div className="pt-1">
                    {m.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <Circle className="w-5 h-5 text-text-subtle" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={cn("font-bold text-sm", m.status === 'completed' ? "text-text-muted line-through" : "text-text")}>{m.title}</h4>
                    <p className="text-xs text-text-muted mt-1">{m.description}</p>
                    {m.dueDate && (
                      <div className="flex items-center gap-1 mt-3 text-xs text-text-subtle font-semibold">
                        <Calendar className="w-3 h-3" /> Due {formatDate(m.dueDate)}
                      </div>
                    )}
                  </div>
                  {canAddTask && m.status === 'pending' && (
                    <button className="btn btn-secondary text-[10px] px-2 py-1">Mark Complete</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Assignments Tab Placeholder */}
      {activeTab === 'assignments' && (
        <div className="card p-6 bg-surface border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-text text-lg">Project Assignments</h3>
            {canAddTask && (
              <button className="btn btn-primary text-xs px-3 py-1.5 flex items-center gap-1 border-0 bg-primary text-white">
                <Users className="w-3.5 h-3.5" /> Assign Team Member
              </button>
            )}
          </div>
          
          {assignments.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <Users className="w-8 h-8 mx-auto mb-3 text-text-subtle" />
              <p className="text-sm">No team members assigned specifically to this project yet.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignments.map(a => {
                const member = users.find(u => u.id === a.employeeId)
                if (!member) return null
                return (
                  <div key={a.id} className="flex items-center gap-3 p-4 border border-border rounded-lg bg-surface-2">
                    <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center font-bold text-text">
                      {getInitials(member.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-text truncate">{member.name}</p>
                      <p className="text-xs text-text-muted truncate">{member.position}</p>
                    </div>
                    {canAddTask && (
                      <button className="p-1.5 rounded-md hover:bg-surface-3 text-error cursor-pointer bg-transparent border-0">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Documents Tab Placeholder */}
      {activeTab === 'documents' && (
        <div className="card p-6 bg-surface border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-text text-lg">Project Documents & Invoices</h3>
            {canAddTask && (
              <button className="btn btn-primary text-xs px-3 py-1.5 flex items-center gap-1 border-0 bg-primary text-white">
                <Plus className="w-3.5 h-3.5" /> Upload File
              </button>
            )}
          </div>
          <div className="text-center py-12 text-text-muted border-2 border-dashed border-border rounded-xl">
            <FolderKanban className="w-8 h-8 mx-auto mb-3 text-text-subtle" />
            <p className="text-sm font-semibold mb-1">Drag & drop files here</p>
            <p className="text-xs">Support for PDF, DOCX, XLSX, and images up to 50MB</p>
          </div>
        </div>
      )}

      {/* Task detail modal dialog */}
      <AnimatePresence>
        {selectedTask && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
            onClick={e => e.target === e.currentTarget && setSelectedTask(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-lg bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-10"
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn('badge capitalize text-[9px]',
                      selectedTask.priority === 'critical' ? 'badge-red' : 
                      selectedTask.priority === 'high' ? 'badge-amber' :
                      selectedTask.priority === 'medium' ? 'badge-blue' : 'badge-gray'
                    )}>{selectedTask.priority}</span>
                    <span className={cn('badge capitalize text-[9px]',
                      selectedTask.status === 'done' ? 'badge-green' : 
                      selectedTask.status === 'in_progress' ? 'badge-blue' :
                      selectedTask.status === 'review' ? 'badge-amber' : 'badge-gray'
                    )}>{selectedTask.status.replace('_', ' ')}</span>
                  </div>
                  <h3 className="text-sm font-bold text-text leading-snug">{selectedTask.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedTask(null)} 
                  className="p-1 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text cursor-pointer border-0 bg-transparent"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                <p className="text-xs text-text-muted leading-relaxed whitespace-pre-wrap">{selectedTask.description || 'No description provided.'}</p>
                
                <div className="grid grid-cols-2 gap-3.5 pt-2">
                  {[
                    { label: 'Assignee', value: selectedTask.assigneeName || 'Unassigned' },
                    { label: 'Due Date', value: selectedTask.dueDate ? formatDate(selectedTask.dueDate) : '—' },
                    { label: 'Est. Hours', value: `${selectedTask.estimatedHours} hrs` },
                    { label: 'Actual Hours', value: `${selectedTask.actualHours} hrs` },
                  ].map(f => (
                    <div key={f.label} className="bg-surface-2 rounded-lg p-3 border border-border-light">
                      <p className="text-[10px] text-text-muted font-bold uppercase">{f.label}</p>
                      <p className="text-xs font-semibold text-text mt-1">{f.value}</p>
                    </div>
                  ))}
                </div>

                {selectedTask.labels.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[10px] text-text-muted font-bold uppercase mb-2">Labels</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTask.labels.map(l => (
                        <span key={l} className="badge badge-gray text-[9px] font-bold px-2 py-0.5">{l}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Task Creation Modal Form */}
      <AnimatePresence>
        {showTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setShowTaskModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-10"
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h3 className="font-bold text-text text-base flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-primary" /> Create New Task
                </h3>
                <button 
                  onClick={() => setShowTaskModal(false)}
                  disabled={isSubmitting}
                  className="p-1 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text transition-all cursor-pointer border-0 bg-transparent"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div>
                  <label className="form-label text-xs">Task Title</label>
                  <input 
                    type="text"
                    required
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="e.g. Design relational database DDL"
                    className="form-input text-xs"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="form-label text-xs">Description</label>
                  <textarea 
                    rows={3}
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Describe task scope, endpoints to target, acceptance metrics..."
                    className="form-input text-xs resize-none"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label text-xs">Due Date</label>
                    <input 
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                      className="form-input text-xs"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">Estimated Hours</label>
                    <input 
                      type="number"
                      required
                      value={newTask.estimatedHours}
                      onChange={(e) => setNewTask({...newTask, estimatedHours: e.target.value})}
                      placeholder="e.g. 8"
                      className="form-input text-xs"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label text-xs">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})}
                      className="form-select w-full text-xs"
                      disabled={isSubmitting}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label text-xs">Assignee</label>
                    <select
                      value={newTask.assigneeId}
                      onChange={(e) => setNewTask({...newTask, assigneeId: e.target.value})}
                      className="form-select w-full text-xs"
                      disabled={isSubmitting}
                    >
                      <option value="">Unassigned</option>
                      {users
                        .filter(u => u.role !== 'client')
                        .map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.position})</option>
                        ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label text-xs">Labels (comma-separated)</label>
                  <input 
                    type="text"
                    value={newTask.labels}
                    onChange={(e) => setNewTask({...newTask, labels: e.target.value})}
                    placeholder="e.g. backend, schema, auth"
                    className="form-input text-xs"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="border-t border-border pt-4 mt-6 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowTaskModal(false)}
                    className="btn btn-secondary text-xs px-4 py-2 border-0 bg-transparent hover:bg-surface-2 text-text-muted"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary text-xs px-4 py-2 flex items-center gap-1 border-0 bg-primary text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="spinner w-3.5 h-3.5 border-1.5" />
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Create Task
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
