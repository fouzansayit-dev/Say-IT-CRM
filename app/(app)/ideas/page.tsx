'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, TrendingUp, ThumbsUp, ThumbsDown, Star,
  MessageSquare, Lightbulb, CheckCircle2, Clock
} from 'lucide-react'
import { fetchIdeas, createIdea, voteIdea, getCurrentUser, type Idea } from '@/lib/data'
import { cn, formatRelativeTime } from '@/lib/utils'

const CATEGORY_BADGES: Record<string, string> = {
  process: 'badge-gray',
  product: 'badge-gray',
  people: 'badge-gray',
  technology: 'badge-gray',
  cost_saving: 'badge-gray',
  revenue: 'badge-gray',
}

const STATUS_STYLES = {
  submitted: { label: 'Submitted', cls: 'badge-gray' },
  under_review: { label: 'Under Review', cls: 'badge-gray' },
  approved: { label: 'Approved', cls: 'badge-blue' },
  implemented: { label: 'Implemented', cls: 'badge-gray' },
  rejected: { label: 'Rejected', cls: 'badge-gray' },
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sort, setSort] = useState<'trending' | 'newest' | 'votes'>('trending')
  const [showForm, setShowForm] = useState(false)
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [form, setForm] = useState({ title: '', description: '', category: 'process', expectedBenefit: '', estimatedCost: '' })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const loadIdeas = async () => {
      const list = await fetchIdeas()
      setIdeas(list)
    }
    loadIdeas()
  }, [])

  const handleVote = async (id: string, type: 'up' | 'down' | 'star') => {
    const user = getCurrentUser()
    if (!user) return

    await voteIdea(id, user.id, type)
    const list = await fetchIdeas()
    setIdeas(list)

    if (selectedIdea && selectedIdea.id === id) {
      setSelectedIdea(list.find(i => i.id === id) || null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = getCurrentUser()
    if (!user) return
    
    const newIdea = await createIdea({
      title: form.title,
      description: form.description,
      category: form.category as any,
      expectedBenefit: form.expectedBenefit,
      estimatedCost: Number(form.estimatedCost) || 0,
      status: 'submitted',
      submittedBy: user.id
    })

    if (newIdea) {
      setIdeas([newIdea, ...ideas])
    }

    setSubmitted(true)
    setTimeout(() => { 
      setShowForm(false)
      setSubmitted(false)
      setForm({ title: '', description: '', category: 'process', expectedBenefit: '', estimatedCost: '' })
    }, 2000)
  }

  const filtered = ideas
    .filter(i => {
      const matchSearch = i.title.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || i.status === statusFilter
      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      if (sort === 'trending') return b.trendingScore - a.trendingScore
      if (sort === 'votes') return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  return (
    <div className="space-y-6 text-text">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Ideas Board</h1>
          <p className="text-text-muted mt-1">Share, vote, and improve together</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary flex items-center gap-2 border-0 bg-primary text-white">
          <Plus className="w-4 h-4" /> Share Idea
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Ideas', value: ideas.length, icon: Lightbulb, color: 'text-text-muted bg-surface-2 border border-border' },
          { label: 'Approved', value: ideas.filter(i => i.status === 'approved').length, icon: CheckCircle2, color: 'text-text-muted bg-surface-2 border border-border' },
          { label: 'Implemented', value: ideas.filter(i => i.status === 'implemented').length, icon: TrendingUp, color: 'text-text-muted bg-surface-2 border border-border' },
          { label: 'Under Review', value: ideas.filter(i => i.status === 'under_review').length, icon: Clock, color: 'text-text-muted bg-surface-2 border border-border' },
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

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ideas..." className="form-input pl-9" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-select w-auto">
          <option value="all">All Status</option>
          {Object.entries(STATUS_STYLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <div className="tab-segment p-1 gap-1 flex items-center">
          {(['trending', 'newest', 'votes'] as const).map(s => (
            <button key={s} onClick={() => setSort(s)}
              className={cn('tab-seg-item capitalize border-0 bg-transparent cursor-pointer', sort === s && 'active')}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Ideas list */}
      <div className="space-y-4">
        {filtered.map((idea, i) => (
          <motion.div
            key={idea.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="card p-5 flex gap-4 bg-surface border border-border">
              {/* Vote column */}
              <div className="flex flex-col items-center gap-2 pt-1 flex-shrink-0">
                <button
                  onClick={() => handleVote(idea.id, 'up')}
                  className={cn('p-1.5 rounded-lg transition-all border-0 bg-transparent cursor-pointer', idea.userVote === 'up' ? 'bg-surface-2 border border-border text-text' : 'text-text-muted hover:text-primary hover:bg-surface-2')}
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-text">{idea.upvotes - idea.downvotes}</span>
                <button
                  onClick={() => handleVote(idea.id, 'down')}
                  className={cn('p-1.5 rounded-lg transition-all border-0 bg-transparent cursor-pointer', idea.userVote === 'down' ? 'bg-surface-2 border border-border text-text' : 'text-text-muted hover:text-error hover:bg-surface-2')}
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedIdea(idea)}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-text hover:text-primary transition-colors">{idea.title}</h3>
                    {idea.trendingScore > 80 && (
                      <span className="badge badge-gray text-xs flex items-center gap-1"><TrendingUp className="w-3 h-3" />Trending</span>
                    )}
                  </div>
                  <span className={cn('badge flex-shrink-0', STATUS_STYLES[idea.status].cls)}>{STATUS_STYLES[idea.status].label}</span>
                </div>
                <p className="text-sm text-text-muted line-clamp-2 mb-3 leading-relaxed">{idea.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted font-medium">
                  <span className={cn('badge capitalize', CATEGORY_BADGES[idea.category])}>{idea.category.replace('_', ' ')}</span>
                  <span>by {idea.submittedByName}</span>
                  <span>{idea.department}</span>
                  <span>{formatRelativeTime(idea.createdAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end gap-3 flex-shrink-0">
                <button
                  onClick={() => handleVote(idea.id, 'star')}
                  className={cn('p-1.5 rounded-lg transition-all border-0 bg-transparent cursor-pointer', idea.userVote === 'star' ? 'bg-surface-2 border border-border text-warning' : 'text-text-muted hover:text-warning hover:bg-surface-2')}
                >
                  <Star className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5 text-xs text-text-muted font-semibold">
                  <MessageSquare className="w-3.5 h-3.5" /> {idea.comments}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-muted font-semibold">
                  <Star className="w-3.5 h-3.5" /> {idea.stars}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Idea detail modal */}
      <AnimatePresence>
        {selectedIdea && (
          <div
            className="modal-overlay"
            onClick={e => e.target === e.currentTarget && setSelectedIdea(null)}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="modal max-w-xl bg-surface"
            >
              <div className="modal-header border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn('badge capitalize', CATEGORY_BADGES[selectedIdea.category])}>{selectedIdea.category.replace('_', ' ')}</span>
                    <span className={cn('badge', STATUS_STYLES[selectedIdea.status].cls)}>{STATUS_STYLES[selectedIdea.status].label}</span>
                  </div>
                  <h3 className="text-xl font-bold text-text">{selectedIdea.title}</h3>
                  <p className="text-xs text-text-muted mt-1 font-semibold">by {selectedIdea.submittedByName} · {selectedIdea.department}</p>
                </div>
                <button onClick={() => setSelectedIdea(null)} className="text-text-muted hover:text-text border-0 bg-transparent cursor-pointer font-bold text-lg">✕</button>
              </div>
              <div className="modal-body space-y-6">
                <p className="text-sm text-text leading-relaxed">{selectedIdea.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-2 rounded-lg p-3">
                    <p className="text-xs text-text-muted font-bold">Expected Benefit</p>
                    <p className="text-sm text-text font-semibold mt-1">{selectedIdea.expectedBenefit}</p>
                  </div>
                  <div className="bg-surface-2 rounded-lg p-3">
                    <p className="text-xs text-text-muted font-bold">Estimated Cost</p>
                    <p className="text-sm font-bold text-text mt-1">${selectedIdea.estimatedCost.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleVote(selectedIdea.id, 'up')} className={cn('p-2 rounded-lg transition-all border-0 bg-transparent cursor-pointer', selectedIdea.userVote === 'up' ? 'bg-surface-2 border border-border text-primary font-bold' : 'text-text-muted hover:text-primary')}>
                      <ThumbsUp className="w-5 h-5" />
                    </button>
                    <span className="font-bold text-text">{selectedIdea.upvotes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleVote(selectedIdea.id, 'down')} className={cn('p-2 rounded-lg transition-all border-0 bg-transparent cursor-pointer', selectedIdea.userVote === 'down' ? 'bg-surface-2 border border-border text-error' : 'text-text-muted hover:text-error')}>
                      <ThumbsDown className="w-5 h-5" />
                    </button>
                    <span className="font-bold text-text">{selectedIdea.downvotes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleVote(selectedIdea.id, 'star')} className={cn('p-2 rounded-lg transition-all border-0 bg-transparent cursor-pointer', selectedIdea.userVote === 'star' ? 'bg-surface-2 border border-border text-warning' : 'text-text-muted hover:text-warning')}>
                      <Star className="w-5 h-5" />
                    </button>
                    <span className="font-bold text-text">{selectedIdea.stars}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-semibold text-text mb-3">Add Comment</p>
                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full avatar flex items-center justify-center text-xs font-bold flex-shrink-0">M</div>
                    <input placeholder="Share your thoughts..." className="form-input flex-1" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Submit idea modal */}
      <AnimatePresence>
        {showForm && (
          <div
            className="modal-overlay"
            onClick={e => e.target === e.currentTarget && setShowForm(false)}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="modal max-w-md bg-surface"
            >
              <div className="modal-header">
                <h3 className="text-lg font-bold text-text">Share an Idea</h3>
              </div>
              <div className="modal-body">
                {submitted ? (
                  <div className="text-center py-6">
                    <Lightbulb className="w-12 h-12 text-warning mx-auto mb-3" />
                    <p className="text-text font-bold">Idea Submitted!</p>
                    <p className="text-text-muted text-sm mt-1">Your colleagues can now vote and discuss</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="form-label">Title</label>
                      <input className="form-input" placeholder="A brief, catchy title" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                    </div>
                    <div>
                      <label className="form-label">Category</label>
                      <select className="form-select w-full" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                        {Object.keys(CATEGORY_BADGES).map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Description</label>
                      <textarea className="form-input h-24 resize-none" placeholder="Describe your idea in detail..." required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                    </div>
                    <div>
                      <label className="form-label">Expected Benefit</label>
                      <input className="form-input" placeholder="What impact will this have?" value={form.expectedBenefit} onChange={e => setForm(f => ({ ...f, expectedBenefit: e.target.value }))} />
                    </div>
                    <div>
                      <label className="form-label">Estimated Cost ($)</label>
                      <input type="number" className="form-input" placeholder="0" value={form.estimatedCost} onChange={e => setForm(f => ({ ...f, estimatedCost: e.target.value }))} />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-lg border border-border bg-transparent text-text-muted hover:bg-surface-2 transition-all text-sm font-semibold cursor-pointer">Cancel</button>
                      <button type="submit" className="flex-1 btn btn-primary py-2.5 bg-primary text-white border-0">Submit Idea</button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
