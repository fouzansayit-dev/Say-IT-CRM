'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, Plus, Building2, Mail, Phone,
  Shield, Edit, UserX, Users, Briefcase
} from 'lucide-react'
import { fetchAllUsers, getCurrentUser, type User } from '@/lib/data'
import { cn, formatDate, getInitials } from '@/lib/utils'

export default function ClientsAdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [clients, setClients] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<User | null>(null)

  useEffect(() => {
    const loadClients = async () => {
      setUser(getCurrentUser())
      const list = await fetchAllUsers()
      // Filter only clients
      setClients(list.filter(u => u.role === 'client'))
      setIsLoading(false)
    }
    loadClients()
  }, [])

  const filtered = clients.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(search.toLowerCase())) // treating department as company name
    return matchSearch
  })

  if (user && !['super_admin', 'hr_admin', 'project_manager'].includes(user.role as string)) {
    return (
      <div className="card p-12 text-center bg-surface border border-border max-w-xl mx-auto mt-12">
        <Shield className="w-12 h-12 mx-auto mb-4 text-text-subtle" />
        <h2 className="text-lg font-bold text-text mb-2">Access Denied</h2>
        <p className="text-text-muted text-sm leading-relaxed">
          You do not have permission to view or manage clients.
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
          <h1 className="text-2xl font-bold text-text">Clients</h1>
          <p className="text-text-muted mt-1">{clients.length} registered clients</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2 border-0 bg-primary text-white">
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search clients by name, email, or company..."
            className="form-input pl-9"
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Clients', value: clients.length, icon: Users, color: 'text-blue-400 bg-blue-400/10 border border-blue-400/20' },
          { label: 'Active Projects', value: '—', icon: Briefcase, color: 'text-purple-400 bg-purple-400/10 border border-purple-400/20' },
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

      {/* Client grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center bg-surface border border-border hover:transform-none">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-text-subtle" />
          <p className="text-text-muted font-medium">No clients match your search</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((client, i) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
            >
              <div
                onClick={() => setSelected(selected?.id === client.id ? null : client)}
                className={cn(
                  'card p-5 cursor-pointer bg-surface border border-border',
                  selected?.id === client.id && 'border-primary bg-surface-2'
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl avatar flex items-center justify-center text-sm font-bold">
                    {getInitials(client.name)}
                  </div>
                  <span className="badge badge-gray">Client</span>
                </div>
                <h3 className="font-bold text-text text-sm">{client.name}</h3>
                <p className="text-xs text-text-muted font-medium mt-0.5">{client.department || 'Independent'}</p>
                <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <Phone className="w-3.5 h-3.5" />
                      {client.phone}
                    </div>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className={cn('status-dot', client.isActive ? 'status-dot-green' : 'status-dot-gray')} />
                    <span className="text-xs text-text-muted font-semibold">{client.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Client detail panel */}
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
                <p className="text-text-muted text-sm">{selected.department || 'Independent Client'}</p>
                <span className="badge badge-gray mt-2">Client</span>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button className="btn btn-primary flex-1 sm:flex-initial flex items-center justify-center gap-2 text-sm bg-primary text-white border-0">
                <Edit className="w-4 h-4" /> Edit
              </button>
              <button className="btn btn-destructive p-2.5 rounded-lg hover:bg-error-bg text-error cursor-pointer border-0 bg-transparent flex items-center justify-center">
                <UserX className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Company', value: selected.department || '—' },
              { label: 'Email', value: selected.email },
              { label: 'Phone', value: selected.phone || '—' },
              { label: 'Registered Date', value: formatDate(selected.joinDate) },
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
