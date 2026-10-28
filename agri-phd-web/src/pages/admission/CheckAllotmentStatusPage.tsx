import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { admissionApi } from '@/api/admission'

/**
 * P2-H-01 — Admission/CheckAllotmentStatus.aspx
 * SP: Admission_GetAllotmentStatus_AgriPG(@PhaseID, @CandidateID)
 */
export default function CheckAllotmentStatusPage() {
  const [phaseId, setPhaseId] = useState(0)
  const [showRefuse, setShowRefuse] = useState(false)
  const [refusalReason, setRefusalReason] = useState('')

  const { data: phases = [] } = useQuery({ queryKey: ['phases'], queryFn: () => admissionApi.getPhases() })
  const { data: current }     = useQuery({ queryKey: ['current-phase'], queryFn: admissionApi.getCurrentPhase })

  const effectivePhase = phaseId || current?.phaseId || 0

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['allotment-status', effectivePhase],
    queryFn:  () => admissionApi.getAllotmentStatus(effectivePhase),
    enabled:  effectivePhase > 0,
  })

  const acceptMut = useMutation({
    mutationFn: () => admissionApi.saveAllotmentResponse(effectivePhase, data?.allottedCollegeCode ?? '', true, false),
    onSuccess: (r) => { if (r.success) { toast.success('Allotment accepted.'); refetch() } else toast.error('Failed.') },
  })
  const refuseMut = useMutation({
    mutationFn: () => admissionApi.saveAllotmentResponse(effectivePhase, data?.allottedCollegeCode ?? '', false, true, refusalReason),
    onSuccess: (r) => { if (r.success) { toast.success('Allotment refused.'); setShowRefuse(false); refetch() } else toast.error('Failed.') },
  })

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card">
        <div className="l-card-header">Check Allotment Status</div>
        <div className="l-card-body">
          {/* Phase selector */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: '1 1 250px' }}>
              <label className="control-label">Select Round</label>
              <select className="l-form-control" value={phaseId} onChange={e => setPhaseId(Number(e.target.value))}>
                <option value={0}>-- Current Round --</option>
                {phases.map(p => <option key={p.value} value={Number(p.value)}>{p.text}</option>)}
              </select>
            </div>
          </div>

          {isLoading && <p>Loading allotment status…</p>}

          {data && !data.found && <div className="l-alert l-alert-info">No allotment found for the selected round.</div>}

          {data?.found && (
            <div>
              {/* Allotment details */}
              <div className="l-card" style={{ marginBottom: '12px', backgroundColor: '#d1e7dd', borderColor: '#badbcc' }}>
                <div className="l-card-header" style={{ backgroundColor: '#0f5132', color: '#fff' }}>
                  Allotment Details — {data.allotmentPhase}
                </div>
                <div className="l-card-body">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {[
                      ['Candidate Name',    data.candidateName],
                      ['Application Form No', data.applicationFormNo],
                      ['Allotted College',  data.allottedCollege],
                      ['District',          data.district],
                      ['Faculty',           data.facultyName],
                      ['Subject',           data.subjectName],
                      ['Category',          data.allottedCategory],
                      ['Quota',             data.allottedQuota],
                      ['Roster Seq No',     data.roasterSeqNo],
                    ].map(([label, val]) => (
                      <div key={label} className="user-details" style={{ flex: '1 1 280px' }}>
                        <span className="label-col">{label}</span>
                        <span className="value-col">{val || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              {data.isEligibleToDownload && !data.isAccepted && !data.isRefused && (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <Link to={`/admission/allotment-letter?phaseId=${effectivePhase}`} className="btn-success-legacy">
                    Download Allotment Letter
                  </Link>
                  <button type="button" className="btn-special"
                    disabled={acceptMut.isPending}
                    onClick={() => acceptMut.mutate()}>
                    {acceptMut.isPending ? 'Processing…' : 'Accept Allotment'}
                  </button>
                  <button type="button"
                    style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '0.25rem', padding: '0.375rem 0.75rem', cursor: 'pointer' }}
                    onClick={() => setShowRefuse(true)}>
                    Refuse Allotment
                  </button>
                </div>
              )}
              {data.isAccepted && <div className="l-alert l-alert-success">You have accepted this allotment.</div>}
              {data.isRefused  && <div className="l-alert l-alert-danger">You have refused this allotment. Reason: {data.refusalReason}</div>}
            </div>
          )}
        </div>
      </div>

      {/* Refuse dialog */}
      {showRefuse && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="l-card" style={{ maxWidth: '460px', width: '100%', margin: '16px' }}>
            <div className="l-card-header">Refuse Allotment</div>
            <div className="l-card-body">
              <div className="form-group">
                <label className="control-label">Reason for Refusal <span className="required">*</span></label>
                <textarea className="l-form-control" rows={3} maxLength={250}
                  value={refusalReason} onChange={e => setRefusalReason(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="btn-special"
                  disabled={!refusalReason.trim() || refuseMut.isPending}
                  onClick={() => refuseMut.mutate()}>
                  {refuseMut.isPending ? 'Processing…' : 'Confirm Refusal'}
                </button>
                <button type="button" className="btn-success-legacy" onClick={() => setShowRefuse(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
