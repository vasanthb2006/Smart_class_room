import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { format, isPast } from 'date-fns'
import toast from 'react-hot-toast'
import {
  RiFileListLine,
  RiCalendarLine,
  RiAwardLine,
  RiEyeLine,
  RiDeleteBinLine,
  RiGroupLine,
  RiTimeLine,
} from 'react-icons/ri'
import Modal from '../common/Modal'
import EmptyState from '../common/EmptyState'
import ViewSubmissions from './ViewSubmissions'
import Spinner from '../common/Spinner'

export default function AssignmentList({ refresh }) {
  const { profile } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null) // assignment for modal
  const [subCounts, setSubCounts] = useState({})

  const fetchAssignments = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('created_by', profile.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setAssignments(data)
      // Fetch submission counts
      const ids = data.map((a) => a.id)
      if (ids.length) {
        const { data: subs } = await supabase
          .from('submissions')
          .select('assignment_id')
          .in('assignment_id', ids)

        const counts = {}
        subs?.forEach((s) => {
          counts[s.assignment_id] = (counts[s.assignment_id] || 0) + 1
        })
        setSubCounts(counts)
      }
    }
    setLoading(false)
  }, [profile.id])

  useEffect(() => { fetchAssignments() }, [fetchAssignments, refresh])

  async function deleteAssignment(id) {
    if (!confirm('Delete this assignment and all submissions?')) return
    const { error } = await supabase.from('assignments').delete().eq('id', id)
    if (error) toast.error('Failed to delete')
    else {
      toast.success('Assignment deleted')
      fetchAssignments()
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16"><Spinner size="lg" /></div>
    )
  }

  if (!assignments.length) {
    return (
      <EmptyState
        icon={RiFileListLine}
        title="No assignments yet"
        description="Click 'New Assignment' above to create your first one."
      />
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-stagger">
        {assignments.map((a) => {
          const overdue = isPast(new Date(a.due_date))
          const count = subCounts[a.id] || 0

          return (
            <div key={a.id} className="card card-hover p-5 flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={overdue ? 'badge-danger' : 'badge-success'}>
                      {overdue ? 'Closed' : 'Open'}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-[var(--text-primary)] text-base leading-tight line-clamp-2">
                    {a.title}
                  </h3>
                </div>
                <button
                  onClick={() => deleteAssignment(a.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex-shrink-0"
                >
                  <RiDeleteBinLine />
                </button>
              </div>

              {/* Description */}
              {a.description && (
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                  {a.description}
                </p>
              )}

              {/* Meta */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <RiCalendarLine className="text-brand-500 flex-shrink-0" />
                  <span>Due: <strong className="text-[var(--text-primary)]">{format(new Date(a.due_date), 'dd MMM yyyy, HH:mm')}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <RiAwardLine className="text-brand-500 flex-shrink-0" />
                  <span>Max marks: <strong className="text-[var(--text-primary)]">{a.max_marks}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <RiGroupLine className="text-brand-500 flex-shrink-0" />
                  <span><strong className="text-[var(--text-primary)]">{count}</strong> submission{count !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <RiTimeLine className="text-brand-500 flex-shrink-0" />
                  <span>Created: {format(new Date(a.created_at), 'dd MMM yyyy')}</span>
                </div>
              </div>

              {/* View submissions btn */}
              <button
                onClick={() => setSelected(a)}
                className="btn-primary text-sm flex items-center justify-center gap-2 py-2 mt-auto"
              >
                <RiEyeLine />
                View Submissions ({count})
              </button>
            </div>
          )
        })}
      </div>

      {/* Submissions modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Submissions — ${selected.title}` : ''}
        size="lg"
      >
        {selected && (
          <ViewSubmissions
            assignment={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </Modal>
    </>
  )
}
