import { Modal } from './Modal'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  /** Use 'danger' variant for destructive actions */
  variant?: 'primary' | 'danger'
  loading?: boolean
}

/**
 * P1-UI-10 — ConfirmDialog.
 * "Are you sure?" pattern.
 * Used by: FinalCategoryID mismatch warning (P2-D-04), admission cancel (P2-H-14), etc.
 * Maps to legacy ConfirmBox.ascx / AjaxControlToolkit ConfirmButton pattern.
 */
export function ConfirmDialog({
  open, onClose, onConfirm, title = 'Confirm Action',
  message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'primary', loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm" closeOnBackdrop={!loading}>
      <p className="text-sm text-neutral-700 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
