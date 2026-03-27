export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)]">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 rounded-full border-4 border-brand-100 dark:border-brand-900/30" />
        {/* Spinning arc */}
        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-brand-600 animate-spin" />
      </div>
      <p className="mt-5 font-display font-semibold text-[var(--text-secondary)] text-sm tracking-wide">
        Loading Smart Classroom…
      </p>
    </div>
  )
}
