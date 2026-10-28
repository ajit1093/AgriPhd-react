import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { apiClient } from '@/api/client'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

export default function ResetCachePage() {
  const [confirm, setConfirm] = useState(false)
  const mutation = useMutation({
    mutationFn: () => apiClient.post<{ success: boolean; message: string }>('/admin/reset-cache').then(r => r.data),
    onSuccess: r => { if (r.success) toast.success(r.message); else toast.error('Reset failed.') },
  })
  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card" style={{ maxWidth: '500px' }}>
        <div className="l-card-header">Reset Application Variables</div>
        <div className="l-card-body">
          <p style={{ marginBottom: '16px' }}>Clears all cached master data and reloads from database. Equivalent to legacy ResetApplicationVariables.aspx.</p>
          <button type="button" className="btn-special" onClick={() => setConfirm(true)}>Reset Cache</button>
        </div>
      </div>
      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)}
        onConfirm={() => { setConfirm(false); mutation.mutate() }}
        title="Reset Application Cache"
        message="This will clear all cached master data. All users will experience a brief slowdown on next request. Continue?"
        confirmLabel="Yes, Reset" variant="danger" loading={mutation.isPending} />
    </div>
  )
}
