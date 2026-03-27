import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import Navbar from '../common/Navbar'
import StatsCard from '../common/StatsCard'
import AssignmentCard from './AssignmentCard'
import EmptyState from '../common/EmptyState'
import Spinner from '../common/Spinner'
import {
  RiFileListLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiAwardLine,
  RiDashboardLine,
  RiSearchLine,
  RiFilterLine,
} from 'react-icons/ri'

const NAV_LINKS = [
  { href: '/student', label: 'Dashboard', icon: RiDashboardLine },
]

const FILTERS = ['all', 'pending', 'submitted', 'graded', 'overdue']

export default function StudentDashboard() {
  const { profile } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState({}) // assignmentId -> submission
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [refresh, setRefresh] = useState(0)

  const fetchData = useCallback(async () => {
    if (!profile) return
    setLoading(true)

    const [{ data: asgns }, { data: subs }] = await Promise.all([
      supabase
        .from('assignments')
        .select('*')
        .order('due_date', { ascending: true }),
      supabase
        .from('submissions')
        .select('*')
        .eq('student_id', profile.id),
    ])

    setAssignments(asgns || [])

    const subMap = {}
    subs?.forEach((s) => { subMap[s.assignment_id] = s })
    setSubmissions(subMap)

    setLoading(false)
  }, [profile, refresh])

  useEffect(() => { fetchData() }, [fetchData])

  const now = new Date()

  // Stats
  const total = assignments.length
  const submittedCount = Object.keys(submissions).length
  const graded = Object.values(submissions).filter((s) => s.marks_awarded != null).length
  const pending = assignments.filter((a) => !submissions[a.id]).length

  // Filter + search
  const filtered = assignments.filter((a) => {
    const sub = submissions[a.id]
    const overdue = now > new Date(a.due_date)

    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false

    switch (filter) {
      case 'pending': return !sub && !overdue
      case 'submitted': return !!sub
      case 'graded': return sub?.marks_awarded != null
      case 'overdue': return overdue && !sub
      default: return true
    }
  })

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar links={NAV_LINKS} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display font-bold text-3xl text-[var(--text-primary)]">
            Hello, {profile?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Here are your current assignments
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard icon={RiFileListLine} label="Total Assignments" value={total} color="brand" />
          <StatsCard icon={RiCheckboxCircleLine} label="Submitted" value={submittedCount} color="emerald" />
          <StatsCard icon={RiTimeLine} label="Pending" value={pending} color="amber" />
          <StatsCard icon={RiAwardLine} label="Graded" value={graded} color="rose" />
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assignments…"
              className="input pl-9 py-2 text-sm"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-1 flex-wrap">
            <RiFilterLine className="text-[var(--text-secondary)] text-sm ml-1" />
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all duration-200 capitalize ${
                  filter === f
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Assignment grid */}
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={RiFileListLine}
            title={search || filter !== 'all' ? 'No matching assignments' : 'No assignments yet'}
            description={
              search || filter !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Your teacher hasn\'t posted any assignments yet. Check back soon!'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-stagger">
            {filtered.map((a) => (
              <AssignmentCard
                key={a.id}
                assignment={a}
                submission={submissions[a.id] || null}
                onRefresh={() => setRefresh((r) => r + 1)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
