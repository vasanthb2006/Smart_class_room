import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import {
  RiBookOpenLine, RiMailLine, RiLockPasswordLine,
  RiUserLine, RiEyeLine, RiEyeOffLine, RiArrowRightLine,
  RiTeamLine, RiUserStarLine,
} from 'react-icons/ri'
import Spinner from '../common/Spinner'

export default function Signup() {
  const { signUp, profile } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (profile) navigate(`/${profile.role}`, { replace: true })
  }, [profile, navigate])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.role)
      return toast.error('Please fill in all fields')
    if (form.password.length < 6)
      return toast.error('Password must be at least 6 characters')
    if (form.password !== form.confirmPassword)
      return toast.error('Passwords do not match')

    setLoading(true)
    try {
      await signUp({ email: form.email, password: form.password, name: form.name, role: form.role })
      toast.success('Account created! Please check your email to confirm.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    { value: 'teacher', label: 'Teacher', desc: 'Create & manage assignments', icon: RiUserStarLine },
    { value: 'student', label: 'Student', desc: 'Submit & track assignments', icon: RiTeamLine },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6">
      <div className="w-full max-w-lg animate-slide-up">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
            <RiBookOpenLine className="text-white text-xl" />
          </div>
          <span className="font-display font-bold text-xl text-[var(--text-primary)]">
            Smart<span className="text-brand-600">Classroom</span>
          </span>
        </div>

        <div className="card p-8">
          <h2 className="font-display font-bold text-2xl text-[var(--text-primary)] mb-1">Create account</h2>
          <p className="text-[var(--text-secondary)] font-body text-sm mb-6">Join SmartClassroom today</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div>
              <label className="label">I am a…</label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`flex flex-col items-start gap-1 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      form.role === r.value
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-[var(--border)] hover:border-brand-300'
                    }`}
                  >
                    <r.icon className={`text-xl ${form.role === r.value ? 'text-brand-600' : 'text-[var(--text-secondary)]'}`} />
                    <span className={`font-display font-semibold text-sm ${form.role === r.value ? 'text-brand-600' : 'text-[var(--text-primary)]'}`}>{r.label}</span>
                    <span className="text-xs text-[var(--text-secondary)] font-body">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="label">Full name</label>
              <div className="relative">
                <RiUserLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-lg" />
                <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="John Doe" className="input pl-10" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-lg" />
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="input pl-10" autoComplete="email" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <RiLockPasswordLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-lg" />
                <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Min. 6 characters" className="input pl-10 pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">Confirm password</label>
              <div className="relative">
                <RiLockPasswordLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-lg" />
                <input name="confirmPassword" type={showPass ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" className="input pl-10" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 !mt-6">
              {loading ? <Spinner size="sm" /> : <><span>Create account</span><RiArrowRightLine /></>}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center font-body text-sm text-[var(--text-secondary)]">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
