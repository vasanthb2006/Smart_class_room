import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { format, formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import {
  RiFilePdfLine,
  RiCheckLine,
  RiTimeLine,
  RiExternalLinkLine,
  RiAwardLine,
  RiAlertLine,
} from 'react-icons/ri'
import {
  calculateLatePenalty,
  applyPenaltyToMarks,
} from '../../utils/lateSubmission'
import Spinner from '../common/Spinner'
import EmptyState from '../common/EmptyState'

export default function ViewSubmissions({ assignment, onClose }) {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [grading, setGrading] = useState({}) // submissionId -> marks string
  const [savingId, setSavingId] = useState(null)

  const fetchSubmissions = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('submissions')
      .select('*, student:users(name, email)')
      .eq('assignment_id', assignment.id)
      .order('submitted_at', { ascending: false })

    if (!error) {
      setSubmissions(data || [])
      const init = {}
      data?.forEach((s) => {
        init[s.id] = s.marks_awarded != null ? String(s.marks_awarded) : ''
      })
      setGrading(init)
    }
    setLoading(false)
  }, [assignment.id])

  useEffect(() => { fetchSubmissions() }, [fetchSubmissions])

  async function getFileUrl(fileUrl) {
    // If it's already a full URL (public bucket), open directly
    if (fileUrl.startsWith('http')) {
      window.open(fileUrl, '_blank')
      return
    }
    const { data } = await supabase.storage
      .from('submissions')
      .createSignedUrl(fileUrl, 60 * 60) // 1 hour
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
    else toast.error('Could not generate file link')
  }

  async function saveMarks(submission) {
    const raw = Number(grading[submission.id])
    if (isNaN(raw) || raw < 0) {
      toast.error('Enter a valid marks value')
      return
    }

    const penalty = calculateLatePenalty(
      assignment.due_date,
      submission.submitted_at,
      assignment.max_marks
    )
    const rawCapped = Math.min(raw, assignment.max_marks)
    const final = applyPenaltyToMarks(rawCapped, penalty.deductionPoints)

    setSavingId(submission.id)
    const { error } = await supabase
      .from('submissions')
      .update({
        marks_awarded: final,
        is_late: penalty.isLate,
        late_days: penalty.lateDays,
        deduction_pct: penalty.deductionPct,
      })
      .eq('id', submission.id)

    setSavingId(null)
    if (error) {
      toast.error('Failed to save marks')
    } else {
      toast.success(`Marks saved: ${final} / ${assignment.max_marks}`)
      fetchSubmissions()
    }
  }

  const isDue = new Date() > new Date(assignment.due_date)

  return (
    <div className="space-y-4">
      {/* Assignment summary */}
      <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 flex flex-wrap gap-4 text-sm">
        <div>
          <span className="text-[var(--text-secondary)]">Due: </span>
          <span className="font-semibold text-[var(--text-primary)]">
            {format(new Date(assignment.due_date), 'dd MMM yyyy, HH:mm')}
          </span>
        </div>
        <div>
          <span className="text-[var(--text-secondary)]">Max marks: </span>
          <span className="font-semibold text-[var(--text-primary)]">{assignment.max_marks}</span>
        </div>
        <div>
          <span className="text-[var(--text-secondary)]">Submissions: </span>
          <span className="font-semibold text-[var(--text-primary)]">{submissions.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : submissions.length === 0 ? (
        <EmptyState
          icon={RiFilePdfLine}
          title="No submissions yet"
          description="Students haven't submitted anything for this assignment."
        />
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => {
            const penalty = calculateLatePenalty(
              assignment.due_date,
              sub.submitted_at,
              assignment.max_marks
            )
            const marksVal = grading[sub.id] ?? ''

            return (
              <div key={sub.id} className="card p-4 space-y-3">
                {/* Student info + badges */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-display font-semibold text-[var(--text-primary)]">
                      {sub.student?.name || 'Unknown Student'}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {sub.student?.email}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 flex items-center gap-1">
                      <RiTimeLine />
                      Submitted {format(new Date(sub.submitted_at), 'dd MMM yyyy, HH:mm')} ({formatDistanceToNow(new Date(sub.submitted_at), { addSuffix: true })})
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="badge-success flex items-center gap-1">
                      <RiCheckLine /> Submitted
                    </span>
                    {penalty.isLate && (
                      <span className="badge-danger flex items-center gap-1">
                        <RiAlertLine /> Late — {penalty.deductionPoints} pts ({(penalty.deductionPct / 100).toFixed(2)}%) off
                      </span>
                    )}
                    {sub.marks_awarded != null && (
                      <span className="badge-info">
                        {sub.marks_awarded} / {assignment.max_marks} pts
                      </span>
                    )}
                  </div>
                </div>

                {/* Late penalty details */}
                {penalty.isLate && (
                  <div className="text-xs p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <RiAlertLine />
                    {penalty.lateDays} day{penalty.lateDays !== 1 ? 's' : ''} late — {penalty.deductionPoints} pts ({(penalty.deductionPct / 100).toFixed(2)}%) deducted →
                    Effective max: <strong>{penalty.effectiveMaxMarks}</strong>
                  </div>
                )}

                {/* Current marks display */}
                {sub.marks_awarded != null && (
                  <div className="text-xs p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                    ✓ Currently awarded: <strong>{sub.marks_awarded} / {assignment.max_marks}</strong>
                  </div>
                )}

                {/* Actions row */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* View PDF */}
                  <button
                    onClick={() => getFileUrl(sub.file_url)}
                    className="btn-secondary text-sm flex items-center gap-2 py-2"
                  >
                    <RiExternalLinkLine /> View PDF
                  </button>

                  {/* Grade input */}
                  <div className="flex items-center gap-2 flex-1 min-w-[280px]">
                    <div className="relative flex-1">
                      <RiAwardLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                      <input
                        type="number"
                        min={0}
                        max={assignment.max_marks}
                        step={0.5}
                        value={marksVal}
                        onChange={(e) =>
                          setGrading({ ...grading, [sub.id]: e.target.value })
                        }
                        placeholder={`0–${assignment.max_marks}`}
                        className="input pl-9 py-2 text-sm"
                      />
                    </div>
                    <button
                      onClick={() =>
                        setGrading({ ...grading, [sub.id]: String(penalty.effectiveMaxMarks) })
                      }
                      className="btn-secondary text-sm py-2 px-3"
                      title="Fill with effective max marks"
                    >
                      Suggest
                    </button>
                    <button
                      onClick={() => saveMarks(sub)}
                      disabled={savingId === sub.id}
                      className="btn-primary text-sm flex items-center gap-1.5 py-2"
                    >
                      {savingId === sub.id ? <Spinner size="sm" /> : <RiCheckLine />}
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
