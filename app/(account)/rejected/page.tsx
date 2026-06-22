'use client'
import { useEffect, useState } from 'react'
import { getCurrentUser, type User } from '@/lib/data'

export default function RejectedPage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  return (
    <>
      <h1 className="text-2xl font-bold text-text">Access Rejected</h1>
      <p className="text-text-muted mt-2 leading-relaxed">
        Your access request has been rejected by the administrator.
      </p>
      {user?.rejectionReason && (
        <div className="mt-4 p-4 bg-surface-2 border border-border rounded-lg text-left">
          <p className="text-sm font-semibold text-text mb-1">Reason:</p>
          <p className="text-sm text-text-muted">{user.rejectionReason}</p>
        </div>
      )}
    </>
  )
}
