'use client'
import { ShieldAlert } from 'lucide-react'
import { logout } from '@/lib/data'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface border border-border rounded-xl shadow-lg p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-error-bg rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8 text-error" />
        </div>
        {children}
        <div className="pt-4 border-t border-border mt-6">
          <button onClick={handleLogout} className="text-sm font-medium text-primary hover:underline cursor-pointer border-0 bg-transparent">
            Sign Out & Return to Login
          </button>
        </div>
      </div>
    </div>
  )
}
