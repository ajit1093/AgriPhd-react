import { forwardRef, useId } from 'react'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: SelectOption[]
  error?: string
  placeholder?: string
  required?: boolean
}

/**
 * P1-UI-03 / P6-THEME-03 — Modern Academic Select primitive.
 * Driven by { value, label }[] array.
 * Accessible: same pattern as Input (label + aria-describedby).
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, placeholder, required, className = '', id: idProp, ...props }, ref) => {
    const generatedId = useId()
    const id = idProp ?? generatedId
    const errorId = `${id}-error`

    return (
      <div className="w-full">
        <label htmlFor={id} className="block text-xs font-semibold text-neutral-800 mb-1">
          {label}
          {required && <span className="text-danger ml-0.5" aria-hidden="true">*</span>}
        </label>
        <select
          ref={ref}
          id={id}
          required={required}
          aria-required={required}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? 'true' : undefined}
          className={[
            'block w-full rounded-md border px-3 py-2 text-sm shadow-2xs transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600',
            error
              ? 'border-danger bg-danger-light focus:ring-danger/20 focus:border-danger'
              : 'border-neutral-300 bg-white',
            props.disabled ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' : 'text-neutral-900',
            className,
          ].join(' ')}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={errorId} className="mt-1 text-xs font-medium text-danger" role="alert">{error}</p>
        )}
      </div>
    )
  }
)
Select.displayName = 'Select'
