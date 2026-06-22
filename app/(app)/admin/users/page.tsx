'use client'
import { useState, useEffect } from 'react'
import { Search, Shield, User as UserIcon, Settings, Lock, Unlock, Download } from 'lucide-react'
import { getCurrentUser, fetchAllUsers, updateUserApprovalStatus, type User } from '@/lib/data'
import { formatDate, getInitials } from '@/lib/utils'

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'blocked' | 'rejected'>('all')
  const currentUser = getCurrentUser()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setIsLoading(true)
    const allUsers = await fetchAllUsers()
    setUsers(allUsers)
    setIsLoading(false)
  }

  const handleBlock = async (userId: string) => {
    if (!currentUser) return
    if (confirm('Are you sure you want to block this user? They will immediately lose access.')) {
      const success = await updateUserApprovalStatus(userId, 'blocked', { adminId: currentUser.id })
      if (success) loadUsers()
    }
  }

  const handleUnblock = async (userId: string) => {
    if (!currentUser) return
    const success = await updateUserApprovalStatus(userId, 'approved', { adminId: currentUser.id })
    if (success) loadUsers()
  }

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Status', 'Joined']
    const csvData = filteredUsers.map(u => [
      u.name,
      u.email,
      u.role,
      u.approvalStatus,
      u.joinDate
    ].join(','))
    
    const csvContent = [headers.join(','), ...csvData].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'users_export.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' ? true : u.approvalStatus === filter
    return matchesSearch && matchesFilter
  })

  if (isLoading) return <div className="p-8 flex justify-center"><div className="spinner" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-primary" />
            User Management
          </h1>
          <p className="text-text-muted mt-1">Manage all enterprise users, their roles, and access statuses.</p>
        </div>
        <button onClick={handleExportCSV} className="btn bg-surface-2 border border-border text-text hover:bg-surface-3 flex items-center gap-2 px-4 py-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-surface p-4 border border-border rounded-lg">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-sm font-medium text-text-muted whitespace-nowrap">Filter Status:</label>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-surface border border-border rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none flex-1 md:w-40"
          >
            <option value="all">All Users</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="blocked">Blocked</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-2">
              <th className="p-4 text-xs font-semibold text-text-muted uppercase">User</th>
              <th className="p-4 text-xs font-semibold text-text-muted uppercase">Role</th>
              <th className="p-4 text-xs font-semibold text-text-muted uppercase">Status</th>
              <th className="p-4 text-xs font-semibold text-text-muted uppercase">Joined</th>
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
                      <p className="text-xs text-text-muted">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="badge bg-surface-2 border border-border text-text capitalize">
                    {user.role?.replace('_', ' ') || 'None'}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`badge ${
                    user.approvalStatus === 'approved' ? 'badge-green' :
                    user.approvalStatus === 'pending' ? 'bg-warning-bg text-warning border-warning-border' :
                    'bg-error-bg text-error border-error-border'
                  } capitalize`}>
                    {user.approvalStatus}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-sm text-text-muted">{formatDate(user.joinDate)}</span>
                </td>
                <td className="p-4 text-right">
                  {user.approvalStatus === 'approved' && user.id !== currentUser?.id && (
                    <button 
                      onClick={() => handleBlock(user.id)}
                      className="btn bg-surface-2 text-error hover:bg-error-bg hover:text-error border border-border px-3 py-1.5 text-xs flex items-center gap-1 inline-flex"
                    >
                      <Lock className="w-3.5 h-3.5" /> Block
                    </button>
                  )}
                  {user.approvalStatus === 'blocked' && (
                    <button 
                      onClick={() => handleUnblock(user.id)}
                      className="btn bg-surface-2 text-success hover:bg-success-bg hover:text-success border border-border px-3 py-1.5 text-xs flex items-center gap-1 inline-flex"
                    >
                      <Unlock className="w-3.5 h-3.5" /> Unblock
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-text-muted text-sm">
                  No users found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
