import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { calculateLatePenalty } from '../../utils/lateSubmission'
import { format, isPast } from 'date-fns'
import {
  RiUpload2Line,
  RiFilePdfLine,
  RiAlertLine,
  RiCheckLine,
  RiCloseLine,
} from 'react-icons/ri'
import Spinner from '../common/Spinner'

export default function UploadSubmission({ assignment, existingSubmission, onSubmitted }) {
  const { profile } = useAuth()
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const dueDate = new Date(assignment.due_date)
  const isLate = isPast(dueDate)
  const allowLateSubmission = assignment.allow_late_submission ?? true
  const penalty = calculateLatePenalty(
    assignment.due_date,
    new Date().toISOString(),
    assignment.max_marks
  )
  const isSubmitDisabledBecauseLate = isLate && !allowLateSubmission

  function handleFileChange(e) {
    const f = e.target.files?.[0]
    validateAndSetFile(f)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    validateAndSetFile(f)
  }

  function validateAndSetFile(f) {
    if (!f) return
    if (f.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10 MB')
      return
    }
    setFile(f)
  }

  async function submit() {
    if (!file) { toast.error('Please select a PDF file'); return }
    if (isSubmitDisabledBecauseLate) {
      toast.error('Late submissions are not allowed for this assignment')
      return
    }
    setUploading(true)
    try {
      const filePath = `${profile.id}/${assignment.id}/${Date.now()}_${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('submissions')
        .upload(filePath, file, { upsert: true, contentType: 'application/pdf' })

      if (uploadError) throw uploadError

      const now = new Date().toISOString()
      const pen = calculateLatePenalty(assignment.due_date, now, assignment.max_marks)

      const submissionData = {
        assignment_id: assignment.id,
        student_id: profile.id,
        file_url: filePath,
        file_name: file.name,
        submitted_at: now,
        is_late: pen.isLate,
        late_days: pen.lateDays,
        deduction_pct: pen.deductionPct,
        marks_awarded: null,
      }

      const { error: dbError } = existingSubmission
        ? await supabase.from('submissions').update(submissionData).eq('id', existingSubmission.id)
        : await supabase.from('submissions').insert(submissionData)

      if (dbError) throw dbError

      toast.success(
        pen.isLate
          ? `Submitted (late — ${pen.deductionPoints} points, ${(pen.deductionPct / 100).toFixed(2)}% off)`
          : 'Submitted successfully! ✅'
      )
      setFile(null)
      onSubmitted?.()
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Late warning banner */}
      {isLate && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 flex items-start gap-3">
          <RiAlertLine className="text-amber-500 text-lg flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-display font-semibold text-amber-700 dark:text-amber-400">
              Late Submission
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
              Due date was {format(dueDate, 'dd MMM yyyy, HH:mm')}.
              {penalty.isLate && ` A ${penalty.deductionPoints} points (${(penalty.deductionPct / 100).toFixed(2)}%) deduction will be applied (${penalty.lateDays} day${penalty.lateDays !== 1 ? 's' : ''} late).`}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
              Late penalty is 0.5 point per late day. Effective max score now is {penalty.effectiveMaxMarks} / {assignment.max_marks}.
            </p>
            {!allowLateSubmission && (
              <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-1">
                This assignment does not accept late submissions, so upload is disabled.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Existing submission status */}
      {existingSubmission && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
          <RiCheckLine className="text-emerald-500 text-lg" />
          <div className="text-sm">
            <p className="font-semibold text-emerald-700 dark:text-emerald-400">
              Previously submitted: <span className="font-mono">{existingSubmission.file_name || 'file.pdf'}</span>
            </p>
            <p className="text-emerald-600 dark:text-emerald-500 text-xs">
              Uploading a new file will replace your previous submission.
            </p>
          </div>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
          dragOver
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
            : file
            ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10'
            : 'border-[var(--border)] hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-900/10'
        }`}
      >
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center gap-3">
          {file ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <RiFilePdfLine className="text-emerald-600 dark:text-emerald-400 text-3xl" />
              </div>
              <div>
                <p className="font-display font-semibold text-[var(--text-primary)]">{file.name}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null) }}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <RiCloseLine /> Remove
              </button>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
                <RiUpload2Line className="text-brand-500 text-3xl" />
              </div>
              <div>
                <p className="font-display font-semibold text-[var(--text-primary)]">
                  Drop your PDF here
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  or click to browse · PDF only · Max 10 MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Submit button */}
      <button
        onClick={submit}
        disabled={!file || uploading || isSubmitDisabledBecauseLate}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3"
      >
        {uploading ? (
          <><Spinner size="sm" /> Uploading…</>
        ) : (
          <><RiUpload2Line /> {existingSubmission ? 'Resubmit' : 'Submit'} Assignment</>
        )}
      </button>
    </div>
  )
}
