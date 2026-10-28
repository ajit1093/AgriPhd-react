import { forwardRef, useId } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  /** Show required asterisk */
  required?: boolean
}

/**
 * P1-UI-02 / P6-THEME-03 — Modern Academic Input primitive.
 * Accessible: label + aria-describedby for error/hint.
 * WCAG 2.1 AA: error linked via aria-describedby, required marked visually and via aria-required.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, required, className = '', id: idProp, ...props }, ref) => {
    const generatedId = useId()
    const id = idProp ?? generatedId
    const errorId = `${id}-error`
    const hintId = `${id}-hint`
    const describedBy = [error ? errorId : '', hint ? hintId : ''].filter(Boolean).join(' ') || undefined

    return (
      <div className="w-full">
        <label htmlFor={id} className="block text-xs font-semibold text-neutral-800 mb-1">
          {label}
          {required && <span className="text-danger ml-0.5" aria-hidden="true">*</span>}
        </label>
        <input
          ref={ref}
          id={id}
          required={required}
          aria-required={required}
          aria-describedby={describedBy}
          aria-invalid={error ? 'true' : undefined}
          className={[
            'block w-full rounded-md border px-3 py-2 text-sm shadow-2xs transition-colors',
            'placeholder:text-neutral-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600',
            error
              ? 'border-danger bg-danger-light text-neutral-900 focus:ring-danger/20 focus:border-danger'
              : 'border-neutral-300 bg-white text-neutral-900',
            props.disabled ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' : '',
            className,
          ].join(' ')}
          {...props}
        />
        {hint && !error && (
          <p id={hintId} className="mt-1 text-xs text-neutral-500">{hint}</p>
        )}
        {error && (
          <p id={errorId} className="mt-1 text-xs font-medium text-danger" role="alert">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
