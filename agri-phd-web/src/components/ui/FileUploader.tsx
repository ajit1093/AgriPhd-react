import { useId, useRef, useState } from 'react'

interface FileUploaderProps {
  label: string
  accept?: string          // e.g. '.jpg,.jpeg,.png,.pdf'
  maxSizeKb?: number       // max file size in KB
  value?: File | null
  previewUrl?: string      // existing blob URL (from DB) to show before first upload
  onChange: (file: File | null) => void
  error?: string
  required?: boolean
  disabled?: boolean
}

/**
 * P1-UI-08 — FileUploader.
 * - Shows image preview for image/* types, filename for PDF/others.
 * - Client-side size + type validation.
 * - Accessible: labelled input, error linked via aria-describedby.
 * - Maps to legacy ASP.NET FileUpload control + Azure Blob upload pattern.
 */
export function FileUploader({
  label, accept, maxSizeKb, value, previewUrl, onChange, error, required = false, disabled = false,
}: FileUploaderProps) {
  const id = useId()
  const errorId = `${id}-error`
  const inputRef = useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  const displayError = error ?? localError ?? undefined

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setLocalError(null)

    if (file) {
      // Size validation
      if (maxSizeKb && file.size > maxSizeKb * 1024) {
        setLocalError(`File size must not exceed ${maxSizeKb} KB. Selected: ${Math.round(file.size / 1024)} KB.`)
        onChange(null)
        e.target.value = ''
        return
      }
      // Type validation
      if (accept) {
        const allowedExt = accept.split(',').map(s => s.trim().toLowerCase())
        const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`
        if (!allowedExt.includes(fileExt)) {
          setLocalError(`Invalid file type. Allowed: ${accept}`)
          onChange(null)
          e.target.value = ''
          return
        }
      }
    }
    onChange(file)
  }

  const isImage = value ? value.type.startsWith('image/') : previewUrl ? /\.(jpg|jpeg|png|gif|webp)$/i.test(previewUrl) : false
  const objectUrl = value ? URL.createObjectURL(value) : null
  const displayUrl = objectUrl ?? previewUrl

  return (
    <div className="w-full">
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="text-danger ml-0.5" aria-hidden="true"> *</span>}
      </label>

      {/* Preview area */}
      {displayUrl && (
        <div className="mb-2">
          {isImage ? (
            <img
              src={displayUrl}
              alt={`Preview of ${label}`}
              className="h-24 w-24 rounded-lg object-cover border border-neutral-200"
            />
          ) : (
            <div className="flex items-center gap-2 text-sm text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2">
              <span aria-hidden="true">📄</span>
              <span className="truncate max-w-xs">{value?.name ?? 'Existing file'}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-white hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary-600"
          aria-describedby={displayError ? errorId : undefined}
        >
          {displayUrl ? 'Change File' : 'Choose File'}
        </button>
        {value && (
          <span className="text-sm text-neutral-600 truncate max-w-xs">{value.name}</span>
        )}
        {!value && !displayUrl && (
          <span className="text-sm text-neutral-400">No file chosen</span>
        )}
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        aria-required={required}
        aria-describedby={displayError ? errorId : undefined}
        aria-invalid={displayError ? 'true' : undefined}
        className="sr-only"
        aria-label={label}
      />

      {maxSizeKb && (
        <p className="mt-1 text-xs text-neutral-400">Max size: {maxSizeKb} KB · Allowed: {accept ?? 'any'}</p>
      )}
      {displayError && (
        <p id={errorId} className="field-error" role="alert">{displayError}</p>
      )}
    </div>
  )
}
