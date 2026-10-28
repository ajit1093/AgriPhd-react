import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { admissionApi, type AdmissionSummary } from '@/api/admission'

/**
 * P2-H-07 — Admission/ConfirmAdmission.aspx — College role
 * Exact parity with old project:
 *   - Loads candidate details via Admission_GetAdmissionSummary SP
 *   - Shows all candidate info (personal + allotment details)
 *   - Confirm button: no comments required, calls ConfirmAdmission SP
 *   - Reject button: comments REQUIRED, confirm dialog, calls RejectAdmission SP
 *   - After success → back to allotted-students list
 */
export default function ConfirmAdmissionPage() {
  const { candidateId } = useParams<{ candidateId: string }>()
  const navigate         = useNavigate()
  const cid              = parseInt(candidateId ?? '0')

  const [comments,        setComments]        = useState('')
  const [commentsError,   setCommentsError]   = useState('')
  const [showRejectConfirm, setShowRejectConfirm] = useState(false)

  // Load admission summary
  const { data, isLoading, isError } = useQuery<AdmissionSummary>({
    queryKey: ['admission-summary', cid],
    queryFn:  () => admissionApi.getAdmissionSummary(cid),
    enabled:  cid > 0,
  })

  const confirmMut = useMutation({
    mutationFn: () => admissionApi.confirmAdmission(
      cid,
      data?.phdCollegeCode ?? 0,
      data?.phaseId ?? 0,
      comments
    ),
    onSuccess: r => {
      if (r.success) {
        toast.success('Admission confirmed successfully.')
        navigate('/college/allotted-students')
      } else {
        toast.error('Confirmation failed. Please try again.')
      }
    },
    onError: () => toast.error('Confirmation failed. Please try again.'),
  })

  const rejectMut = useMutation({
    mutationFn: () => admissionApi.rejectAdmission(
      cid,
      data?.phdCollegeCode ?? 0,
      data?.phaseId ?? 0,
      comments
    ),
    onSuccess: r => {
      if (r.success) {
        toast.success('Admission rejected successfully.')
        navigate('/college/allotted-students')
      } else {
        toast.error('Rejection failed. Please try again.')
      }
    },
    onError: () => toast.error('Rejection failed. Please try again.'),
  })

  const handleRejectClick = () => {
    if (!comments.trim()) {
      setCommentsError('Please enter reason for rejection under Remark.')
      return
    }
    setCommentsError('')
    setShowRejectConfirm(true)
  }

  const handleRejectConfirm = () => {
    setShowRejectConfirm(false)
    rejectMut.mutate()
  }

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" style={{ display: 'inline-block' }} />
        <p style={{ marginTop: '8px', color: '#666' }}>Loading candidate details…</p>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div style={{ padding: '8px' }}>
        <div className="l-alert l-alert-danger">Failed to load candidate details. Please go back and try again.</div>
        <button type="button" className="btn-outline-legacy" style={{ marginTop: '8px' }} onClick={() => navigate(-1)}>← Back</button>
      </div>
    )
  }

  if (!data.found) {
    return (
      <div style={{ padding: '8px' }}>
        <div className="l-alert l-alert-danger">This candidate is not allotted in this round.</div>
        <button type="button" className="btn-outline-legacy" style={{ marginTop: '8px' }} onClick={() => navigate('/college/allotted-students')}>← Back to List</button>
      </div>
    )
  }

  return (
    <div style={{ padding: '8px' }}>

      {/* ── Confirm / Reject Admission card ─────────────────────────────── */}
      <div className="l-card">
        <div className="l-card-header">Confirm / Reject Admission</div>
        <div className="l-card-body">

          {/* ── Section 1: Candidate Personal Details ───────────────────── */}
          <div className="l-card" style={{ marginBottom: '12px' }}>
            <div className="l-card-header l-card-header-sm">Candidate Details</div>
            <div className="l-card-body" style={{ padding: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                <InfoRow label="Application Form No :" value={data.applicationFormNo} />
                <InfoRow label="Candidate's Name :"     value={data.candidateName} />
                <InfoRow label="Father's Name :"        value={data.fatherName} />
                <InfoRow label="Mother's Name :"        value={data.motherName} />
                <InfoRow label="Gender :"               value={data.gender} />
                <InfoRow label="Date of Birth :"        value={data.dob} />
                <InfoRow label="E-Mail ID :"            value={data.emailId} />
                <InfoRow label="Mobile Number :"        value={data.mobileNo} />
                <InfoRow label="Category :"             value={data.category} />
                <InfoRow label="Candidate's Home University :" value={data.candidateHomeUniversity} />
                <InfoRow label="Physical Handicapped :" value={data.isPWD} />
                <InfoRow label="Orphan :"               value={data.isOrphan} />
              </div>

              {/* Photo + Signature */}
              {(data.photoUrl || data.signUrl) && (
                <div style={{ display: 'flex', gap: '24px', marginTop: '12px' }}>
                  {data.photoUrl && (
                    <div style={{ textAlign: 'center' }}>
                      <img src={data.photoUrl} alt="Candidate Photo"
                        style={{ width: '80px', height: '100px', border: '1px solid #ccc', objectFit: 'cover' }} />
                      <div style={{ fontSize: '85%', color: '#666', marginTop: '4px' }}>Photo</div>
                    </div>
                  )}
                  {data.signUrl && (
                    <div style={{ textAlign: 'center' }}>
                      <img src={data.signUrl} alt="Candidate Signature"
                        style={{ width: '160px', height: '60px', border: '1px solid #ccc', objectFit: 'contain', marginTop: '40px' }} />
                      <div style={{ fontSize: '85%', color: '#666', marginTop: '4px' }}>Signature</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Section 2: Allotment Details ────────────────────────────── */}
          <div className="l-card" style={{ marginBottom: '12px' }}>
            <div className="l-card-header l-card-header-sm">
              Current Seat Allotment Status ({data.allotmentPhase})
            </div>
            <div className="l-card-body" style={{ padding: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                <InfoRow label="Name of the College :"                          value={data.allottedCollege} />
                <InfoRow label="Faculty Name :"                                 value={data.allottedFaculty} />
                <InfoRow label="Subject Name :"                                 value={data.allottedSubject} />
                <InfoRow label="College Code :"                                 value={data.collegeCode} />
                <InfoRow label="Subject Code :"                                 value={data.subjectCode} />
                <InfoRow label="Allotted Category / Special Category :"         value={data.allottedCategory} />
                <InfoRow label="Allotted Quota :"                               value={data.allottedQuota} />
                <InfoRow label="Roaster Sequence No :"                          value={data.roasterSeqNo} />
                <InfoRow label="Roaster Point No :"                             value={data.roasterPoint} />
                <InfoRow label="Roaster Category :"                             value={data.roasterCategory} />
                <InfoRow label="Alloted Gender :"                               value={data.allotedGender} />
                <InfoRow label="Alloted College Type :"                         value={data.collegeAllotedType} />
                <InfoRow label="Name of the Admission/Nodal Officer :"          value={data.nodalOfficerName} />
                <InfoRow label="Mobile/Contact No. of Admission/Nodal Officer :" value={data.nodalOfficerMobile} />
                <InfoRow label="E-Mail ID of the Admission/Nodal Officer :"     value={data.nodalOfficerEmail} />
              </div>
            </div>
          </div>

          {/* ── Comments ────────────────────────────────────────────────── */}
          <div className="form-group">
            <label className="control-label">
              Comments
              <span style={{ fontSize: '85%', color: '#666', fontWeight: 400, marginLeft: '8px' }}>
                (Required for Rejection)
              </span>
            </label>
            <textarea
              className="l-form-control"
              rows={3}
              maxLength={250}
              value={comments}
              onChange={e => { setComments(e.target.value); if (e.target.value.trim()) setCommentsError('') }}
              placeholder="Enter remarks / reason for rejection"
            />
            {commentsError && (
              <span className="required" style={{ fontSize: '90%' }}>{commentsError}</span>
            )}
          </div>

          {/* ── Action Buttons ───────────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-success-legacy"
              disabled={confirmMut.isPending || rejectMut.isPending}
              onClick={() => confirmMut.mutate()}
            >
              {confirmMut.isPending ? 'Confirming…' : 'Confirm Admission'}
            </button>
            <button
              type="button"
              className="btn-special"
              disabled={confirmMut.isPending || rejectMut.isPending}
              onClick={handleRejectClick}
            >
              {rejectMut.isPending ? 'Rejecting…' : 'Reject Admission'}
            </button>
            <button
              type="button"
              className="btn-outline-legacy"
              onClick={() => navigate('/college/allotted-students')}
            >
              ← Back to List
            </button>
          </div>

        </div>
      </div>

      {/* ── Reject Confirm Dialog ────────────────────────────────────────── */}
      {showRejectConfirm && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '4px', padding: '24px',
            maxWidth: '420px', width: '90%', boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <h5 style={{ marginTop: 0, marginBottom: '12px', color: '#15133C' }}>Reject Admission</h5>
            <p style={{ fontSize: '100%', marginBottom: '20px' }}>
              Are you sure you want to reject this candidate's admission?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-outline-legacy"
                onClick={() => setShowRejectConfirm(false)}>
                No, Cancel
              </button>
              <button type="button" className="btn-special"
                disabled={rejectMut.isPending}
                onClick={handleRejectConfirm}>
                {rejectMut.isPending ? 'Rejecting…' : 'Yes, Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

// ── Info row helper ─────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="user-details" style={{ marginBottom: '2px' }}>
      <span className="label-col" style={{ fontSize: '85%', minWidth: '45%' }}>{label}</span>
      <span className="value-col" style={{ fontSize: '85%', fontWeight: 500 }}>{value || '—'}</span>
    </div>
  )
}
