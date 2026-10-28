import { useEffect, useRef, useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'

const OTP_LENGTH = 4
const RESEND_COOLDOWN_SEC = 60

interface OTPModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (otp: string) => Promise<void>
  onResend: () => Promise<void>
  /** Context shown to the user, e.g. "Enter the OTP sent to +91 98765XXXXX" */
  description: string
  loading?: boolean
  error?: string
}

/**
 * P1-UI-09 / P6-THEME-06 — Modern Academic OTP Modal.
 * 4-digit OTP entry with clean digit boxes, auto-advance, and resend cooldown.
 */
export function OTPModal({ open, onClose, onSubmit, onResend, description, loading = false, error }: OTPModalProps) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [cooldown, setCooldown] = useState(0)
  const [resendLoading, setResendLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (open) {
      setDigits(Array(OTP_LENGTH).fill(''))
      setCooldown(RESEND_COOLDOWN_SEC)
    }
  }, [open])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (paste.length === OTP_LENGTH) {
      setDigits(paste.split(''))
      inputRefs.current[OTP_LENGTH - 1]?.focus()
      e.preventDefault()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otp = digits.join('')
    if (otp.length !== OTP_LENGTH) return
    await onSubmit(otp)
  }

  const handleResend = async () => {
    setResendLoading(true)
    try {
      await onResend()
      setCooldown(RESEND_COOLDOWN_SEC)
      setDigits(Array(OTP_LENGTH).fill(''))
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Security Verification — Enter OTP" closeOnBackdrop={false} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} noValidate>
        <p className="text-xs text-neutral-600 mb-4 text-center leading-relaxed">{description}</p>

        {/* Digit inputs */}
        <div className="flex gap-2.5 justify-center mb-4" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleDigitChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className="h-12 w-12 text-center text-xl font-bold font-mono border-2 border-neutral-300 rounded-md focus:outline-none focus:border-academic-accent focus:ring-2 focus:ring-primary-600/20 transition-all bg-white text-neutral-900 shadow-2xs"
              aria-label={`OTP digit ${i + 1}`}
              autoComplete="one-time-code"
            />
          ))}
        </div>

        {error && <p className="text-xs text-danger font-medium text-center mb-3" role="alert">{error}</p>}

        <Button type="submit" block loading={loading} disabled={digits.join('').length !== OTP_LENGTH}>
          Verify &amp; Continue
        </Button>

        <div className="mt-3 text-center text-xs text-neutral-500">
          {cooldown > 0 ? (
            <span>Resend OTP available in <strong className="text-neutral-700">{cooldown}s</strong></span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="text-primary-800 font-semibold hover:underline cursor-pointer disabled:opacity-50"
            >
              {resendLoading ? 'Sending…' : 'Resend One Time Password'}
            </button>
          )}
        </div>
      </form>
    </Modal>
  )
}
