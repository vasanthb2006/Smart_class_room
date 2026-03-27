import { useState } from 'react'
import { format, isPast, formatDistanceToNow } from 'date-fns'
import {
  RiCalendarLine,
  RiAwardLine,
  RiTimeLine,
  RiCheckLine,
  RiUpload2Line,
  RiAlertLine,
  RiFilePdfLine,
  RiExternalLinkLine,
} from 'react-icons/ri'
import { supabase } from '../../lib/supabase'
import Modal from '../common/Modal'
import UploadSubmission from './UploadSubmission'
import toast from 'react-hot-toast'

export default function AssignmentCard({ assignment, submission, onRefresh }) {
  const [modalOpen, setModalOpen] = useState(false)

  const overdue = isPast(new Date(assignment.due_date))
  const submitted = !!submission
  const graded = submission?.marks_awarded != null

  async function viewFile() {
    if (!submission?.file_url) return
    if (submission.file_url.startsWith('http')) {
      window.open(submission.file_url, '_blank')
      return
    }
    const { data } = await supabase.storage
      .from('submissions')
      .createSignedUrl(submission.file_url, 3600)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
    else toast.error('Could not load file')
  }

  async function viewQuestion() {
    if (!assignment?.file_url) return
    window.open(assignment.file_url, '_blank')
  }

  function handleSubmitted() {
    setModalOpen(false)
    onRefresh?.()
  }

  // Status badge
  let statusBadge
  if (graded) {
    statusBadge = (
      <span className="badge-info flex items-center gap-1 text-xs">
        <RiAwardLine />
        {submission.marks_awarded} / {assignment.max_marks} pts
      </span>
    )
  } else if (submitted) {
    statusBadge = (
      <span className="badge-success flex items-center gap-1 text-xs">
        <RiCheckLine /> Submitted
      </span>
    )
  } else if (overdue) {
    statusBadge = (
      <span className="badge-danger flex items-center gap-1 text-xs">
        <RiAlertLine /> Overdue
      </span>
    )
  } else {
    statusBadge = (
      <span className="badge-warning flex items-center gap-1 text-xs">
        <RiTimeLine /> Pending
      </span>
    )
  }

  return (
    <>
      <div className="card card-hover p-5 flex flex-col gap-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2 flex-wrap min-h-[1.5rem]">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {statusBadge}
              {submission?.is_late && (
                <span className="badge-danger flex items-center gap-1 text-xs">
                  <RiAlertLine /> Late -{submission.deduction_pct}%
                </span>
              )}
            </div>
            <h3 className="font-display font-bold text-[var(--text-primary)] text-base leading-snug line-clamp-2">
              {assignment.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        {assignment.description && (
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
            {assignment.description}
          </p>
        )}

        {/* Meta info */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <RiCalendarLine className="text-brand-500" />
            <span>
              Due:{' '}
              <strong className={overdue ? 'text-red-500' : 'text-[var(--text-primary)]'}>
                {format(new Date(assignment.due_date), 'dd MMM yyyy, HH:mm')}
              </strong>
              {!overdue && (
                <span className="ml-1 text-emerald-600">
                  ({formatDistanceToNow(new Date(assignment.due_date), { addSuffix: true })})
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <RiAwardLine className="text-brand-500" />
            <span>
              Max marks: <strong className="text-[var(--text-primary)]">{assignment.max_marks}</strong>
            </span>
          </div>
          {submitted && (
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <RiTimeLine className="text-brand-500" />
              <span>
                Submitted:{' '}
                <strong className="text-[var(--text-primary)]">
                  {format(new Date(submission.submitted_at), 'dd MMM yyyy, HH:mm')}
                </strong>
              </span>
            </div>
          )}
          {graded && submission.deduction_pct > 0 && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <RiAlertLine />
              <span>{(submission.deduction_pct / 100 * assignment.max_marks).toFixed(1)} pts ({submission.deduction_pct}% ) deducted for late submission</span>
            </div>
          )}
        </div>

        {/* Question Attachment */}
        {assignment.file_url && (
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <RiFilePdfLine className="text-indigo-600 dark:text-indigo-400 text-lg flex-shrink-0" />
              <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                {assignment.file_name || 'Question.pdf'}
              </p>
            </div>
            <button
              onClick={viewQuestion}
              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-all flex-shrink-0"
            >
              View Question
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto flex-wrap">
          {submitted && (
            <button
              onClick={viewFile}
              className="btn-secondary text-sm flex items-center gap-1.5 py-2 flex-1 justify-center"
            >
              <RiExternalLinkLine /> My Answer
            </button>
          )}
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary text-sm flex items-center gap-1.5 py-2 flex-1 justify-center"
          >
            {submitted ? (
              <><RiUpload2Line /> Resubmit</>
            ) : (
              <><RiUpload2Line /> Submit Answer</>
            )}
          </button>
        </div>
      </div>

      {/* Upload modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Submit: ${assignment.title}`}
        size="md"
      >
        <UploadSubmission
          assignment={assignment}
          existingSubmission={submission}
          onSubmitted={handleSubmitted}
        />
      </Modal>
    </>
  )
}
