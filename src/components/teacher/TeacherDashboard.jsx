import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import Navbar from '../common/Navbar'
import StatsCard from '../common/StatsCard'
import CreateAssignment from './CreateAssignment'
import AssignmentList from './AssignmentList'
import toast from 'react-hot-toast'
import {
  RiFileListLine,
  RiGroupLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiDashboardLine,
  RiAddCircleLine,
} from 'react-icons/ri'

const NAV_LINKS = [
  { href: '/teacher', label: 'Dashboard', icon: RiDashboardLine },
]

export default function TeacherDashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({
    totalAssignments: 0,
    totalSubmissions: 0,
    gradedSubmissions: 0,
    pendingSubmissions: 0,
  })
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    if (!profile) return
    async function loadStats() {
      const [{ count: ta }, { data: subs }] = await Promise.all([
        supabase.from('assignments').select('*', { count: 'exact', head: true }).eq('created_by', profile.id),
        supabase.from('submissions')
          .select('marks_awarded, assignment_id, assignments!inner(created_by)')
          .eq('assignments.created_by', profile.id),
      ])

      const graded = subs?.filter((s) => s.marks_awarded != null).length || 0
      setStats({
        totalAssignments: ta || 0,
        totalSubmissions: subs?.length || 0,
        gradedSubmissions: graded,
        pendingSubmissions: (subs?.length || 0) - graded,
      })
    }
    loadStats()
  }, [profile, refresh])

  function handleCreated() {
    setRefresh((r) => r + 1)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar links={NAV_LINKS} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl text-[var(--text-primary)]">
              Welcome back, {profile?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-[var(--text-secondary)] mt-1">
              Manage your assignments and review student submissions
            </p>
          </div>
          <CreateAssignment onCreated={handleCreated} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard icon={RiFileListLine} label="Total Assignments" value={stats.totalAssignments} color="brand" />
          <StatsCard icon={RiGroupLine} label="Total Submissions" value={stats.totalSubmissions} color="emerald" />
          <StatsCard icon={RiCheckboxCircleLine} label="Graded" value={stats.gradedSubmissions} color="amber" />
          <StatsCard icon={RiTimeLine} label="Pending Grade" value={stats.pendingSubmissions} color="rose" />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm font-display font-semibold">
            <RiAddCircleLine />
            Your Assignments
          </div>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        {/* Assignment list */}
        <AssignmentList refresh={refresh} />
      </main>
    </div>
  )
}
