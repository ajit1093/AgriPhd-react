import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { admissionApi } from '@/api/admission'

/** P2-H-14 — Admission/CancelAdmission.aspx — Admin only */
export default function CancelAdmissionPage() {
  const navigate = useNavigate()
  const [candidateId, setCandidateId] = useState('')
  const [choiceCode, setChoiceCode]   = useState('')
  const [phaseId, setPhaseId]         = useState('')
  const [comments, setComments]       = useState('')

  const cancelMut = useMutation({
    mutationFn: () => admissionApi.cancelAdmission(parseInt(candidateId), parseInt(choiceCode), parseInt(phaseId) as unknown as number, comments),
    onSuccess: r => { if (r.success) { toast.success('Admission cancelled.'); navigate('/admin/dashboard') } else toast.error('Cancellation failed.') },
  })

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card" style={{ maxWidth: '500px' }}>
        <div className="l-card-header">Cancel Admission</div>
        <div className="l-card-body">
          <div className="l-alert l-alert-danger" style={{ marginBottom: '12px' }}>
            <strong>Warning:</strong> This action cancels the candidate's admission. This cannot be undone.
          </div>
          <div className="form-group">
            <label className="control-label">Candidate ID <span className="required">*</span></label>
            <input type="number" className="l-form-control" value={candidateId} onChange={e => setCandidateId(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="control-label">Choice Code (College Code) <span className="required">*</span></label>
            <input type="number" className="l-form-control" value={choiceCode} onChange={e => setChoiceCode(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="control-label">Phase ID <span className="required">*</span></label>
            <input type="number" className="l-form-control" value={phaseId} onChange={e => setPhaseId(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="control-label">Cancellation Comments <span className="required">*</span></label>
            <textarea className="l-form-control" rows={3} maxLength={500} value={comments} onChange={e => setComments(e.target.value)} />
          </div>
          <button type="button" className="btn-special"
            disabled={!candidateId || !choiceCode || !phaseId || !comments.trim() || cancelMut.isPending}
            onClick={() => cancelMut.mutate()}>
            {cancelMut.isPending ? 'Cancelling…' : 'Cancel Admission'}
          </button>
        </div>
      </div>
    </div>
  )
}
