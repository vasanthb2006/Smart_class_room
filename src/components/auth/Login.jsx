import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import {
  RiBookOpenLine, RiMailLine, RiLockPasswordLine,
  RiEyeLine, RiEyeOffLine, RiArrowRightLine,
} from 'react-icons/ri'
import Spinner from '../common/Spinner'

export default function Login() {
  const { signIn, profile } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (profile) navigate(`/${profile.role}`, { replace: true })
  }, [profile, navigate])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Please fill in all fields')
    setLoading(true)
    try {
      await signIn(form)
      toast.success('Welcome back!')
    } catch (err) {
      const message = err?.message || err?.error || err?.details || 'Login failed. Check your email/password.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-20 left-20 w-64 h-64 bg-brand-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <RiBookOpenLine className="text-white text-xl" />
            </div>
            <span className="font-display font-bold text-xl text-white">SmartClassroom</span>
          </div>

          <div>
            <h1 className="font-display font-bold text-5xl text-white leading-tight mb-6">
              Learn.<br />Teach.<br />
              <span className="text-accent-400">Grow.</span>
            </h1>
            <p className="text-brand-200 font-body text-lg leading-relaxed max-w-sm">
              A modern classroom management platform connecting teachers and students seamlessly.
            </p>
            <div className="mt-10 flex gap-8">
              {[{ val: '100%', label: 'Online' }, { val: 'PDF', label: 'Submissions' }, { val: 'Auto', label: 'Grading' }].map((s) => (
                <div key={s.label}>
                  <p className="font-display font-bold text-3xl text-white">{s.val}</p>
                  <p className="text-brand-300 text-sm font-body">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-brand-300 text-sm font-body">© {new Date().getFullYear()} SmartClassroom.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-slide-up">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center">
              <RiBookOpenLine className="text-white text-lg" />
            </div>
            <span className="font-display font-bold text-lg">SmartClassroom</span>
          </div>

          <h2 className="font-display font-bold text-3xl text-[var(--text-primary)] mb-2">Welcome back</h2>
          <p className="text-[var(--text-secondary)] font-body mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-lg" />
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="input pl-10" autoComplete="email" />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <RiLockPasswordLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-lg" />
                <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="••••••••" className="input pl-10 pr-10" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <Spinner size="sm" /> : <><span>Sign in</span><RiArrowRightLine /></>}
            </button>
          </form>

          <div className="mt-6 p-4 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-100 dark:border-brand-800">
            <p className="text-xs font-display font-semibold text-brand-600 dark:text-brand-400 mb-2">🎓 Demo Credentials</p>
            <p className="text-xs font-mono text-[var(--text-secondary)]">
              Teacher: teacher@demo.com / demo1234<br />Student: student@demo.com / demo1234
            </p>
          </div>

          <p className="mt-6 text-center font-body text-sm text-[var(--text-secondary)]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
