export default function StatsCard({ icon: Icon, label, value, color = 'brand', trend }) {
  const colors = {
    brand: 'from-brand-500 to-brand-700 shadow-brand-500/25',
    emerald: 'from-emerald-500 to-emerald-700 shadow-emerald-500/25',
    amber: 'from-amber-500 to-amber-600 shadow-amber-500/25',
    rose: 'from-rose-500 to-rose-700 shadow-rose-500/25',
  }
  return (
    <div className="card p-5 flex items-center gap-4 card-hover">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors[color]} shadow-lg flex items-center justify-center flex-shrink-0`}>
        <Icon className="text-white text-xl" />
      </div>
      <div className="min-w-0">
        <p className="text-[var(--text-secondary)] text-sm font-body">{label}</p>
        <p className="font-display font-bold text-2xl text-[var(--text-primary)] leading-tight">{value}</p>
        {trend && <p className="text-xs text-emerald-500 font-semibold mt-0.5">{trend}</p>}
      </div>
    </div>
  )
}
