export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-center mb-4">
        <Icon className="text-2xl text-[var(--text-secondary)]" />
      </div>
      <h3 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-2">{title}</h3>
      {description && <p className="text-[var(--text-secondary)] text-sm max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
