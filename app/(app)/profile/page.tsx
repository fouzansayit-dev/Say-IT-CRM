'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User as UserIcon, Mail, Phone, Briefcase, Calendar, Star, Clock, AlertTriangle, TrendingUp, Award } from 'lucide-react'
import { getCurrentUser, type User } from '@/lib/data'
import { cn, formatDate, getInitials } from '@/lib/utils'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="spinner" /></div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card bg-surface border border-border overflow-hidden">
        <div className="h-32 bg-primary/10 relative">
          <div className="absolute -bottom-12 left-6">
            <div className="w-24 h-24 rounded-full bg-surface border-4 border-surface shadow-md flex items-center justify-center text-3xl font-bold text-text">
              {getInitials(user.name)}
            </div>
          </div>
        </div>
        <div className="pt-16 pb-6 px-6 flex flex-col md:flex-row gap-6 md:items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text">{user.name}</h1>
            <p className="text-primary font-medium mt-1">{user.position}</p>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-text-muted">
              <div className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {user.email}</div>
              {user.phone && <div className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {user.phone}</div>}
              {user.department && <div className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {user.department}</div>}
              <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined {formatDate(user.joinDate)}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="badge badge-green">Active Account</span>
            <span className="badge capitalize bg-surface-2 text-text border border-border">{user.role ? user.role.replace('_', ' ') : 'Pending Role'}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6 bg-surface border border-border hover:transform-none">
            <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-text text-lg">Performance Overview</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-surface-2 p-4 rounded-lg border border-border">
                <p className="text-xs font-semibold text-text-muted uppercase mb-1">Tasks Completed</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-text">145</span>
                  <span className="text-xs text-success">+12 this month</span>
                </div>
              </div>
              <div className="bg-surface-2 p-4 rounded-lg border border-border">
                <p className="text-xs font-semibold text-text-muted uppercase mb-1">Average Review Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-text">4.8</span>
                  <span className="text-xs text-text-muted">/ 5.0</span>
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-sm text-text mb-3">Recent HR Feedback</h3>
            <div className="space-y-3">
              <div className="p-4 bg-success-bg/30 border border-success-border rounded-lg flex items-start gap-3">
                <Award className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <div className="flex justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-text">Quarterly Performance Review</h4>
                    <span className="text-xs text-text-muted">2 weeks ago</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">Consistently delivers high-quality code. Showed great initiative in the recent frontend refactor. Keep up the excellent work!</p>
                </div>
              </div>
              <div className="p-4 bg-surface-2 border border-border rounded-lg flex items-start gap-3">
                <Clock className="w-5 h-5 text-text-muted flex-shrink-0 mt-0.5" />
                <div>
                  <div className="flex justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-text">Attendance Note</h4>
                    <span className="text-xs text-text-muted">1 month ago</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">Perfect attendance record for the last 30 days.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 bg-surface border border-border hover:transform-none">
            <h2 className="font-bold text-text mb-4">Skills & Endorsements</h2>
            <div className="flex flex-wrap gap-2">
              {['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'UI/UX Design', 'System Architecture'].map(skill => (
                <span key={skill} className="badge bg-surface-2 text-text border border-border px-2.5 py-1 text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          <div className="card p-6 bg-surface border border-border hover:transform-none">
            <h2 className="font-bold text-text mb-4">Current Assignments</h2>
            <div className="space-y-3">
              {['SAY IT Admin Portal', 'Mobile Application V2'].map(proj => (
                <div key={proj} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm font-medium text-text">{proj}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
