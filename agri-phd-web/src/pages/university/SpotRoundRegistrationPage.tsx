import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { apiClient } from '@/api/client'

/**
 * P2-J-01 — University/UniversityRegistration.aspx
 * SP: SpotRound_CheckEligibleCandidate + SpotRound_SaveRegistrationDetails
 */
export default function SpotRoundRegistrationPage() {
  const [appFormNo, setAppFormNo] = useState('')
  const [candidate, setCandidate] = useState<Record<string, unknown> | null>(null)

  const lookupMut = useMutation({
    mutationFn: () => apiClient.post<{ success: boolean; candidate?: Record<string, unknown> }>
      ('/university/spot-round/check-eligibility', { applicationFormNo: appFormNo }).then(r => r.data),
    onSuccess: r => { if (r.success && r.candidate) setCandidate(r.candidate); else toast.error('Candidate not eligible or not found.') },
  })

  const registerMut = useMutation({
    mutationFn: () => apiClient.post<{ success: boolean }>('/university/spot-round/register', { applicationFormNo: appFormNo }).then(r => r.data),
    onSuccess: r => { if (r.success) { toast.success('Registered for spot round.'); setCandidate(null); setAppFormNo('') } else toast.error('Registration failed.') },
  })

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card" style={{ maxWidth: '600px' }}>
        <div className="l-card-header">University Spot Round Registration</div>
        <div className="l-card-body">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input type="text" className="l-form-control" style={{ flex: 1 }} placeholder="Application Form No"
              value={appFormNo} onChange={e => setAppFormNo(e.target.value)} />
            <button type="button" className="btn-success-legacy" disabled={lookupMut.isPending} onClick={() => lookupMut.mutate()}>
              {lookupMut.isPending ? 'Checking…' : 'Check Eligibility'}
            </button>
          </div>

          {candidate && (
            <div>
              <div className="l-alert l-alert-success" style={{ marginBottom: '12px' }}>
                Candidate is eligible for spot round registration.
              </div>
              {Object.entries(candidate).slice(0, 6).map(([k, v]) => (
                <div key={k} className="user-details" style={{ marginBottom: '4px' }}>
                  <span className="label-col">{k}</span>
                  <span className="value-col">{String(v ?? '—')}</span>
                </div>
              ))}
              <button type="button" className="btn-special" style={{ marginTop: '12px' }}
                disabled={registerMut.isPending} onClick={() => registerMut.mutate()}>
                {registerMut.isPending ? 'Registering…' : 'Register for Spot Round'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
