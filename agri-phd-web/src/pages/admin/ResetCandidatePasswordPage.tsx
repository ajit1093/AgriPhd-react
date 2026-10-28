import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { apiClient } from '@/api/client'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

const schema = z.object({
  newPassword:     z.string().min(6, 'Min 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

export default function ResetCandidatePasswordPage() {
  const [appId, setAppId] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [candidateId, setCandidateId] = useState<number | null>(null)
  const [confirm, setConfirm] = useState(false)
  const [pendingPwd, setPendingPwd] = useState('')

  const { data: candidate, isLoading: searching } = useQuery({
    queryKey: ['admin', 'candidate-lookup', appId],
    queryFn: () => apiClient.get(`/candidates/lookup?applicationId=${appId}`).then(r => r.data),
    enabled: submitted && appId.trim().length > 0,
    staleTime: 0,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  const resetMutation = useMutation({
    mutationFn: ({ id, pwd }: { id: number; pwd: string }) =>
      apiClient.post(`/admin/candidates/${id}/reset-password`, { newPassword: pwd }).then(r => r.data),
    onSuccess: () => { toast.success('Password reset successfully.'); reset(); setConfirm(false) },
    onError: () => toast.error('Reset failed.'),
  })

  const onSearch = (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true) }

  const onSubmitPwd = (d: { newPassword: string }) => {
    const cid = candidate?.candidateID ?? candidate?.userID
    if (!cid) { toast.error('Candidate not found.'); return }
    setCandidateId(Number(cid))
    setPendingPwd(d.newPassword)
    setConfirm(true)
  }

  const S = (k: string) => String(candidate?.[k] ?? '')

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card">
        <div className="l-card-header">Reset Candidate Password</div>
        <div className="l-card-body">

          {/* Step 1: Find candidate */}
          <form onSubmit={onSearch} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: '1 1 240px' }}>
              <label className="control-label">Application Form No. / Login ID</label>
              <input type="text" className="l-form-control" placeholder="Enter Application Form No."
                value={appId} onChange={e => { setAppId(e.target.value); setSubmitted(false) }} />
            </div>
            <button type="submit" className="btn-primary-legacy" disabled={!appId.trim() || searching}>
              {searching ? 'Searching…' : 'Find Candidate'}
            </button>
          </form>

          {/* Candidate details */}
          {submitted && candidate && (
            <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '4px', border: '1px solid #dee2e6', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div><span style={{ fontSize: '80%', color: '#6c757d' }}>Name</span><br /><strong>{S('candidateName')}</strong></div>
                <div><span style={{ fontSize: '80%', color: '#6c757d' }}>App. Form No.</span><br /><strong>{S('applicationFormNo')}</strong></div>
                <div><span style={{ fontSize: '80%', color: '#6c757d' }}>Mobile</span><br /><strong>{S('mobileNo')}</strong></div>
                <div><span style={{ fontSize: '80%', color: '#6c757d' }}>Email</span><br /><strong>{S('eMailID')}</strong></div>
              </div>
            </div>
          )}

          {submitted && !candidate && !searching && (
            <div className="l-alert l-alert-warning">No candidate found with this Application Form No.</div>
          )}

          {/* Step 2: Set new password */}
          {submitted && candidate && (
            <form onSubmit={handleSubmit(onSubmitPwd)} style={{ maxWidth: '400px' }}>
              <div className="l-alert l-alert-warning" style={{ marginBottom: '12px', fontSize: '90%' }}>
                Password Rules: Min 6 characters. New password will be shared with candidate via SMS/Email separately.
              </div>
              <div className="form-group">
                <label className="control-label">New Password <span className="required">*</span></label>
                <input type="password" className="l-form-control" {...register('newPassword')} />
                {errors.newPassword && <span className="required" style={{ fontSize: '90%' }}>{errors.newPassword.message}</span>}
              </div>
              <div className="form-group">
                <label className="control-label">Confirm Password <span className="required">*</span></label>
                <input type="password" className="l-form-control" {...register('confirmPassword')} />
                {errors.confirmPassword && <span className="required" style={{ fontSize: '90%' }}>{errors.confirmPassword.message}</span>}
              </div>
              <button type="submit" className="btn-special">Reset Password</button>
            </form>
          )}
        </div>
      </div>

      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)}
        onConfirm={() => candidateId && resetMutation.mutate({ id: candidateId, pwd: pendingPwd })}
        title="Reset Candidate Password"
        message="This will reset the candidate's password. They will need to use the new password to login. Continue?"
        confirmLabel="Reset Password" variant="danger" loading={resetMutation.isPending} />
    </div>
  )
}
