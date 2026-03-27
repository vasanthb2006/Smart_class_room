import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import {
  RiBookOpenLine,
  RiMoonLine,
  RiSunLine,
  RiLogoutBoxLine,
  RiUserLine,
  RiMenuLine,
  RiCloseLine,
} from 'react-icons/ri'

export default function Navbar({ links = [] }) {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  const navigate = useNavigate()

  async function handleSignOut() {
    try {
      await signOut()
      toast.success('Signed out successfully')
      navigate('/login', { replace: true })
    } catch {
      toast.error('Failed to sign out')
    }
  }

  const isActive = (href) => location.pathname === href || location.pathname.startsWith(href + '/')

  return (
    <nav className="sticky top-0 z-50 bg-[var(--bg-card)] border-b border-[var(--border)] backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/25">
              <RiBookOpenLine className="text-white text-lg" />
            </div>
            <span className="font-display font-bold text-lg text-[var(--text-primary)]">
              Smart<span className="text-brand-600">Classroom</span>
            </span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display font-semibold transition-all duration-200 ${
                  isActive(link.href)
                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
                }`}
              >
                {link.icon && <link.icon className="text-base" />}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDark(!dark)}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-all duration-200"
              aria-label="Toggle dark mode"
            >
              {dark ? <RiSunLine className="text-lg" /> : <RiMoonLine className="text-lg" />}
            </button>

            {/* Profile chip */}
            {profile && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-primary)] rounded-xl border border-[var(--border)]">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="Profile"
                    className="w-6 h-6 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                    <RiUserLine className="text-brand-600 dark:text-brand-400 text-sm" />
                  </div>
                )}
                <div className="text-left">
                  <p className="text-xs font-display font-semibold text-[var(--text-primary)] leading-none">Hi {profile.name.split(' ')[0]}</p>
                  <p className="text-[10px] text-[var(--text-secondary)] leading-none mt-0.5 capitalize">{profile.role}</p>
                </div>
              </div>
            )}

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
              aria-label="Sign out"
            >
              <RiLogoutBoxLine className="text-lg" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] transition-all"
            >
              {mobileOpen ? <RiCloseLine className="text-lg" /> : <RiMenuLine className="text-lg" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[var(--border)] py-3 space-y-1 animate-fade-in">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-display font-semibold transition-all duration-200 ${
                  isActive(link.href)
                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                {link.icon && <link.icon className="text-base" />}
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
