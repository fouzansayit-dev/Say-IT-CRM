'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Plus, Search, FolderKanban, Users, Calendar, TrendingUp,
  MoreHorizontal, Shield, X, HelpCircle
} from 'lucide-react'
import { fetchProjects, createProject, fetchAllUsers, getCurrentUser, type User, type Project } from '@/lib/data'
import { cn, formatDate, formatCurrency } from '@/lib/utils'

const STATUS_COLORS = {
  active: 'badge-blue',
  planning: 'badge-gray',
  on_hold: 'badge-gray',
  completed: 'badge-gray',
  cancelled: 'badge-gray',
}

const PRIORITY_COLORS = {
  low: 'badge-gray',
  medium: 'badge-gray',
  high: 'badge-gray',
  critical: 'badge-gray',
}

const PRIORITY_BARS = {
  low: 'progress-blue',
  medium: 'progress-blue',
  high: 'progress-blue',
  critical: 'progress-blue',
}

export default function ProjectsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    startDate: '',
    deadline: '',
    budget: '',
    estimatedHours: '',
    category: '',
    techStack: '',
    managerId: '',
    clientId: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    status: 'planning' as 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled',
    department: 'Engineering'
  })

  useEffect(() => {
    const loadData = async () => {
      setUser(getCurrentUser())
      const [projList, userList] = await Promise.all([
        fetchProjects(),
        fetchAllUsers()
      ])
      setProjects(projList)
      setUsers(userList)
      setIsLoading(false)
    }
    loadData()
  }, [])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return

    const newProj = await createProject({
      name: form.name,
      code: form.code || undefined,
      description: form.description,
      status: form.status,
      priority: form.priority,
      budget: Number(form.budget) || 0,
      spent: 0,
      startDate: form.startDate || undefined,
      deadline: form.deadline,
      estimatedHours: Number(form.estimatedHours) || 0,
      actualHours: 0,
      managerId: form.managerId,
      department: form.department,
      progress: 0,
      clientId: form.clientId || undefined,
      category: form.category || undefined,
      techStack: form.techStack ? form.techStack.split(',').map(s => s.trim()) : [],
    })

    if (newProj) {
      setProjects([newProj, ...projects])
      setShowModal(false)
      setForm({
        name: '',
        code: '',
        description: '',
        startDate: '',
        deadline: '',
        budget: '',
        estimatedHours: '',
        category: '',
        techStack: '',
        managerId: '',
        clientId: '',
        priority: 'medium',
        status: 'planning',
        department: 'Engineering'
      })
    }
  }

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  if (user && user.role === 'hr_admin') {
    return (
      <div className="card p-12 text-center bg-surface border border-border max-w-xl mx-auto mt-12">
        <Shield className="w-12 h-12 mx-auto mb-4 text-text-subtle" />
        <h2 className="text-lg font-bold text-text mb-2">Access Denied</h2>
        <p className="text-text-muted text-sm leading-relaxed">
          HR administrators do not have access to the projects and tasks workspace. This view is restricted to engineering and product team members.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="spinner" />
      </div>
    )
  }

  const canAddProject = user && user.role && ['super_admin', 'project_manager'].includes(user.role as string)

  return (
    <div className="space-y-6 text-text max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Projects</h1>
          <p className="text-text-muted mt-1">{filtered.length} projects</p>
        </div>
        {canAddProject && (
          <button 
            onClick={() => setShowModal(true)}
            className="btn btn-primary flex items-center gap-2 border-0 bg-primary text-white"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active', value: projects.filter(p => p.status === 'active').length, color: 'text-text' },
          { label: 'Planning', value: projects.filter(p => p.status === 'planning').length, color: 'text-text-muted' },
          { label: 'Completed', value: projects.filter(p => p.status === 'completed').length, color: 'text-text-muted' },
          { label: 'Total Budget', value: formatCurrency(projects.reduce((a, p) => a + p.budget, 0)), color: 'text-text-muted' },
        ].map(s => (
          <div key={s.label} className="card p-4 bg-surface border border-border cursor-default hover:transform-none">
            <div className={cn('text-xl font-bold', s.color)}>{s.value}</div>
            <div className="text-xs text-text-muted mt-1 font-semibold">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." className="form-input pl-9" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-select w-auto">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="planning">Planning</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
        </select>
        <div className="tab-segment p-1 gap-1 flex items-center">
          <button onClick={() => setView('grid')} className={cn('tab-seg-item p-2 rounded border-0 bg-transparent', view === 'grid' && 'active')}>
            <FolderKanban className="w-4 h-4" />
          </button>
          <button onClick={() => setView('list')} className={cn('tab-seg-item p-2 rounded border-0 bg-transparent', view === 'list' && 'active')}>
            <TrendingUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Projects */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center bg-surface border border-border hover:transform-none">
          <FolderKanban className="w-12 h-12 mx-auto mb-3 text-text-subtle" />
          <p className="text-text-muted font-medium">No projects found</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project, i) => (
            <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link href={`/projects/${project.id}`} className="no-underline">
                <div className="card p-5 cursor-pointer h-full flex flex-col bg-surface border border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg border border-border bg-surface-2 flex items-center justify-center">
                      <FolderKanban className="w-5 h-5 text-text-muted" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('badge', PRIORITY_COLORS[project.priority])}>{project.priority}</span>
                      <button className="text-text-muted hover:text-text cursor-pointer border-0 bg-transparent" onClick={e => e.preventDefault()}>
                        <MoreHorizontal className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-text mb-1.5 text-sm">{project.name}</h3>
                  <p className="text-xs text-text-muted line-clamp-2 mb-4 flex-1">{project.description}</p>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5 font-semibold">
                      <span className="text-text-muted">Progress</span>
                      <span className="text-text">{project.progress}%</span>
                    </div>
                    <div className="progress-track">
                      <div className={cn('progress-fill', PRIORITY_BARS[project.priority])} style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className={cn('badge capitalize', STATUS_COLORS[project.status])}>{project.status.replace('_', ' ')}</span>
                    <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(project.deadline)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-xs text-text-muted font-semibold truncate max-w-40">
                      PM: {project.managerName}
                    </span>
                    <div className="text-xs text-text-muted font-bold">
                      {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="table-wrapper">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-2/5">Project</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Deadline</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(project => (
                  <tr key={project.id}>
                    <td className="font-semibold">
                      <Link href={`/projects/${project.id}`} className="no-underline text-text hover:underline block">
                        <p>{project.name}</p>
                        <p className="text-xs text-text-muted font-normal mt-0.5">{project.department} · PM: {project.managerName}</p>
                      </Link>
                    </td>
                    <td>
                      <span className={cn('badge capitalize', STATUS_COLORS[project.status])}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 progress-track min-w-24">
                          <div className="progress-fill progress-blue" style={{ width: `${project.progress}%` }} />
                        </div>
                        <span className="text-xs text-text-muted font-semibold w-8">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="text-text-muted font-medium text-sm">{formatDate(project.deadline)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
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
                  <FolderKanban className="w-5 h-5 text-primary" /> Create New Project
                </h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text transition-all cursor-pointer border-0 bg-transparent"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label text-xs">Project Name</label>
                    <input 
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({...form, name: e.target.value})}
                      placeholder="e.g. SAY IT Mobile App"
                      className="form-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">Project Code</label>
                    <input 
                      type="text"
                      value={form.code}
                      onChange={(e) => setForm({...form, code: e.target.value})}
                      placeholder="e.g. PRJ-101"
                      className="form-input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label text-xs">Description</label>
                  <textarea 
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    placeholder="Describe the project scope and core requirements..."
                    className="form-input text-xs resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label text-xs">Start Date</label>
                    <input 
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({...form, startDate: e.target.value})}
                      className="form-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">Target Deadline</label>
                    <input 
                      type="date"
                      required
                      value={form.deadline}
                      onChange={(e) => setForm({...form, deadline: e.target.value})}
                      className="form-input text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label text-xs">Budget ($)</label>
                    <input 
                      type="number"
                      required
                      value={form.budget}
                      onChange={(e) => setForm({...form, budget: e.target.value})}
                      placeholder="e.g. 50000"
                      className="form-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">Estimated Hours</label>
                    <input 
                      type="number"
                      value={form.estimatedHours}
                      onChange={(e) => setForm({...form, estimatedHours: e.target.value})}
                      placeholder="e.g. 120"
                      className="form-input text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label text-xs">Project Manager</label>
                    <select
                      value={form.managerId}
                      required
                      onChange={(e) => setForm({...form, managerId: e.target.value})}
                      className="form-select w-full text-xs"
                    >
                      <option value="">Select PM</option>
                      {users
                        .filter(u => u.role && ['super_admin', 'project_manager', 'department_manager'].includes(u.role))
                        .map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.position})</option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label text-xs">Client Owner</label>
                    <select
                      value={form.clientId}
                      onChange={(e) => setForm({...form, clientId: e.target.value})}
                      className="form-select w-full text-xs"
                    >
                      <option value="">No Client (Internal)</option>
                      {users
                        .filter(u => u.role === 'client')
                        .map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label text-xs">Priority</label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({...form, priority: e.target.value as any})}
                      className="form-select w-full text-xs"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label text-xs">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({...form, status: e.target.value as any})}
                      className="form-select w-full text-xs"
                    >
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="on_hold">On Hold</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label text-xs">Category</label>
                    <input 
                      type="text"
                      value={form.category}
                      onChange={(e) => setForm({...form, category: e.target.value})}
                      placeholder="e.g. Mobile Development"
                      className="form-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">Tech Stack (comma separated)</label>
                    <input 
                      type="text"
                      value={form.techStack}
                      onChange={(e) => setForm({...form, techStack: e.target.value})}
                      placeholder="React Native, Node.js"
                      className="form-input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label text-xs">Department</label>
                  <input 
                    type="text"
                    required
                    value={form.department}
                    onChange={(e) => setForm({...form, department: e.target.value})}
                    className="form-input text-xs"
                  />
                </div>

                <div className="border-t border-border pt-4 mt-6 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn btn-secondary text-xs px-4 py-2 border-0 bg-transparent hover:bg-surface-2 text-text-muted"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary text-xs px-4 py-2 flex items-center gap-1 border-0 bg-primary text-white"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create Project
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
