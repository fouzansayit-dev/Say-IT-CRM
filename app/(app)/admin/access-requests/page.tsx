'use client'
import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Search, Shield, User as UserIcon } from 'lucide-react'
import { getCurrentUser, fetchPendingUsers, updateUserApprovalStatus, type User } from '@/lib/data'
import { formatDate, getInitials } from '@/lib/utils'

export default function AccessRequestsPage() {
  const [pendingUsers, setPendingUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const currentUser = getCurrentUser()

  useEffect(() => {
    loadPendingUsers()
  }, [])

  const loadPendingUsers = async () => {
    setIsLoading(true)
    const users = await fetchPendingUsers()
    setPendingUsers(users)
    setIsLoading(false)
  }

  const handleApprove = async (userId: string, role: string) => {
    if (!currentUser) return
    const success = await updateUserApprovalStatus(userId, 'approved', { role, adminId: currentUser.id })
    if (success) {
      setPendingUsers(prev => prev.filter(u => u.id !== userId))
    } else {
      alert('Failed to approve user.')
    }
  }

  const handleReject = async (userId: string) => {
    if (!currentUser) return
    const reason = prompt('Enter rejection reason:')
    if (reason === null) return // cancelled
    const success = await updateUserApprovalStatus(userId, 'rejected', { rejectionReason: reason || 'Not specified', adminId: currentUser.id })
    if (success) {
      setPendingUsers(prev => prev.filter(u => u.id !== userId))
    } else {
      alert('Failed to reject user.')
    }
  }

  const filteredUsers = pendingUsers.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) return <div className="p-8 flex justify-center"><div className="spinner" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Access Requests
        </h1>
        <p className="text-text-muted mt-1">Review and approve new user registrations for the system.</p>
      </div>

      <div className="flex items-center gap-4 bg-surface p-4 border border-border rounded-lg">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-surface border border-border rounded-lg">
          <UserIcon className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-medium text-text">No Pending Requests</h3>
          <p className="text-text-muted mt-1 text-sm">All access requests have been processed.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className="p-4 text-xs font-semibold text-text-muted uppercase">User</th>
                <th className="p-4 text-xs font-semibold text-text-muted uppercase">Email</th>
                <th className="p-4 text-xs font-semibold text-text-muted uppercase">Requested On</th>
                <th className="p-4 text-xs font-semibold text-text-muted uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-border last:border-0 hover:bg-surface-2/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text">{user.name}</p>
                        <p className="text-xs text-text-muted">{user.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-text-muted">{user.email}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-text-muted">{formatDate(user.joinDate)}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <select 
                        id={`role-${user.id}`}
                        className="bg-surface border border-border rounded-md px-2 py-1.5 text-xs focus:border-primary focus:outline-none"
                        defaultValue="employee"
                      >
                        <option value="employee">Employee</option>
                        <option value="client">Client</option>
                        <option value="project_manager">PM</option>
                        <option value="hr_admin">HR</option>
                        <option value="super_admin">Admin</option>
                      </select>
                      
                      <button 
                        onClick={() => {
                          const role = (document.getElementById(`role-${user.id}`) as HTMLSelectElement).value
                          handleApprove(user.id, role)
                        }}
                        className="btn btn-primary px-3 py-1.5 text-xs flex items-center gap-1 border-0"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button 
                        onClick={() => handleReject(user.id)}
                        className="btn bg-surface-2 text-error hover:bg-error-bg hover:text-error border border-border px-3 py-1.5 text-xs flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
