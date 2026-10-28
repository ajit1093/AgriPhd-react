import { forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  /** Render as full-width block */
  block?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:   'bg-academic-navy text-white hover:bg-academic-navyLight shadow-xs focus-visible:outline-academic-accent disabled:bg-neutral-300 disabled:text-neutral-500',
  secondary: 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 shadow-xs focus-visible:outline-neutral-400 disabled:bg-neutral-100 disabled:text-neutral-400',
  success:   'bg-agriculture text-white hover:bg-agriculture-800 shadow-xs focus-visible:outline-agriculture disabled:bg-green-300',
  danger:    'bg-danger text-white hover:bg-danger-dark shadow-xs focus-visible:outline-danger disabled:bg-red-300',
  ghost:     'bg-transparent text-neutral-700 hover:bg-neutral-100 focus-visible:outline-neutral-400 disabled:text-neutral-400',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-md font-medium',
  md: 'px-4 py-2 text-sm rounded-md font-medium',
  lg: 'px-5 py-2.5 text-base rounded-md font-semibold',
}

/**
 * P1-UI-01 / P6-THEME-04 — Modern Academic Button primitive.
 * Variants: primary (Academic Navy) | secondary (Bordered Slate) | success (Agriculture Emerald) | danger | ghost.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, block = false, className = '', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          'inline-flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer',
          'focus-visible:outline-2 focus-visible:outline-offset-2',
          'disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          block ? 'w-full' : '',
          className,
        ].join(' ')}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
