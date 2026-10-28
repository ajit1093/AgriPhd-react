interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const sizeClasses = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-4' }

/** P1-UI-06 — Inline spinner. */
export function Spinner({ size = 'md', label = 'Loading…' }: SpinnerProps) {
  return (
    <span className="inline-flex items-center justify-center" role="status" aria-label={label}>
      <span className={`animate-spin rounded-full border-primary-600 border-t-transparent ${sizeClasses[size]}`} aria-hidden="true" />
    </span>
  )
}

/** Full-page loading overlay — used during initial auth/me check. */
export function LoadingOverlay({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm" role="status" aria-live="polite">
      <Spinner size="lg" label={label} />
      <p className="mt-4 text-sm text-neutral-500">{label}</p>
    </div>
  )
}
