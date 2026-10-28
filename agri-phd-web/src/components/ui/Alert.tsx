import { useState } from 'react'

type AlertVariant = 'success' | 'danger' | 'warning' | 'info'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: React.ReactNode
  dismissible?: boolean
  className?: string
}

const variantStyles: Record<AlertVariant, { wrapper: string; icon: string }> = {
  success: {
    wrapper: 'bg-success-light border-success text-success-dark',
    icon: '✓',
  },
  danger: {
    wrapper: 'bg-danger-light border-danger text-danger-dark',
    icon: '✕',
  },
  warning: {
    wrapper: 'bg-warning-light border-warning text-warning-dark',
    icon: '⚠',
  },
  info: {
    wrapper: 'bg-info-light border-info text-info-dark',
    icon: 'ℹ',
  },
}

/**
 * P1-UI-05 — Alert / notification banner.
 * Maps to legacy Helper.ShowMessage() Bootstrap alert injected by master page.
 * role="alert" ensures screen readers announce it immediately.
 */
export function Alert({ variant = 'info', title, children, dismissible = false, className = '' }: AlertProps) {
  const [dismissed, setDismissed] = useState(false)
  const styles = variantStyles[variant]

  if (dismissed) return null

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${styles.wrapper} ${className}`}
    >
      <span className="shrink-0 font-bold mt-0.5" aria-hidden="true">{styles.icon}</span>
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div>{children}</div>
      </div>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-0.5 rounded opacity-60 hover:opacity-100 focus-visible:outline-2"
          aria-label="Dismiss alert"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
