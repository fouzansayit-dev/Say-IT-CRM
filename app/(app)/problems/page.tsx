'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, ThumbsUp, ChevronDown, ChevronUp, 
  CheckCircle2, AlertTriangle, Clock, Users, Shield
} from 'lucide-react'
import { fetchProblems, createProblem, createSolution, selectSolution, getCurrentUser, type User, type Problem } from '@/lib/data'
import { cn, formatDate, formatRelativeTime } from '@/lib/utils'
import { useEffect } from 'react'

const SEVERITY_STYLES = {
  low: { label: 'Low', cls: 'badge-gray', dot: 'status-dot-gray' },
  medium: { label: 'Medium', cls: 'badge-gray', dot: 'status-dot-gray' },
  high: { label: 'High', cls: 'badge-gray', dot: 'status-dot-gray' },
  critical: { label: 'Critical', cls: 'badge-gray', dot: 'status-dot-gray' },
}

const STATUS_STYLES = {
  open: { label: 'Open', cls: 'badge-gray' },
  in_review: { label: 'In Review', cls: 'badge-gray' },
  solved: { label: 'Solved', cls: 'badge-blue' },
  closed: { label: 'Closed', cls: 'badge-gray' },
}

export default function ProblemsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [problems, setProblems] = useState<Problem[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showSolutionForm, setShowSolutionForm] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [filter, setFilter] = useState<'all' | 'open' | 'in_review' | 'solved'>('all')

  useEffect(() => {
    const loadProblems = async () => {
      const currentUser = getCurrentUser()
      setUser(currentUser)
      const list = await fetchProblems()
      setProblems(list)
      if (list.length > 0) {
        setExpanded(list[0].id)
      }
    }
    loadProblems()
  }, [])

  const handleVoteSolution = (problemId: string, solutionId: string) => {
    setProblems(prev => prev.map(p => {
      if (p.id !== problemId) return p
      return {
        ...p,
        solutions: p.solutions.map(s => {
          if (s.id !== solutionId) return s
          return { ...s, votes: s.userVoted ? s.votes - 1 : s.votes + 1, userVoted: !s.userVoted }
        })
      }
    }))
  }

  const handleSelectSolution = async (problemId: string, solutionId: string) => {
    await selectSolution(problemId, solutionId)
    const list = await fetchProblems()
    setProblems(list)
  }

  const handleSolutionSubmit = async (problemId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    const target = e.currentTarget
    const title = (target.elements[0] as HTMLInputElement).value
    const description = (target.elements[1] as HTMLTextAreaElement).value
    const cost = Number((target.elements[2] as HTMLInputElement).value) || 0
    const timeline = (target.elements[3] as HTMLInputElement).value

    const newSol = await createSolution({
      problemId,
      title,
      description,
      pros: [],
      cons: [],
      estimatedCost: cost,
      estimatedTime: timeline,
      submittedBy: user.id
    })

    if (newSol) {
      const list = await fetchProblems()
      setProblems(list)
    }
    setShowSolutionForm(null)
  }

  const handleProblemSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    const target = e.currentTarget
    const title = (target.elements[0] as HTMLInputElement).value
    const severity = (target.elements[1] as HTMLSelectElement).value as any
    const deadline = (target.elements[2] as HTMLInputElement).value
    const description = (target.elements[3] as HTMLTextAreaElement).value

    const newProb = await createProblem({
      title,
      description,
      severity,
      department: user.department,
      deadline,
      status: 'open' as const,
      createdBy: user.id
    })

    if (newProb) {
      setProblems([newProb, ...problems])
    }

    setSubmitted(true)
    setTimeout(() => { 
      setShowForm(false)
      setSubmitted(false) 
    }, 2000)
  }

  const filtered = problems.filter(p => filter === 'all' || p.status === filter)

  if (user && user.role === 'hr_admin') {
    return (
      <div className="card p-12 text-center bg-surface border border-border max-w-xl mx-auto mt-12">
        <Shield className="w-12 h-12 mx-auto mb-4 text-text-subtle" />
        <h2 className="text-lg font-bold text-text mb-2">Access Denied</h2>
        <p className="text-text-muted text-sm leading-relaxed">
          HR administrators do not have access to the engineering problem solving boards. This view is restricted to engineering and product team members.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-text">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Problem Solving</h1>
          <p className="text-text-muted mt-1">Collective intelligence for better solutions</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary flex items-center gap-2 border-0 bg-primary text-white">
          <Plus className="w-4 h-4" /> Report Problem
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Open', value: problems.filter(p => p.status === 'open').length, icon: AlertTriangle, color: 'text-text-muted bg-surface-2 border border-border' },
          { label: 'In Review', value: problems.filter(p => p.status === 'in_review').length, icon: Clock, color: 'text-text-muted bg-surface-2 border border-border' },
          { label: 'Solved', value: problems.filter(p => p.status === 'solved').length, icon: CheckCircle2, color: 'text-text-muted bg-surface-2 border border-border' },
          { label: 'Solutions', value: problems.reduce((a, p) => a + p.solutions.length, 0), icon: Users, color: 'text-text-muted bg-surface-2 border border-border' },
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

      {/* Filter tabs */}
      <div className="tab-segment">
        {(['all', 'open', 'in_review', 'solved'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('tab-seg-item capitalize border-0 bg-transparent cursor-pointer', filter === f && 'active')}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Problems list */}
      <div className="space-y-4">
        {filtered.map((problem, i) => {
          const isExpanded = expanded === problem.id
          const sev = SEVERITY_STYLES[problem.severity]
          return (
            <motion.div
              key={problem.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card overflow-hidden bg-surface border border-border hover:transform-none cursor-default"
            >
              {/* Problem header */}
              <div
                className="p-5 flex items-start gap-4 cursor-pointer hover:bg-surface-2 transition-all"
                onClick={() => setExpanded(isExpanded ? null : problem.id)}
              >
                <div className={cn('status-dot mt-1.5', sev.dot)} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5 font-bold">
                    <h3 className="text-sm text-text font-bold">{problem.title}</h3>
                    <span className={cn('badge text-xs', sev.cls)}>{sev.label}</span>
                    <span className={cn('badge text-xs', STATUS_STYLES[problem.status].cls)}>{STATUS_STYLES[problem.status].label}</span>
                    {problem.selectedSolutionId && <span className="badge badge-gray text-xs">✓ Solution Selected</span>}
                  </div>
                  <p className="text-sm text-text-muted line-clamp-2 leading-relaxed">{problem.description}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-text-muted font-semibold">
                    <span>by {problem.createdByName}</span>
                    <span>{problem.department}</span>
                    <span>Deadline: {formatDate(problem.deadline)}</span>
                    <span>{problem.solutions.length} solution{problem.solutions.length !== 1 ? 's' : ''}</span>
                    <span>{formatRelativeTime(problem.createdAt)}</span>
                  </div>
                </div>
                <button className="text-text-muted hover:text-text flex-shrink-0 border-0 bg-transparent cursor-pointer">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {/* Expanded: solutions */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 border-t border-border bg-surface">
                      <p className="text-sm text-text pt-4 mb-4 leading-relaxed">{problem.description}</p>

                      {problem.solutions.length > 0 ? (
                        <div className="space-y-3 mb-4">
                          <h4 className="text-sm font-semibold text-text">Proposed Solutions</h4>
                          {problem.solutions.sort((a, b) => b.votes - a.votes).map(sol => (
                            <div key={sol.id} className={cn('rounded-lg border p-4 bg-surface-2 border-border',
                              problem.selectedSolutionId === sol.id && 'bg-surface border-primary'
                            )}>
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex items-center gap-2">
                                  {problem.selectedSolutionId === sol.id && <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />}
                                  <h5 className="font-bold text-text text-sm">{sol.title}</h5>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <button
                                    onClick={() => handleVoteSolution(problem.id, sol.id)}
                                    className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border-0 cursor-pointer transition-all',
                                      sol.userVoted ? 'bg-primary text-white' : 'bg-surface hover:bg-surface-3 text-text-muted hover:text-text border border-border'
                                    )}
                                  >
                                    <ThumbsUp className="w-3.5 h-3.5" />{sol.votes}
                                  </button>
                                  {problem.status !== 'solved' && (
                                    <button
                                      onClick={() => handleSelectSolution(problem.id, sol.id)}
                                      className="btn btn-secondary btn-sm bg-surface border-border text-text hover:bg-surface-2 border"
                                    >
                                      Select
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-text-muted mb-3 leading-relaxed">{sol.description}</p>
                              <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                  <p className="text-xs text-text-muted font-bold mb-1.5">Pros</p>
                                  {sol.pros.map((p, i) => <p key={i} className="text-xs text-text font-semibold">✓ {p}</p>)}
                                </div>
                                <div>
                                  <p className="text-xs text-text-muted font-bold mb-1.5">Cons</p>
                                  {sol.cons.map((c, i) => <p key={i} className="text-xs text-text font-semibold">✗ {c}</p>)}
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-text-muted font-semibold pt-2.5 border-t border-border">
                                <span>by {sol.submittedByName}</span>
                                <span>Cost: ${sol.estimatedCost.toLocaleString()}</span>
                                <span>Timeline: {sol.estimatedTime}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-surface-2 rounded-xl border border-border mb-4">
                          <p className="text-text-muted text-sm font-medium">No solutions yet. Be the first to propose one!</p>
                        </div>
                      )}

                      {showSolutionForm === problem.id ? (
                        <form onSubmit={(e) => handleSolutionSubmit(problem.id, e)} className="space-y-3 bg-surface-2 rounded-xl border border-border p-4">
                          <h4 className="text-sm font-semibold text-text">Propose a Solution</h4>
                          <input className="form-input" placeholder="Solution title" required />
                          <textarea className="form-input h-20 resize-none" placeholder="Describe your solution..." required />
                          <div className="grid grid-cols-2 gap-3">
                            <input className="form-input" placeholder="Estimated cost ($)" type="number" />
                            <input className="form-input" placeholder="Timeline (e.g. 1 week)" />
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => setShowSolutionForm(null)} className="flex-1 py-2 rounded-lg border border-border bg-transparent text-text-muted hover:bg-surface-3 transition-all text-sm font-semibold cursor-pointer">Cancel</button>
                            <button type="submit" className="flex-1 btn btn-primary py-2 text-sm bg-primary text-white border-0">Submit</button>
                          </div>
                        </form>
                      ) : (
                        <button onClick={() => setShowSolutionForm(problem.id)} className="btn btn-ghost text-sm flex items-center gap-2 border-0 bg-transparent cursor-pointer">
                          <Plus className="w-4 h-4" /> Propose Solution
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Report problem modal */}
      <AnimatePresence>
        {showForm && (
          <div
            className="modal-overlay"
            onClick={e => e.target === e.currentTarget && setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal max-w-md bg-surface"
            >
              <div className="modal-header">
                <h3 className="text-lg font-bold text-text">Report a Problem</h3>
              </div>
              <div className="modal-body">
                {submitted ? (
                  <div className="text-center py-6">
                    <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-3" />
                    <p className="text-text font-bold">Problem Reported!</p>
                    <p className="text-text-muted text-sm mt-1">Your team can now propose solutions</p>
                  </div>
                ) : (
                  <form onSubmit={handleProblemSubmit} className="space-y-4">
                    <div>
                      <label className="form-label">Problem Title</label>
                      <input className="form-input" placeholder="Brief, descriptive title" required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="form-label">Severity</label>
                        <select className="form-select w-full">
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label">Deadline</label>
                        <input type="date" className="form-input" required />
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Description</label>
                      <textarea className="form-input h-24 resize-none" placeholder="Detailed description of the problem..." required />
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-lg border border-border bg-transparent text-text-muted hover:bg-surface-2 transition-all text-sm font-semibold cursor-pointer">Cancel</button>
                      <button type="submit" className="flex-1 btn btn-primary py-2.5 bg-primary text-white border-0">Report Problem</button>
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
