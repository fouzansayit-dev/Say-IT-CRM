'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, Users, Clock, FolderKanban, Lightbulb, 
  MessageSquare, AlertTriangle, BarChart2, Bell, Search,
  ChevronDown, LogOut, Settings, User, Menu, X, Zap, Building2
} from 'lucide-react'
import { getCurrentUser, isAuthenticated, logout, MOCK_NOTIFICATIONS, type User as UserType } from '@/lib/data'
import { getInitials, cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/attendance', icon: Clock, label: 'Attendance' },
  { href: '/employees', icon: Users, label: 'Employees' },
  { href: '/clients', icon: Building2, label: 'Clients' },
  { href: '/projects', icon: FolderKanban, label: 'Projects' },
  { href: '/ideas', icon: Lightbulb, label: 'Ideas Board' },
  { href: '/chat', icon: MessageSquare, label: 'Chat' },
  { href: '/problems', icon: AlertTriangle, label: 'Problems' },
  { href: '/reports', icon: BarChart2, label: 'Reports' },
  { href: '/client', icon: FolderKanban, label: 'Client Portal' },
  { href: '/admin/access-requests', icon: Users, label: 'Access Requests' },
  { href: '/admin/users', icon: Users, label: 'User Management' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<UserType | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.isRead).length

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    if (currentUser.approvalStatus === 'pending') {
      router.push('/pending')
      return
    }
    if (currentUser.approvalStatus === 'rejected') {
      router.push('/rejected')
      return
    }
    if (currentUser.approvalStatus === 'blocked' || !currentUser.isActive) {
      router.push('/blocked')
      return
    }
    setUser(currentUser)
  }, [router])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="spinner" />
    </div>
  )

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg border border-border bg-surface-2 flex items-center justify-center flex-shrink-0 cursor-pointer">
            <Zap className="w-5 h-5 text-text" />
          </div>
          <div>
            <h1 className="text-base font-bold text-text">SAY IT</h1>
            <p className="text-[10px] text-text-muted leading-none">Workplace Intelligence</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems
          .filter(item => {
            if (!user) return false
            if (user.role === 'client') {
              return item.href === '/client'
            }
            if (user.role === 'super_admin') {
              // Super admin can access everything except Client Portal
              return item.href !== '/client'
            }
            if (item.href.startsWith('/admin')) {
               return false
            }
            if (user.role === 'hr_admin') {
              return ['/dashboard', '/attendance', '/employees', '/clients', '/chat', '/reports'].includes(item.href)
            }
            // employee, project_manager, department_manager
            return ['/dashboard', '/attendance', '/projects', '/ideas', '/chat', '/problems'].includes(item.href)
          })
          .map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn('nav-item', isActive && 'active')}
              >
                <item.icon className="nav-icon" />
                <span>{item.label}</span>
                {item.href === '/chat' && (
                  <span className="nav-badge bg-surface-3 text-text-muted border border-border">3</span>
                )}
              </Link>
            )
          })}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-border">
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-2 transition-all cursor-pointer border-0 text-left bg-transparent"
          >
            <div className="w-8 h-8 rounded-full avatar flex items-center justify-center text-xs font-bold flex-shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-text truncate">{user.name}</p>
              <p className="text-xs text-text-muted truncate">{user.role ? user.role.replace('_', ' ') : 'Pending Role'}</p>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-text-muted transition-transform", userMenuOpen && "rotate-180")} />
          </button>
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute bottom-full left-0 right-0 mb-2 bg-surface border border-border rounded-lg shadow-none py-1 z-50"
              >
                <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text hover:bg-surface-2 no-underline">
                  <User className="w-4 h-4" /> My Profile
                </Link>
                <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text hover:bg-surface-2 no-underline">
                  <Settings className="w-4 h-4" /> Settings
                </Link>
                <div className="border-t border-border mt-1 pt-1">
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error-bg cursor-pointer border-0 bg-transparent text-left">
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex relative z-10 bg-background text-text">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-60 bg-surface border-r border-border z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 main-content">
        {/* Top bar */}
        <header className="topbar">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-2 text-text-muted cursor-pointer border-0 bg-transparent"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
              <input
                type="text"
                placeholder="Search tasks, projects, employees..."
                className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-1.5 text-sm text-text placeholder:text-text-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary-50/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text transition-all cursor-pointer border-0 bg-transparent"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-lg shadow-none py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-border flex items-center justify-between">
                      <span className="text-sm font-semibold text-text">Notifications</span>
                      <span className="badge badge-gray">{unreadCount} new</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {MOCK_NOTIFICATIONS.map(n => (
                        <div key={n.id} className={cn(
                          "px-4 py-3 hover:bg-surface-2 cursor-pointer border-b border-border last:border-0",
                          !n.isRead && "bg-surface-2"
                        )}>
                          {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary float-right mt-1" />}
                          <p className="text-sm font-medium text-text">{n.title}</p>
                          <p className="text-xs text-text-muted mt-0.5">{n.body}</p>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t border-border">
                      <Link href="/notifications" className="text-xs text-primary hover:underline no-underline font-medium">
                        View all notifications →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User avatar */}
            <div className="w-8 h-8 rounded-full avatar flex items-center justify-center text-xs font-bold cursor-pointer">
              {getInitials(user.name)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
