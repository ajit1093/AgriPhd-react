import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { apiClient } from '@/api/client'

/** P2-J-02 — University/UniversityConfirmAdmission.aspx — SpotRound_AdmitCandidates */
export default function SpotRoundConfirmAdmissionPage() {
  const [appFormNo, setAppFormNo] = useState('')
  const [rosterSrNo, setRosterSrNo] = useState('')
  const [comments, setComments]   = useState('')

  const admitMut = useMutation({
    mutationFn: () => apiClient.post<{ success: boolean }>('/university/spot-round/admit',
      { applicationFormNo: appFormNo, rosterSrNo: parseInt(rosterSrNo), comments }).then(r => r.data),
    onSuccess: r => { if (r.success) { toast.success('Candidate admitted in spot round.'); setAppFormNo(''); setRosterSrNo(''); setComments('') } else toast.error('Admission failed.') },
  })

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card" style={{ maxWidth: '500px' }}>
        <div className="l-card-header">Spot Round Confirm Admission</div>
        <div className="l-card-body">
          {[
            { label: 'Application Form No', val: appFormNo, setter: setAppFormNo },
            { label: 'Roster Sr No',        val: rosterSrNo, setter: setRosterSrNo },
          ].map(({ label, val, setter }) => (
            <div key={label} className="form-group">
              <label className="control-label">{label} <span className="required">*</span></label>
              <input type="text" className="l-form-control" value={val} onChange={e => setter(e.target.value)} />
            </div>
          ))}
          <div className="form-group">
            <label className="control-label">Comments</label>
            <textarea className="l-form-control" rows={2} value={comments} onChange={e => setComments(e.target.value)} />
          </div>
          <button type="button" className="btn-special" disabled={!appFormNo || !rosterSrNo || admitMut.isPending}
            onClick={() => admitMut.mutate()}>
            {admitMut.isPending ? 'Processing…' : 'Confirm Admission'}
          </button>
        </div>
      </div>
    </div>
  )
}
