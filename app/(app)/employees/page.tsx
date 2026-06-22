'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, Plus, Building2, Mail, Phone,
  Shield, Edit, UserX, Users, Upload, Download, CheckCircle
} from 'lucide-react'
import { fetchAllUsers, getCurrentUser, type User } from '@/lib/data'
import { cn, formatDate, getInitials } from '@/lib/utils'

const ROLE_BADGES: Record<string, string> = {
  super_admin: 'badge-gray',
  hr_admin: 'badge-gray',
  project_manager: 'badge-gray',
  department_manager: 'badge-gray',
  employee: 'badge-gray',
  guest: 'badge-gray',
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  hr_admin: 'HR Admin',
  project_manager: 'Project Manager',
  department_manager: 'Dept. Manager',
  employee: 'Employee',
  guest: 'Guest',
}

export default function EmployeesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [employees, setEmployees] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selected, setSelected] = useState<User | null>(null)

  useEffect(() => {
    const loadEmployees = async () => {
      setUser(getCurrentUser())
      const list = await fetchAllUsers()
      setEmployees(list)
      setIsLoading(false)
    }
    loadEmployees()
  }, [])

  const departments = [...new Set(employees.map(u => u.department))]
  
  const filtered = employees.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.position.toLowerCase().includes(search.toLowerCase())
    const matchDept = deptFilter === 'all' || u.department === deptFilter
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchDept && matchRole
  })

  if (user && (!user.role || !['super_admin', 'hr_admin'].includes(user.role as string))) {
    return (
      <div className="card p-12 text-center bg-surface border border-border max-w-xl mx-auto mt-12">
        <Shield className="w-12 h-12 mx-auto mb-4 text-text-subtle" />
        <h2 className="text-lg font-bold text-text mb-2">Access Denied</h2>
        <p className="text-text-muted text-sm leading-relaxed">
          You do not have permission to view or manage the employee directory. Please contact your department manager or administrator if you believe this is an error.
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

  return (
    <div className="space-y-6 text-text">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Employees</h1>
          <p className="text-text-muted mt-1">{employees.filter(u => u.isActive).length} active employees</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn flex items-center gap-2 bg-surface-2 border border-border text-text hover:bg-surface-3">
            <Upload className="w-4 h-4" /> Import CSV
          </button>
          <button className="btn flex items-center gap-2 bg-surface-2 border border-border text-text hover:bg-surface-3">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button className="btn btn-primary flex items-center gap-2 border-0 bg-primary text-white">
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search employees..."
            className="form-input pl-9"
          />
        </div>
        <select
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
          className="form-select w-auto min-w-36"
        >
          <option value="all">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="form-select w-auto min-w-36"
        >
          <option value="all">All Roles</option>
          {Object.keys(ROLE_LABELS).map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: employees.length, icon: Users, color: 'text-text-muted bg-surface-2 border border-border' },
          { label: 'Active', value: employees.filter(u => u.isActive).length, icon: Users, color: 'text-text-muted bg-surface-2 border border-border' },
          { label: 'Departments', value: departments.length, icon: Building2, color: 'text-text-muted bg-surface-2 border border-border' },
          { label: 'Managers', value: employees.filter(u => u.role && ['project_manager', 'department_manager', 'hr_admin'].includes(u.role)).length, icon: Shield, color: 'text-text-muted bg-surface-2 border border-border' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3 bg-surface border border-border cursor-default hover:transform-none">
            <div className={cn('p-2 rounded-lg', s.color)}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-text">{s.value}</div>
              <div className="text-xs text-text-muted font-medium">{s.label}</div>
            </div>
          </div>
        ))}
      </div>


      {/* Employee grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center bg-surface border border-border hover:transform-none">
          <Users className="w-12 h-12 mx-auto mb-3 text-text-subtle" />
          <p className="text-text-muted font-medium">No employees match your filters</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((emp, i) => (
            <motion.div
              key={emp.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
            >
              <div
                onClick={() => setSelected(selected?.id === emp.id ? null : emp)}
                className={cn(
                  'card p-5 cursor-pointer bg-surface border border-border',
                  selected?.id === emp.id && 'border-primary bg-surface-2'
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl avatar flex items-center justify-center text-sm font-bold">
                    {getInitials(emp.name)}
                  </div>
                  <span className={cn('badge', ROLE_BADGES[emp.role || 'employee'])}>
                    {ROLE_LABELS[emp.role || 'employee']}
                  </span>
                </div>
                <h3 className="font-bold text-text text-sm">{emp.name}</h3>
                <p className="text-xs text-text-muted font-medium mt-0.5">{emp.position}</p>
                <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Building2 className="w-3.5 h-3.5" />
                    {emp.department}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  {emp.phone && (
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <Phone className="w-3.5 h-3.5" />
                      {emp.phone}
                    </div>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className={cn('status-dot', emp.isActive ? 'status-dot-green' : 'status-dot-gray')} />
                    <span className="text-xs text-text-muted font-semibold">{emp.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <span className="text-xs text-text-muted font-semibold">{emp.employeeId}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Employee detail panel */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 bg-surface border border-border hover:transform-none cursor-default"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl avatar flex items-center justify-center text-xl font-bold">
                {getInitials(selected.name)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-text">{selected.name}</h2>
                <p className="text-text-muted text-sm">{selected.position} · {selected.department}</p>
                <span className={cn('badge mt-2', ROLE_BADGES[selected.role || 'employee'])}>
                  {ROLE_LABELS[selected.role || 'employee']}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button className="btn flex-1 sm:flex-initial flex items-center justify-center gap-2 text-sm bg-surface-2 border border-border text-text hover:bg-surface-3">
                {selected.isActive ? (
                  <><UserX className="w-4 h-4" /> Deactivate</>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Activate</>
                )}
              </button>
              <button className="btn btn-primary flex-1 sm:flex-initial flex items-center justify-center gap-2 text-sm bg-primary text-white border-0">
                <Edit className="w-4 h-4" /> Edit
              </button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Employee ID', value: selected.employeeId },
              { label: 'Email', value: selected.email },
              { label: 'Phone', value: selected.phone || '—' },
              { label: 'Join Date', value: formatDate(selected.joinDate) },
            ].map(field => (
              <div key={field.label} className="bg-surface-2 rounded-lg p-3">
                <p className="text-xs text-text-muted font-bold mb-1">{field.label}</p>
                <p className="text-sm font-semibold text-text">{field.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
