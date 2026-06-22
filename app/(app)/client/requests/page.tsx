'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Clock, CheckCircle2, XCircle, FileText, ChevronRight, MessageSquare } from 'lucide-react'
import { getCurrentUser, type User } from '@/lib/data'
import { cn, formatDate } from '@/lib/utils'

export default function ClientRequestsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [requests, setRequests] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    budget: '',
    timeline: '',
  })

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    // Mock requests for now, will connect to real DB later
    setRequests([
      { id: '1', title: 'E-commerce Website Redesign', status: 'pending', createdAt: new Date().toISOString(), budget: 25000, timeline: '3 months' },
      { id: '2', title: 'Mobile App Development', status: 'approved', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), budget: 45000, timeline: '6 months' },
    ])
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setRequests([{
        id: Math.random().toString(),
        title: form.title,
        status: 'pending',
        createdAt: new Date().toISOString(),
        budget: Number(form.budget),
        timeline: form.timeline
      }, ...requests])
      setShowModal(false)
      setIsSubmitting(false)
      setForm({ title: '', description: '', budget: '', timeline: '' })
    }, 1000)
  }

  if (!user) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Project Requests</h1>
          <p className="text-text-muted mt-1">Submit and track your new project ideas</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center gap-2 border-0 bg-primary text-white"
        >
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      <div className="grid gap-4">
        {requests.map(req => (
          <div key={req.id} className="card p-5 bg-surface border border-border flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border",
                req.status === 'approved' ? "bg-success-bg border-success-border text-success" :
                req.status === 'rejected' ? "bg-error-bg border-error border text-error" :
                "bg-surface-2 border-border text-text-muted"
              )}>
                {req.status === 'approved' ? <CheckCircle2 className="w-5 h-5" /> :
                 req.status === 'rejected' ? <XCircle className="w-5 h-5" /> :
                 <Clock className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-text text-base">{req.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-text-muted font-medium">
                  <span>Submitted {formatDate(req.createdAt)}</span>
                  <span>·</span>
                  <span>Budget: ${req.budget.toLocaleString()}</span>
                  <span>·</span>
                  <span>Timeline: {req.timeline}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 sm:ml-auto">
              <span className={cn('badge capitalize',
                req.status === 'approved' ? 'badge-green' :
                req.status === 'rejected' ? 'badge-red' : 'badge-amber'
              )}>
                {req.status}
              </span>
              <button className="btn btn-secondary text-xs px-3 py-1.5 border border-border bg-transparent text-text hover:bg-surface-2">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isSubmitting && setShowModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative w-full max-w-lg bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-10">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h3 className="font-bold text-text text-base">New Project Request</h3>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="form-label text-xs">Project Title</label>
                  <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="form-input text-xs" placeholder="e.g. CRM Integration" />
                </div>
                <div>
                  <label className="form-label text-xs">Detailed Requirements</label>
                  <textarea required rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="form-input text-xs resize-none" placeholder="Describe your business needs..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label text-xs">Estimated Budget ($)</label>
                    <input required type="number" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} className="form-input text-xs" placeholder="10000" />
                  </div>
                  <div>
                    <label className="form-label text-xs">Desired Timeline</label>
                    <input required value={form.timeline} onChange={e => setForm({...form, timeline: e.target.value})} className="form-input text-xs" placeholder="e.g. 3 months" />
                  </div>
                </div>
                <div className="border-t border-border pt-4 mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary text-xs px-4 py-2 border-0 bg-transparent text-text-muted hover:bg-surface-2">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="btn btn-primary text-xs px-4 py-2 border-0 bg-primary text-white">
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
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
