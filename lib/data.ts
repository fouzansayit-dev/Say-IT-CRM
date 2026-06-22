// Production data store — integrates Supabase PostgreSQL and Authentication
import { supabase, isSupabaseConfigured } from './supabase'
export { isSupabaseConfigured } from './supabase'

export interface User {
  id: string
  email: string
  role: 'super_admin' | 'hr_admin' | 'project_manager' | 'department_manager' | 'employee' | 'guest' | 'client' | null
  name: string
  avatar?: string
  department: string
  position: string
  employeeId: string
  managerId?: string
  phone?: string
  joinDate: string
  isActive: boolean
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'blocked'
  rejectionReason?: string
  password?: string
  employmentType?: string
  workLocation?: string
  dateOfBirth?: string
  gender?: string
  address?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  skills?: string[]
  socialLinks?: any
  salaryCurrency?: string
  salaryAmount?: number
}

export interface Attendance {
  id: string
  employeeId: string
  date: string
  checkIn?: string
  checkOut?: string
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave'
  workingHours?: number
  isLate?: boolean
}

export interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string
  type: 'annual' | 'sick' | 'maternity' | 'unpaid' | 'emergency'
  startDate: string
  endDate: string
  days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  approverId?: string
  approverName?: string
  createdAt: string
}

export interface Project {
  id: string
  name: string
  code?: string
  description: string
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  budget: number
  spent: number
  startDate?: string
  deadline: string
  estimatedHours?: number
  actualHours?: number
  managerId: string
  managerName: string
  departmentId?: string
  department: string
  progress: number
  members: ProjectMember[]
  createdAt: string
  clientId?: string
  category?: string
  techStack?: string[]
  tags?: string[]
  dependencies?: string[]
}

export interface ProjectMember {
  employeeId: string
  name: string
  role: string
  avatar?: string
}

export interface Task {
  id: string
  projectId: string
  milestoneId?: string
  title: string
  description: string
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assigneeId?: string
  assigneeName?: string
  assigneeAvatar?: string
  estimatedHours: number
  actualHours: number
  dueDate?: string
  labels: string[]
  createdAt: string
  position: number
}

export interface Idea {
  id: string
  title: string
  description: string
  category: 'process' | 'product' | 'people' | 'technology' | 'cost_saving' | 'revenue'
  expectedBenefit: string
  estimatedCost: number
  status: 'submitted' | 'under_review' | 'approved' | 'implemented' | 'rejected'
  submittedBy: string
  submittedByName: string
  department: string
  upvotes: number
  downvotes: number
  stars: number
  trendingScore: number
  userVote?: 'up' | 'down' | 'star' | null
  comments: number
  createdAt: string
}

export interface Problem {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  department: string
  deadline: string
  status: 'open' | 'in_review' | 'solved' | 'closed'
  createdBy: string
  createdByName: string
  solutions: Solution[]
  selectedSolutionId?: string
  createdAt: string
  projectId?: string
}

export interface ChangeRequest {
  id: string
  projectId: string
  title: string
  description: string
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected'
  priority: 'low' | 'medium' | 'high'
  requestedBy: string
  createdAt: string
}

export interface Solution {
  id: string
  problemId: string
  title: string
  description: string
  pros: string[]
  cons: string[]
  estimatedCost: number
  estimatedTime: string
  submittedBy: string
  submittedByName: string
  votes: number
  userVoted: boolean
  createdAt: string
}

export interface ChatRoom {
  id: string
  type: 'channel' | 'dm' | 'group'
  name: string
  projectId?: string
  members: string[]
  lastMessage?: ChatMessage
  unreadCount: number
}

export interface ChatMessage {
  id: string
  roomId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: string
  isEdited: boolean
  reactions: { emoji: string; count: number; userReacted: boolean }[]
  isPinned: boolean
}

export interface Notification {
  id: string
  type: 'task_assigned' | 'task_completed' | 'leave_approved' | 'leave_rejected' | 'mention' | 'project_deadline' | 'idea_approved' | 'problem_assigned'
  title: string
  body: string
  link?: string
  isRead: boolean
  createdAt: string
}

export interface Assignment {
  id: string
  projectId: string
  employeeId: string
  clientId: string
  assignedBy?: string
  status: 'active' | 'completed' | 'removed'
  assignedDate: string
  createdAt: string
  updatedAt: string
}

export interface ProjectMilestone {
  id: string
  projectId: string
  title: string
  description: string
  dueDate?: string
  status: 'pending' | 'completed'
  createdAt: string
  updatedAt: string
}

export interface ProjectDocument {
  id: string
  projectId: string
  name: string
  fileUrl: string
  fileType?: string
  size?: number
  uploadedBy?: string
  isInvoice: boolean
  uploadedAt: string
}

export interface ProjectComment {
  id: string
  projectId: string
  authorId: string
  content: string
  createdAt: string
}

export interface AuditLog {
  id: string
  userId?: string
  action: string
  entityType: string
  entityId?: string
  details?: any
  ipAddress?: string
  createdAt: string
}

export interface ClientRequest {
  id: string
  clientId: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  deadline?: string
  budget?: number
  category?: string
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'converted'
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

export interface HRFeedback {
  id: string
  employeeId: string
  hrId?: string
  type: 'performance' | 'warning' | 'commendation' | 'general'
  feedback: string
  response?: string
  status: 'unread' | 'read' | 'responded'
  createdAt: string
  updatedAt: string
}

// ====== Empty Legacy Mocks to satisfy imports during migration ======
export const MOCK_USERS: User[] = []
export const MOCK_ATTENDANCE: Attendance[] = []
export const MOCK_LEAVE_REQUESTS: LeaveRequest[] = []
export const MOCK_PROJECTS: Project[] = []
export const MOCK_TASKS: Task[] = []
export const MOCK_IDEAS: Idea[] = []
export const MOCK_PROBLEMS: Problem[] = []
export const MOCK_CHAT_ROOMS: ChatRoom[] = []
export const MOCK_MESSAGES: ChatMessage[] = []
export const MOCK_NOTIFICATIONS: Notification[] = []
export const MOCK_CHANGE_REQUESTS: ChangeRequest[] = []

// Cookie helpers
export const setCookie = (name: string, value: string, days = 7) => {
  if (typeof window === 'undefined') return
  const date = new Date()
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
  const expires = "; expires=" + date.toUTCString()
  document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=Lax"
}

export const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null
  const nameEQ = name + "="
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

export const eraseCookie = (name: string) => {
  if (typeof window === 'undefined') return
  document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax'
}

// Auth helpers
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem('sayit_current_user')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  }
  return null
}

export const setCurrentUser = (user: User | null) => {
  if (typeof window !== 'undefined') {
    if (user) {
      localStorage.setItem('sayit_current_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('sayit_current_user')
    }
  }
}

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false
  return !!getCookie('sayit_auth_token')
}

export const login = async (email: string, password: string): Promise<User | null> => {
  if (!isSupabaseConfigured) {
    console.warn('Cannot login: Supabase is not configured.')
    return null
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      throw error
    }
    if (!data.user || !data.session) {
      return null
    }
    
    // Fetch profiles table record
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()
      
    let activeUser: User
    
    if (profileErr || !profile) {
      console.warn('Profile not found, using fallback', profileErr)
      activeUser = {
        id: data.user.id,
        email: data.user.email || email,
        role: (data.user.user_metadata?.role as any) || 'employee',
        name: data.user.user_metadata?.name || email.split('@')[0],
        department: 'Engineering',
        position: 'Associate',
        employeeId: 'EMP_' + data.user.id.substring(0, 6).toUpperCase(),
        joinDate: new Date().toISOString().split('T')[0],
        isActive: true,
        approvalStatus: 'approved'
      }
    } else {
      activeUser = {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        name: profile.name || 'Anonymous User',
        avatar: profile.avatar || undefined,
        department: profile.department,
        position: profile.position,
        employeeId: profile.employee_id,
        joinDate: profile.join_date,
        phone: profile.phone || undefined,
        isActive: profile.is_active,
        approvalStatus: profile.approval_status || 'approved',
        rejectionReason: profile.rejection_reason || undefined,
        managerId: profile.manager_id || undefined,
        employmentType: profile.employment_type || undefined,
        workLocation: profile.work_location || undefined,
        dateOfBirth: profile.date_of_birth || undefined,
        gender: profile.gender || undefined,
        address: profile.address || undefined,
        emergencyContactName: profile.emergency_contact_name || undefined,
        emergencyContactPhone: profile.emergency_contact_phone || undefined,
        skills: profile.skills || [],
        socialLinks: profile.social_links || {},
        salaryCurrency: profile.salary_currency || undefined,
        salaryAmount: profile.salary_amount ? Number(profile.salary_amount) : undefined
      }
    }
    
    setCurrentUser(activeUser)
    setCookie('sayit_auth_token', data.session.access_token)
    setCookie('sayit_user_role', activeUser.role || '')
    
    return activeUser
  } catch (err) {
    console.error('Login network/connection error:', err)
    throw err
  }
}

export const logout = async () => {
  if (!isSupabaseConfigured) {
    eraseCookie('sayit_auth_token')
    eraseCookie('sayit_user_role')
    setCurrentUser(null)
    return
  }
  try {
    await supabase.auth.signOut()
  } catch (err) {
    console.error('Logout error:', err)
  }
  eraseCookie('sayit_auth_token')
  eraseCookie('sayit_user_role')
  setCurrentUser(null)
}

// ====== ASYNC DATABASE QUERIES & MUTATIONS ======

async function safeDbQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!isSupabaseConfigured) {
    return fallback
  }
  try {
    return await fn()
  } catch (err) {
    console.error('Supabase database connection/network error:', err)
    return fallback
  }
}

export const fetchAllUsers = async (): Promise<User[]> => safeDbQuery(async () => {
  const { data, error } = await supabase.from('profiles').select('*').order('name')
  if (error || !data) return []
  return data.map(profile => ({
    id: profile.id,
    email: profile.email,
    role: profile.role,
    name: profile.name || 'Anonymous User',
    avatar: profile.avatar || undefined,
    department: profile.department,
    position: profile.position,
    employeeId: profile.employee_id,
    joinDate: profile.join_date,
    phone: profile.phone || undefined,
    isActive: profile.is_active,
    approvalStatus: profile.approval_status || 'approved',
    rejectionReason: profile.rejection_reason || undefined,
    managerId: profile.manager_id || undefined,
    employmentType: profile.employment_type || undefined,
    workLocation: profile.work_location || undefined,
    dateOfBirth: profile.date_of_birth || undefined,
    gender: profile.gender || undefined,
    address: profile.address || undefined,
    emergencyContactName: profile.emergency_contact_name || undefined,
    emergencyContactPhone: profile.emergency_contact_phone || undefined,
    skills: profile.skills || [],
    socialLinks: profile.social_links || {},
    salaryCurrency: profile.salary_currency || undefined,
    salaryAmount: profile.salary_amount ? Number(profile.salary_amount) : undefined
  }))
}, [])

export const fetchPendingUsers = async (): Promise<User[]> => safeDbQuery(async () => {
  const { data, error } = await supabase.from('profiles').select('*').eq('approval_status', 'pending').order('created_at', { ascending: false })
  if (error || !data) return []
  return data.map(profile => ({
    id: profile.id,
    email: profile.email,
    role: profile.role,
    name: profile.name || 'Anonymous User',
    avatar: profile.avatar || undefined,
    department: profile.department,
    position: profile.position,
    employeeId: profile.employee_id,
    joinDate: profile.join_date,
    phone: profile.phone || undefined,
    isActive: profile.is_active,
    approvalStatus: profile.approval_status || 'approved',
    rejectionReason: profile.rejection_reason || undefined,
    managerId: profile.manager_id || undefined,
    employmentType: profile.employment_type || undefined,
    workLocation: profile.work_location || undefined,
    dateOfBirth: profile.date_of_birth || undefined,
    gender: profile.gender || undefined,
    address: profile.address || undefined,
    emergencyContactName: profile.emergency_contact_name || undefined,
    emergencyContactPhone: profile.emergency_contact_phone || undefined,
    skills: profile.skills || [],
    socialLinks: profile.social_links || {},
    salaryCurrency: profile.salary_currency || undefined,
    salaryAmount: profile.salary_amount ? Number(profile.salary_amount) : undefined
  }))
}, [])

export const updateUserApprovalStatus = async (
  userId: string, 
  status: 'approved' | 'rejected' | 'blocked', 
  options?: { role?: string; rejectionReason?: string; adminId?: string }
): Promise<boolean> => {
  if (!isSupabaseConfigured) return false
  try {
    const updatePayload: any = {
      approval_status: status,
      is_active: status === 'approved',
    }

    if (status === 'approved') {
      updatePayload.approved_at = new Date().toISOString()
      updatePayload.approved_by = options?.adminId
      if (options?.role) updatePayload.role = options.role
    } else if (status === 'rejected') {
      updatePayload.rejected_at = new Date().toISOString()
      updatePayload.rejected_by = options?.adminId
      updatePayload.rejection_reason = options?.rejectionReason
    } else if (status === 'blocked') {
      updatePayload.blocked_at = new Date().toISOString()
      updatePayload.blocked_by = options?.adminId
    }

    const { error } = await supabase.from('profiles').update(updatePayload).eq('id', userId)
    return !error
  } catch (err) {
    console.error('Update approval status error:', err)
    return false
  }
}

export const fetchProjects = async (): Promise<Project[]> => safeDbQuery(async () => {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      manager:profiles!manager_id(id, name, avatar),
      client:profiles!client_id(id, name, avatar)
    `)
    .order('created_at', { ascending: false })
    
  if (error || !data) {
    console.error('Fetch projects error:', error)
    return []
  }
  
  return data.map(p => ({
    id: p.id,
    name: p.name,
    code: p.code || undefined,
    description: p.description || '',
    status: p.status,
    priority: p.priority,
    budget: Number(p.budget) || 0,
    spent: Number(p.spent) || 0,
    startDate: p.start_date || undefined,
    deadline: p.deadline || '',
    estimatedHours: Number(p.estimated_hours) || 0,
    actualHours: Number(p.actual_hours) || 0,
    managerId: p.manager_id || '',
    managerName: p.manager?.name || 'Unassigned',
    departmentId: '',
    department: p.department || '',
    progress: Number(p.progress) || 0,
    clientId: p.client_id || undefined,
    category: p.category || undefined,
    techStack: p.tech_stack || [],
    tags: p.tags || [],
    dependencies: p.dependencies || [],
    createdAt: p.created_at,
    members: []
  }))
}, [])

export const createProject = async (proj: Omit<Project, 'id' | 'createdAt' | 'members' | 'managerName'>): Promise<Project | null> => safeDbQuery(async () => {
  const { data, error } = await supabase
    .from('projects')
    .insert([{
      name: proj.name,
      code: proj.code,
      description: proj.description,
      status: proj.status,
      priority: proj.priority,
      budget: proj.budget,
      spent: proj.spent,
      start_date: proj.startDate,
      deadline: proj.deadline || null,
      estimated_hours: proj.estimatedHours,
      actual_hours: proj.actualHours,
      manager_id: proj.managerId || null,
      department: proj.department,
      progress: proj.progress,
      client_id: proj.clientId || null,
      category: proj.category,
      tech_stack: proj.techStack || [],
      tags: proj.tags || [],
      dependencies: proj.dependencies || []
    }])
    .select(`
      *,
      manager:profiles!manager_id(id, name, avatar),
      client:profiles!client_id(id, name, avatar)
    `)
    .single()
    
  if (error || !data) {
    console.error('Create project error:', error)
    return null
  }
  
  return {
    id: data.id,
    name: data.name,
    code: data.code || undefined,
    description: data.description || '',
    status: data.status,
    priority: data.priority,
    budget: Number(data.budget) || 0,
    spent: Number(data.spent) || 0,
    startDate: data.start_date || undefined,
    deadline: data.deadline || '',
    estimatedHours: Number(data.estimated_hours) || 0,
    actualHours: Number(data.actual_hours) || 0,
    managerId: data.manager_id || '',
    managerName: data.manager?.name || 'Unassigned',
    departmentId: '',
    department: data.department || '',
    progress: Number(data.progress) || 0,
    clientId: data.client_id || undefined,
    category: data.category || undefined,
    techStack: data.tech_stack || [],
    tags: data.tags || [],
    dependencies: data.dependencies || [],
    createdAt: data.created_at,
    members: []
  }
}, null)

export const fetchTasks = async (projectId?: string): Promise<Task[]> => safeDbQuery(async () => {
  let query = supabase
    .from('tasks')
    .select(`
      *,
      assignee:profiles!assignee_id(id, name, avatar)
    `)
    .order('created_at', { ascending: false })
    
  if (projectId) {
    query = query.eq('project_id', projectId)
  }
  
  const { data, error } = await query
  if (error || !data) return []
  
  return data.map(t => ({
    id: t.id,
    projectId: t.project_id,
    title: t.title,
    description: t.description || '',
    status: t.status,
    priority: t.priority,
    assigneeId: t.assignee_id || undefined,
    assigneeName: t.assignee?.name || undefined,
    assigneeAvatar: t.assignee?.avatar || undefined,
    estimatedHours: Number(t.estimated_hours) || 0,
    actualHours: Number(t.actual_hours) || 0,
    dueDate: t.due_date || undefined,
    labels: t.labels || [],
    createdAt: t.created_at,
    position: 0
  }))
}, [])

export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'assigneeName' | 'assigneeAvatar'>): Promise<Task | null> => safeDbQuery(async () => {
  const { data, error } = await supabase
    .from('tasks')
    .insert([{
      project_id: task.projectId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignee_id: task.assigneeId || null,
      estimated_hours: task.estimatedHours,
      actual_hours: task.actualHours,
      due_date: task.dueDate || null,
      labels: task.labels
    }])
    .select(`
      *,
      assignee:profiles!assignee_id(id, name, avatar)
    `)
    .single()
    
  if (error || !data) return null
  return {
    id: data.id,
    projectId: data.project_id,
    title: data.title,
    description: data.description || '',
    status: data.status,
    priority: data.priority,
    assigneeId: data.assignee_id || undefined,
    assigneeName: data.assignee?.name || undefined,
    assigneeAvatar: data.assignee?.avatar || undefined,
    estimatedHours: Number(data.estimated_hours) || 0,
    actualHours: Number(data.actual_hours) || 0,
    dueDate: data.due_date || undefined,
    labels: data.labels || [],
    createdAt: data.created_at,
    position: 0
  }
}, null)

export const fetchProblems = async (projectId?: string): Promise<Problem[]> => safeDbQuery(async () => {
  let query = supabase
    .from('problems')
    .select(`
      *,
      creator:profiles!created_by(id, name),
      solutions(*, creator:profiles!submitted_by(id, name))
    `)
    .order('created_at', { ascending: false })
    
  if (projectId) {
    query = query.eq('project_id', projectId)
  }
  
  const { data, error } = await query
  if (error || !data) return []
  
  return data.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description || '',
    severity: p.severity,
    department: p.department || '',
    deadline: p.deadline || '',
    status: p.status,
    createdBy: p.created_by || '',
    createdByName: p.creator?.name || 'Unknown',
    selectedSolutionId: p.selected_solution_id || undefined,
    createdAt: p.created_at,
    projectId: p.project_id || undefined,
    solutions: (p.solutions || []).map((s: any) => ({
      id: s.id,
      problemId: s.problem_id,
      title: s.title,
      description: s.description || '',
      pros: s.pros || [],
      cons: s.cons || [],
      estimatedCost: Number(s.estimated_cost) || 0,
      estimatedTime: s.estimated_time || '',
      submittedBy: s.submitted_by || '',
      submittedByName: s.creator?.name || 'Unknown',
      votes: s.votes || 0,
      userVoted: false,
      createdAt: s.created_at
    }))
  }))
}, [])

export const createProblem = async (prob: Omit<Problem, 'id' | 'createdAt' | 'solutions' | 'createdByName'>): Promise<Problem | null> => safeDbQuery(async () => {
  const { data, error } = await supabase
    .from('problems')
    .insert([{
      project_id: prob.projectId || null,
      title: prob.title,
      description: prob.description,
      severity: prob.severity,
      department: prob.department,
      deadline: prob.deadline || null,
      status: prob.status,
      created_by: prob.createdBy || null
    }])
    .select(`
      *,
      creator:profiles!created_by(id, name)
    `)
    .single()
    
  if (error || !data) return null
  return {
    id: data.id,
    title: data.title,
    description: data.description || '',
    severity: data.severity,
    department: data.department || '',
    deadline: data.deadline || '',
    status: data.status,
    createdBy: data.created_by || '',
    createdByName: data.creator?.name || 'Unknown',
    createdAt: data.created_at,
    projectId: data.project_id || undefined,
    solutions: []
  }
}, null)

export const createSolution = async (sol: Omit<Solution, 'id' | 'createdAt' | 'submittedByName' | 'votes' | 'userVoted'>): Promise<Solution | null> => safeDbQuery(async () => {
  const { data, error } = await supabase
    .from('solutions')
    .insert([{
      problem_id: sol.problemId,
      title: sol.title,
      description: sol.description,
      pros: sol.pros,
      cons: sol.cons,
      estimated_cost: sol.estimatedCost,
      estimated_time: sol.estimatedTime,
      submitted_by: sol.submittedBy
    }])
    .select(`
      *,
      creator:profiles!submitted_by(id, name)
    `)
    .single()
    
  if (error || !data) return null
  return {
    id: data.id,
    problemId: data.problem_id,
    title: data.title,
    description: data.description || '',
    pros: data.pros || [],
    cons: data.cons || [],
    estimatedCost: Number(data.estimated_cost) || 0,
    estimatedTime: data.estimated_time || '',
    submittedBy: data.submitted_by || '',
    submittedByName: data.creator?.name || 'Unknown',
    votes: 0,
    userVoted: false,
    createdAt: data.created_at
  }
}, null)

export const selectSolution = async (problemId: string, solutionId: string) => {
  if (!isSupabaseConfigured) return
  try {
    await supabase
      .from('problems')
      .update({ selected_solution_id: solutionId, status: 'solved' })
      .eq('id', problemId)
  } catch (err) {
    console.error('Select solution error:', err)
  }
}

export const fetchChangeRequests = async (projectId?: string): Promise<ChangeRequest[]> => safeDbQuery(async () => {
  let query = supabase.from('change_requests').select('*').order('created_at', { ascending: false })
  if (projectId) {
    query = query.eq('project_id', projectId)
  }
  const { data, error } = await query
  if (error || !data) return []
  return data.map(cr => ({
    id: cr.id,
    projectId: cr.project_id,
    title: cr.title,
    description: cr.description || '',
    status: cr.status,
    priority: cr.priority,
    requestedBy: cr.requested_by_id || 'Client',
    createdAt: cr.created_at
  }))
}, [])

export const createChangeRequest = async (cr: Omit<ChangeRequest, 'id' | 'createdAt'>): Promise<ChangeRequest | null> => safeDbQuery(async () => {
  const { data, error } = await supabase
    .from('change_requests')
    .insert([{
      project_id: cr.projectId,
      title: cr.title,
      description: cr.description,
      status: cr.status,
      priority: cr.priority,
      requested_by_id: cr.requestedBy
    }])
    .select()
    .single()
    
  if (error || !data) {
    console.error('Create Change Request Error:', error)
    return null
  }
  return {
    id: data.id,
    projectId: data.project_id,
    title: data.title,
    description: data.description || '',
    status: data.status,
    priority: data.priority,
    requestedBy: data.requested_by_id,
    createdAt: data.created_at
  }
}, null)

export const fetchIdeas = async (): Promise<Idea[]> => safeDbQuery(async () => {
  const { data, error } = await supabase
    .from('ideas')
    .select(`
      *,
      creator:profiles!submitted_by(id, name, department)
    `)
    .order('created_at', { ascending: false })
    
  if (error || !data) return []
  return data.map(i => ({
    id: i.id,
    title: i.title,
    description: i.description || '',
    category: i.category as any,
    expectedBenefit: i.expected_benefit || '',
    estimatedCost: Number(i.estimated_cost) || 0,
    status: i.status,
    submittedBy: i.submitted_by || '',
    submittedByName: i.creator?.name || 'Anonymous',
    department: i.creator?.department || 'Engineering',
    upvotes: i.upvotes || 0,
    downvotes: i.downvotes || 0,
    stars: i.stars || 0,
    trendingScore: Number(i.trending_score) || 50,
    comments: 0,
    createdAt: i.created_at
  }))
}, [])

export const createIdea = async (idea: Omit<Idea, 'id' | 'createdAt' | 'submittedByName' | 'department' | 'upvotes' | 'downvotes' | 'stars' | 'trendingScore' | 'comments'>): Promise<Idea | null> => safeDbQuery(async () => {
  const { data, error } = await supabase
    .from('ideas')
    .insert([{
      title: idea.title,
      description: idea.description,
      category: idea.category,
      expected_benefit: idea.expectedBenefit,
      estimated_cost: idea.estimatedCost,
      status: idea.status,
      submitted_by: idea.submittedBy
    }])
    .select(`
      *,
      creator:profiles!submitted_by(id, name, department)
    `)
    .single()
    
  if (error || !data) return null
  return {
    id: data.id,
    title: data.title,
    description: data.description || '',
    category: data.category as any,
    expectedBenefit: data.expected_benefit || '',
    estimatedCost: Number(data.estimated_cost) || 0,
    status: data.status,
    submittedBy: data.submitted_by || '',
    submittedByName: data.creator?.name || 'Anonymous',
    department: data.creator?.department || 'Engineering',
    upvotes: 0,
    downvotes: 0,
    stars: 0,
    trendingScore: 50,
    comments: 0,
    createdAt: data.created_at
  }
}, null)

export const voteIdea = async (ideaId: string, userId: string, voteType: 'up' | 'down' | 'star') => {
  if (!isSupabaseConfigured) return
  try {
    const field = voteType === 'up' ? 'upvotes' : voteType === 'down' ? 'downvotes' : 'stars'
    const { data } = await supabase.from('ideas').select(field).eq('id', ideaId).single()
    if (data) {
      const val = (data as any)[field] || 0
      await supabase.from('ideas').update({ [field]: val + 1 }).eq('id', ideaId)
    }
  } catch (err) {
    console.error('Vote idea error:', err)
  }
}

export const fetchAttendance = async (employeeId: string): Promise<Attendance[]> => safeDbQuery(async () => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', employeeId)
    .order('date', { ascending: false })
    
  if (error || !data) return []
  return data.map(a => ({
    id: a.id,
    employeeId: a.employee_id,
    date: a.date,
    checkIn: a.check_in || undefined,
    checkOut: a.check_out || undefined,
    status: a.status,
    workingHours: Number(a.working_hours) || 0,
    isLate: a.is_late
  }))
}, [])

export const checkInEmployee = async (employeeId: string, checkInTime: string): Promise<Attendance | null> => safeDbQuery(async () => {
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('attendance')
    .insert([{
      employee_id: employeeId,
      date: today,
      check_in: checkInTime,
      status: 'present',
      working_hours: 0,
      is_late: false
    }])
    .select()
    .single()
    
  if (error || !data) return null
  return {
    id: data.id,
    employeeId: data.employee_id,
    date: data.date,
    checkIn: data.check_in || undefined,
    status: data.status,
    workingHours: Number(data.working_hours) || 0,
    isLate: data.is_late
  }
}, null)

export const checkOutEmployee = async (attendanceId: string, checkOutTime: string): Promise<boolean> => {
  if (!isSupabaseConfigured) return false
  try {
    const { error } = await supabase
      .from('attendance')
      .update({ check_out: checkOutTime, working_hours: 8 }) // standard 8 hours check out
      .eq('id', attendanceId)
      
    return !error
  } catch (err) {
    console.error('Check out employee error:', err)
    return false
  }
}

export const fetchLeaveRequests = async (employeeId?: string): Promise<LeaveRequest[]> => safeDbQuery(async () => {
  let query = supabase
    .from('leave_requests')
    .select(`
      *,
      employee:profiles!employee_id(id, name),
      approver:profiles!approver_id(id, name)
    `)
    .order('created_at', { ascending: false })
    
  if (employeeId) {
    query = query.eq('employee_id', employeeId)
  }
  
  const { data, error } = await query
  if (error || !data) return []
  
  return data.map(l => ({
    id: l.id,
    employeeId: l.employee_id,
    employeeName: l.employee?.name || 'Employee',
    type: l.type as any,
    startDate: l.start_date,
    endDate: l.end_date,
    days: l.days,
    reason: l.reason || '',
    status: l.status,
    approverId: l.approver_id || undefined,
    approverName: l.approver?.name || undefined,
    createdAt: l.created_at
  }))
}, [])

export const createLeaveRequest = async (req: Omit<LeaveRequest, 'id' | 'createdAt' | 'employeeName' | 'approverName'>): Promise<LeaveRequest | null> => safeDbQuery(async () => {
  const { data, error } = await supabase
    .from('leave_requests')
    .insert([{
      employee_id: req.employeeId,
      type: req.type,
      start_date: req.startDate,
      end_date: req.endDate,
      days: req.days,
      reason: req.reason,
      status: req.status
    }])
    .select(`
      *,
      employee:profiles!employee_id(id, name)
    `)
    .single()
    
  if (error || !data) return null
  return {
    id: data.id,
    employeeId: data.employee_id,
    employeeName: data.employee?.name || 'Employee',
    type: data.type as any,
    startDate: data.start_date,
    endDate: data.end_date,
    days: data.days,
    reason: data.reason || '',
    status: data.status,
    createdAt: data.created_at
  }
}, null)

export const updateLeaveRequestStatus = async (id: string, status: 'approved' | 'rejected', approverId: string) => {
  if (!isSupabaseConfigured) return
  try {
    await supabase
      .from('leave_requests')
      .update({ status, approver_id: approverId })
      .eq('id', id)
  } catch (err) {
    console.error('Update leave request status error:', err)
  }
}

export const fetchChatRooms = async (): Promise<ChatRoom[]> => safeDbQuery(async () => {
  const { data, error } = await supabase
    .from('chat_rooms')
    .select(`
      *,
      chat_room_members(user_id)
    `)
  if (error || !data) return []
  return data.map(room => ({
    id: room.id,
    type: room.type,
    name: room.name,
    projectId: room.project_id || undefined,
    members: (room.chat_room_members || []).map((m: any) => m.user_id),
    unreadCount: 0
  }))
}, [])

export const createChatRoom = async (name: string, type: 'channel' | 'dm' | 'group', members: string[], projectId?: string): Promise<ChatRoom | null> => safeDbQuery(async () => {
  const { data: roomData, error: roomError } = await supabase
    .from('chat_rooms')
    .insert([{
      name,
      type,
      project_id: projectId || null
    }])
    .select()
    .single()
    
  if (roomError || !roomData) return null
  
  const memberInserts = members.map(m => ({
    room_id: roomData.id,
    user_id: m
  }))
  
  const { error: memberError } = await supabase
    .from('chat_room_members')
    .insert(memberInserts)
    
  if (memberError) {
    console.error('Add members error:', memberError)
  }
  
  return {
    id: roomData.id,
    type: roomData.type as any,
    name: roomData.name,
    projectId: roomData.project_id || undefined,
    members: members,
    unreadCount: 0
  }
}, null)

export const fetchChatMessages = async (roomId: string): Promise<ChatMessage[]> => safeDbQuery(async () => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select(`
      *,
      sender:profiles!sender_id(id, name, avatar)
    `)
    .eq('room_id', roomId)
    .order('timestamp', { ascending: true })
    
  if (error || !data) return []
  return data.map(msg => ({
    id: msg.id,
    roomId: msg.room_id,
    senderId: msg.sender_id,
    senderName: msg.sender?.name || 'Unknown',
    senderAvatar: msg.sender?.avatar || undefined,
    content: msg.content,
    timestamp: msg.timestamp,
    isEdited: false,
    reactions: [],
    isPinned: false
  }))
}, [])

export const sendChatMessage = async (roomId: string, senderId: string, content: string): Promise<ChatMessage | null> => safeDbQuery(async () => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([{
      room_id: roomId,
      sender_id: senderId,
      content: content
    }])
    .select(`
      *,
      sender:profiles!sender_id(id, name, avatar)
    `)
    .single()
    
  if (error || !data) return null
  return {
    id: data.id,
    roomId: data.room_id,
    senderId: data.sender_id,
    senderName: data.sender?.name || 'Unknown',
    senderAvatar: data.sender?.avatar || undefined,
    content: data.content,
    timestamp: data.timestamp,
    isEdited: false,
    reactions: [],
    isPinned: false
  }
}, null)

export const signUp = async (
  email: string,
  password: string,
  name: string,
  role: string,
  department: string,
  position: string
): Promise<User | null> => {
  if (!isSupabaseConfigured) {
    console.warn('Cannot sign up: Supabase is not configured.')
    return null
  }
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          department,
          position
        }
      }
    })
    
    if (error) {
      throw error
    }
    if (!data.user) {
      return null
    }
    
    const newUser: User = {
      id: data.user.id,
      email,
      name,
      role: role as any,
      department,
      position,
      employeeId: 'EMP_' + data.user.id.substring(0, 6).toUpperCase(),
      joinDate: new Date().toISOString().split('T')[0],
      isActive: false,
      approvalStatus: 'pending'
    }
    
    return newUser
  } catch (err) {
    console.error('Sign up network/connection error:', err)
    throw err
  }
}

export const updateTaskStatus = async (taskId: string, status: string): Promise<boolean> => {
  if (!isSupabaseConfigured) return false
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId)
    return !error
  } catch (err) {
    console.error('Update task status error:', err)
    return false
  }
}

export const fetchAssignments = async (projectId?: string): Promise<Assignment[]> => safeDbQuery(async () => {
  let query = supabase.from('assignments').select('*').order('created_at', { ascending: false })
  if (projectId) query = query.eq('project_id', projectId)
  const { data, error } = await query
  if (error || !data) return []
  return data.map(a => ({
    id: a.id,
    projectId: a.project_id,
    employeeId: a.employee_id,
    clientId: a.client_id,
    assignedBy: a.assigned_by || undefined,
    status: a.status as any,
    assignedDate: a.assigned_date,
    createdAt: a.created_at,
    updatedAt: a.updated_at
  }))
}, [])

export const createAssignment = async (assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt' | 'assignedDate' | 'status'>): Promise<Assignment | null> => safeDbQuery(async () => {
  const { data, error } = await supabase
    .from('assignments')
    .insert([{
      project_id: assignment.projectId,
      employee_id: assignment.employeeId,
      client_id: assignment.clientId,
      assigned_by: assignment.assignedBy || null
    }])
    .select()
    .single()
    
  if (error || !data) {
    console.error('Create assignment error:', error)
    return null
  }
  return {
    id: data.id,
    projectId: data.project_id,
    employeeId: data.employee_id,
    clientId: data.client_id,
    assignedBy: data.assigned_by || undefined,
    status: data.status as any,
    assignedDate: data.assigned_date,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  }
}, null)

export const deleteAssignment = async (assignmentId: string): Promise<boolean> => {
  if (!isSupabaseConfigured) return false
  try {
    const { error } = await supabase.from('assignments').delete().eq('id', assignmentId)
    return !error
  } catch (err) {
    console.error('Delete assignment error:', err)
    return false
  }
}

// --- MILESTONES ---
export const fetchMilestones = async (projectId?: string): Promise<ProjectMilestone[]> => safeDbQuery(async () => {
  let query = supabase.from('project_milestones').select('*').order('created_at', { ascending: true })
  if (projectId) query = query.eq('project_id', projectId)
  
  const { data, error } = await query
  if (error) {
    console.error('Fetch milestones error:', error)
    return []
  }
  return data.map((m: any) => ({
    id: m.id,
    projectId: m.project_id,
    title: m.title,
    description: m.description,
    dueDate: m.due_date,
    status: m.status,
    createdAt: m.created_at,
    updatedAt: m.updated_at
  }))
}, [])

export const createMilestone = async (milestone: Omit<ProjectMilestone, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<ProjectMilestone | null> => safeDbQuery(async () => {
  const { data, error } = await supabase
    .from('project_milestones')
    .insert([{
      project_id: milestone.projectId,
      title: milestone.title,
      description: milestone.description,
      due_date: milestone.dueDate || null,
      status: 'pending'
    }])
    .select()
    .single()
    
  if (error || !data) {
    console.error('Create milestone error:', error)
    return null
  }
  
  return {
    id: data.id,
    projectId: data.project_id,
    title: data.title,
    description: data.description,
    dueDate: data.due_date,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  }
}, null)

export const updateMilestoneStatus = async (milestoneId: string, status: 'pending' | 'completed'): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('project_milestones')
      .update({ status })
      .eq('id', milestoneId)
      
    if (error) throw error
    return true
  } catch (err) {
    console.error('Update milestone error:', err)
    return false
  }
}
