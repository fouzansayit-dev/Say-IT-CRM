'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Eye, EyeOff, LogIn, Zap, Shield, BarChart3, MessageSquare, 
  UserPlus, Database, Users, Clock, FolderKanban, Lightbulb 
} from 'lucide-react'
import { login, signUp, isSupabaseConfigured } from '@/lib/data'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  
  // Sign In states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Sign Up states
  const [suName, setSuName] = useState('')
  const [suEmail, setSuEmail] = useState('')
  const [suPassword, setSuPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 800))
    
    try {
      const user = await login(email, password)
      if (user) {
        if (user.role === 'client') {
          router.push('/client')
        } else {
          router.push('/dashboard')
        }
      } else {
        if (!isSupabaseConfigured) {
          setError('Database is not connected. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file to enable authentication.')
        } else {
          setError('Invalid email or password. Please verify your credentials.')
        }
        setIsLoading(false)
      }
    } catch (err: any) {
      if (err?.message === 'Email not confirmed') {
        setError('Your email has not been confirmed yet. Please check your inbox for the confirmation link.')
      } else {
        setError(err?.message || 'Invalid email or password. Please verify your credentials.')
      }
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccessMsg('')
    await new Promise(r => setTimeout(r, 800))
    
    if (!isSupabaseConfigured) {
      setError('Database is not connected. Sign up is unavailable in offline fallback mode.')
      setIsLoading(false)
      return
    }

    try {
      // Default new self-service accounts to role: employee, department: General, position: Staff
      const user = await signUp(suEmail, suPassword, suName, 'employee', 'General', 'Staff')
      if (user) {
        setSuccessMsg('Account registered successfully! Checking confirmation status...')
        try {
          const loggedIn = await login(suEmail, suPassword)
          if (loggedIn) {
            if (loggedIn.role === 'client') {
              router.push('/client')
            } else {
              router.push('/dashboard')
            }
          } else {
            setIsLoading(false)
            setActiveTab('signin')
            setEmail(suEmail)
            setPassword(suPassword)
          }
        } catch (loginErr: any) {
          if (loginErr?.message === 'Email not confirmed') {
            setSuccessMsg('Account registered successfully! A confirmation link has been sent to your email. Please check your inbox before logging in.')
            setIsLoading(false)
            setActiveTab('signin')
            setEmail(suEmail)
            setPassword(suPassword)
          } else {
            setError(loginErr?.message || 'Failed to auto-login. Please try logging in manually.')
            setIsLoading(false)
          }
        }
      } else {
        setError('Failed to create account. Email may already be in use.')
        setIsLoading(false)
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to register account')
      setIsLoading(false)
    }
  }

  const features = [
    { icon: Zap, label: 'Attendance Tracking', color: 'text-text-muted', bg: 'bg-surface-2' },
    { icon: BarChart3, label: 'Project Analytics', color: 'text-text-muted', bg: 'bg-surface-2' },
    { icon: MessageSquare, label: 'Real-Time Chat', color: 'text-text-muted', bg: 'bg-surface-2' },
    { icon: Shield, label: 'Secure & Compliant', color: 'text-text-muted', bg: 'bg-surface-2' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text relative overflow-hidden">
      {/* Dynamic ambient background glow */}
      <div 
        className="fixed pointer-events-none transition-all duration-1000 -z-10 opacity-15 blur-[120px] rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600" 
        style={{ width: '50vw', height: '50vw', left: '5%', top: '15%' }} 
      />

      <div className="w-full max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Left: Dynamic Branding */}
        <div className="hidden lg:block min-h-[460px] flex flex-col justify-between">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg border border-border bg-surface-2 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-text" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text truncate">SAY IT — Workplace Console</h1>
                <p className="text-[10px] text-text-muted leading-none">Smart Administration & Yield Intelligence Tracker</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-text leading-tight">
              One workplace.<br />
              <span className="text-primary">Every employee.</span><br />
              Every project.
            </h2>
            
            <p className="text-text-muted text-base leading-relaxed max-w-md">
              Replace scattered spreadsheets and disconnected tools with a single intelligent platform that gives everyone visibility into what matters.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {features.map((f) => (
                <div
                  key={f.label}
                  className="p-4 rounded-lg border border-border bg-surface flex items-center gap-3"
                >
                  <div className={cn("p-2 rounded-lg border border-border/50", f.bg)}>
                    <f.icon className={cn("w-5 h-5", f.color)} />
                  </div>
                  <span className="text-xs font-semibold text-text truncate">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="card p-8 md:p-10 border border-border bg-surface">
            {/* Database Disconnected Banner */}
            {!isSupabaseConfigured && (
              <div className="mb-6 p-4 rounded-lg bg-warning-bg border border-warning-border flex items-start gap-3">
                <Database className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-text mb-1">Database Disconnected</h4>
                  <p className="text-xs text-text-muted leading-relaxed">
                    The application is running in offline demo mode. Set <code className="bg-surface-2 px-1 py-0.5 rounded font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-surface-2 px-1 py-0.5 rounded font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your <code className="bg-surface-2 px-1 py-0.5 rounded font-mono">.env</code> file to connect your database.
                  </p>
                </div>
              </div>
            )}

            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg border border-border bg-surface-2 flex items-center justify-center">
                <Zap className="w-5 h-5 text-text" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text">SAY IT</h1>
                <p className="text-xs text-text-muted">Workplace Intelligence Platform</p>
              </div>
            </div>

            {/* Tab selection */}
            <div className="flex border-b border-border mb-8">
              <button
                onClick={() => { setActiveTab('signin'); setError(''); setSuccessMsg('') }}
                className={cn(
                  'flex-1 pb-3 text-sm font-bold border-b-2 bg-transparent cursor-pointer transition-all border-0 outline-none',
                  activeTab === 'signin' ? 'border-primary text-text' : 'border-transparent text-text-muted'
                )}
              >
                Sign In
              </button>
              <button
                onClick={() => { setActiveTab('signup'); setError(''); setSuccessMsg('') }}
                className={cn(
                  'flex-1 pb-3 text-sm font-bold border-b-2 bg-transparent cursor-pointer transition-all border-0 outline-none',
                  activeTab === 'signup' ? 'border-primary text-text' : 'border-transparent text-text-muted'
                )}
              >
                Create Account
              </button>
            </div>

            {activeTab === 'signin' ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="form-label">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="form-input"
                    placeholder="you@company.com"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="form-label">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="form-input pr-10"
                      placeholder="Enter your password"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer border-0 bg-transparent"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-error text-xs bg-error-bg border border-error-border rounded-lg px-3 py-2 leading-relaxed"
                  >
                    {error}
                  </motion.p>
                )}

                {successMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-success text-xs bg-success-bg border border-success-border rounded-lg px-3 py-2 leading-relaxed"
                  >
                    {successMsg}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn btn-primary py-3 text-base flex items-center justify-center gap-2 border-0 bg-primary text-white"
                >
                  {isLoading ? (
                    <div className="spinner" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Sign in
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4 pr-1">
                <div className="bg-surface-2 p-3 rounded-lg border border-border mb-4">
                  <p className="text-xs text-text-muted leading-relaxed">
                    <strong className="text-text">Note:</strong> New accounts are subject to administrator approval. You will not have dashboard access until your role has been verified and assigned by an Admin.
                  </p>
                </div>
                <div>
                  <label className="form-label text-xs">Full Name</label>
                  <input
                    type="text"
                    value={suName}
                    onChange={e => setSuName(e.target.value)}
                    className="form-input py-2 text-xs"
                    placeholder="John Doe"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="form-label text-xs">Email Address</label>
                  <input
                    type="email"
                    value={suEmail}
                    onChange={e => setSuEmail(e.target.value)}
                    className="form-input py-2 text-xs"
                    placeholder="john@company.com"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="form-label text-xs">Password</label>
                  <input
                    type="password"
                    value={suPassword}
                    onChange={e => setSuPassword(e.target.value)}
                    className="form-input py-2 text-xs"
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-error text-xs bg-error-bg border border-error-border rounded-lg px-3 py-2 leading-relaxed"
                  >
                    {error}
                  </motion.p>
                )}

                {successMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-success text-xs bg-success-bg border border-success-border rounded-lg px-3 py-2 leading-relaxed"
                  >
                    {successMsg}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn btn-primary py-2.5 text-sm flex items-center justify-center gap-2 border-0 bg-primary text-white"
                >
                  {isLoading ? (
                    <div className="spinner" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Create Account
                    </>
                  )}
                </button>
              </form>
            )}

            <p className="text-center text-xs text-text-muted mt-8 font-semibold">
              Protected by JWT authentication • Session persists in secure cookie store
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
