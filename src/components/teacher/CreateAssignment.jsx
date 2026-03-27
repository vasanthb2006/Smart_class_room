import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { RiAddLine, RiCalendarLine, RiFileTextLine, RiAwardLine, RiAttachment2 } from 'react-icons/ri'
import Spinner from '../common/Spinner'

export default function CreateAssignment({ onCreated }) {
  const { profile } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    due_date: '',
    max_marks: 100,
  })
  const [file, setFile] = useState(null)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const handleFile = (e) => {
    const selected = e.target.files[0]
    if (selected && selected.type === 'application/pdf') {
      setFile(selected)
    } else {
      toast.error('Only PDF files are allowed')
      e.target.value = null
    }
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.title || !form.due_date) {
      toast.error('Title and due date are required')
      return
    }
    setLoading(true)
    try {
      let file_url = null
      let file_name = null

      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${profile.id}/${Math.random()}.${fileExt}`
        const { data, error: uploadError } = await supabase.storage
          .from('assignments')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('assignments')
          .getPublicUrl(fileName)

        file_url = publicUrl
        file_name = file.name
      }

      const { error } = await supabase.from('assignments').insert({
        title: form.title.trim(),
        description: form.description.trim(),
        due_date: new Date(form.due_date).toISOString(),
        max_marks: Number(form.max_marks),
        created_by: profile.id,
        file_url,
        file_name,
      })
      if (error) throw error

      toast.success('Assignment created!')
      setForm({ title: '', description: '', due_date: '', max_marks: 100 })
      setFile(null)
      setOpen(false)
      onCreated?.()
    } catch (err) {
      toast.error(err.message || 'Failed to create assignment')
    } finally {
      setLoading(false)
    }
  }

  // Minimum date = now (local datetime-local format)
  const minDate = new Date(Date.now() + 60 * 1000)
    .toISOString()
    .slice(0, 16)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn-primary flex items-center gap-2"
      >
        <RiAddLine className="text-lg" />
        New Assignment
      </button>
    )
  }

  return (
    <div className="card p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">
            Create Assignment
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Fill in the details below
          </p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="btn-secondary text-sm"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={submit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="label">
            <span className="flex items-center gap-1.5">
              <RiFileTextLine /> Assignment Title *
            </span>
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handle}
            placeholder="e.g. Data Structures Assignment 1"
            className="input"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="label">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handle}
            rows={4}
            placeholder="Describe the assignment requirements, objectives, and any important notes…"
            className="input resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Due Date */}
          <div>
            <label className="label">
              <span className="flex items-center gap-1.5">
                <RiCalendarLine /> Due Date & Time *
              </span>
            </label>
            <input
              name="due_date"
              type="datetime-local"
              value={form.due_date}
              onChange={handle}
              min={minDate}
              className="input"
              required
            />
          </div>

          {/* Max Marks */}
          <div>
            <label className="label">
              <span className="flex items-center gap-1.5">
                <RiAwardLine /> Max Marks *
              </span>
            </label>
            <input
              name="max_marks"
              type="number"
              value={form.max_marks}
              onChange={handle}
              min={1}
              max={1000}
              className="input"
              required
            />
          </div>
        </div>

        {/* Question File (PDF) */}
        <div>
          <label className="label">
            <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
              <RiAttachment2 /> Attachment (PDF Only)
            </span>
          </label>
          <div className="mt-1 flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--bg-secondary)] hover:border-indigo-400 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFile}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
              <RiAttachment2 className="text-xl" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {file ? file.name : 'Click to upload question PDF'}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">Max size 5MB • PDF files only</p>
            </div>
          </div>
        </div>

        {/* Late deduction info */}
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <p className="text-xs font-display font-semibold text-amber-700 dark:text-amber-400 mb-1">
            ⏰ Late Submission Policy
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-500">
            Automatic deductions: 10% per day late, capped at 50%. Applied when grading.
          </p>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? <Spinner size="sm" /> : <RiAddLine />}
            Create Assignment
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="btn-secondary"
          >
            Discard
          </button>
        </div>
      </form>
    </div>
  )
}
