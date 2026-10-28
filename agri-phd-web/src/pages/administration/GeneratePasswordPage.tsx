import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { apiClient } from '@/api/client'
import { useMasterData } from '@/hooks/useMasterData'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

/**
 * Administration/GeneratePassword.aspx — exact parity
 * Select User Type (only shows college/non-candidate types) → Generate Password button
 * Generates password for ALL users of that type (no per-row selection).
 * Legacy: only shows UserTypeID=61 (College) in dropdown.
 */

export default function GeneratePasswordPage() {
  const [userTypeId, setUserTypeId] = useState(-1)
  const [confirm, setConfirm] = useState(false)

  const { data: userTypes = [] } = useMasterData('user-type')

  // Legacy only shows select + UserTypeID=61 (College) — filter to only show non-candidate, non-super-admin types
  const filteredTypes = userTypes.filter(t =>
    !['0', '91', '11'].includes(String(t.value))
  )

  const genMutation = useMutation({
    mutationFn: () => {
      // Legacy generates for ALL users of the selected type (no individual selection)
      // Pass empty userIds — server generates for all users of the type
      return apiClient.post('/admin/generate-passwords', {
        userIds: [],     // empty = generate for all of userTypeId
        userTypeId,      // server uses this to fetch users via Account_GetUserListForPasswordGeneration
      }).then(r => r.data)
    },
    onSuccess: (d) => {
      toast.success(d.message ?? 'Passwords Updated Successfully.')
      setConfirm(false)
    },
    onError: () => toast.error('Password generation failed.'),
  })

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card" style={{ maxWidth: '480px' }}>
        <div className="l-card-header">Generate Password</div>
        <div className="l-card-body">

          <div className="form-group">
            <label className="control-label">User Type <span className="required">*</span></label>
            <select className="l-form-control" style={{ width: '150px' }} value={userTypeId}
              onChange={e => setUserTypeId(Number(e.target.value))}>
              <option value={-1}>-- Select --</option>
              {filteredTypes.map(t => (
                <option key={t.value} value={Number(t.value)}>{t.text}</option>
              ))}
            </select>
          </div>

          <div className="l-alert l-alert-info" style={{ fontSize: '90%', marginBottom: '12px' }}>
            This will generate new passwords for all users of the selected type.
            Passwords will be stored as Base64 encoded values.
          </div>

          <button type="button" className="btn-success-legacy"
            disabled={userTypeId <= 0 || genMutation.isPending}
            onClick={() => setConfirm(true)}>
            Generate Password
          </button>
        </div>
      </div>

      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)}
        onConfirm={() => genMutation.mutate()}
        title="Generate Password"
        message={`Generate new passwords for all users of the selected type? This cannot be undone.`}
        confirmLabel="Generate" variant="danger" loading={genMutation.isPending} />
    </div>
  )
}
