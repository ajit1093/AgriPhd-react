import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { apiClient } from '@/api/client'

/**
 * Admin/CheckApplicationID.aspx — exact parity
 *
 * Multi-purpose hub: search by LoginID or ApplicationFormNo → find CandidateID
 * → then take action based on ?flag= query param:
 *
 *   ChangeMobileEMail       → show Change Mobile + Change Email panels inline
 *   ResetCandidatePassword  → show reset password form inline
 *   CheckPaymentHistory     → navigate to /fee/history?candidateId=X
 *   PrintApplicationForm    → navigate to /candidate/application-form/print?candidateId=X
 *   ChangeSecurityQuestion  → navigate to /candidate/change-security-question?candidateId=X
 *   (no flag)               → show candidate basic info
 */

const FLAG_TITLES: Record<string, string> = {
  ChangeMobileEMail:                'Change Mobile No. / E-Mail ID',
  ResetCandidatePassword:           'Reset Candidate Password',
  CheckPaymentHistory:              'Check Payment History',
  PrintApplicationForm:             'Print Application Form',
  ChangeSecurityQuestion:           'Change Security Question',
  CheckDocumentVerificationStatus:  'Check Document Verification Status',
  // College flags
  ConfirmAdmission:                 'Confirm Admission',
  CancelAdmission:                  'Cancel Admission',
  PrintAdmissionLetter:             'Print Admission Letter',
  PrintAdmissionRejectionLetter:    'Print Admission Rejection Letter',
  PrintAdmissionCancellationLetter: 'Print Admission Cancellation Letter',
}

const pwdSchema = z.object({
  newPassword:     z.string().min(6, 'Min 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

// ── Change Mobile/Email panel ────────────────────────────────────────────────
function ChangeMobileEmailPanel({ candidateId }: { candidateId: number }) {
  const [mobile, setMobile] = useState('')
  const [email,  setEmail]  = useState('')

  const mobileMut = useMutation({
    mutationFn: () => apiClient.post(`/admin/candidates/${candidateId}/change-mobile`, { mobileNo: mobile }).then(r => r.data),
    onSuccess: (d) => { if (d.success) { toast.success('Mobile Number changed successfully.'); setMobile('') } else toast.error(d.message ?? 'Failed.') },
    onError: () => toast.error('Failed to change mobile number.'),
  })
  const emailMut = useMutation({
    mutationFn: () => apiClient.post(`/admin/candidates/${candidateId}/change-email`, { eMailId: email }).then(r => r.data),
    onSuccess: (d) => { if (d.success) { toast.success('E-Mail ID changed successfully.'); setEmail('') } else toast.error(d.message ?? 'Failed.') },
    onError: () => toast.error('Failed to change e-mail.'),
  })

  return (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px' }}>
      {/* Change Mobile Number panel */}
      <div className="l-card" style={{ flex: '1 1 280px' }}>
        <div className="l-card-header l-card-header-sm">Change Mobile Number</div>
        <div className="l-card-body">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <input type="tel" className="l-form-control" maxLength={10}
                placeholder="Enter Mobile Number"
                value={mobile} onChange={e => setMobile(e.target.value)} />
            </div>
            <button type="button" className="btn-primary-legacy"
              disabled={mobile.length !== 10 || mobileMut.isPending}
              onClick={() => mobileMut.mutate()}>
              {mobileMut.isPending ? '...' : 'Change Mobile Number'}
            </button>
          </div>
        </div>
      </div>

      {/* Change E-Mail ID panel */}
      <div className="l-card" style={{ flex: '1 1 280px' }}>
        <div className="l-card-header l-card-header-sm">Change E-Mail ID</div>
        <div className="l-card-body">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <input type="email" className="l-form-control"
                placeholder="Enter E-Mail ID"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <button type="button" className="btn-primary-legacy"
              disabled={!email.includes('@') || emailMut.isPending}
              onClick={() => emailMut.mutate()}>
              {emailMut.isPending ? '...' : 'Change E-Mail ID'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Reset Password panel ───────────────────────────────────────────────────────
function ChangeSecurityQuestionPanel({ candidateId }: { candidateId: number }) {
  const [questionId, setQuestionId] = useState(0)
  const [answer, setAnswer] = useState('')
  const { data: questions = [] } = useQuery({
    queryKey: ['master', 'security-question'],
    queryFn: () => apiClient.get('/master/security-question').then(r => r.data),
    staleTime: 3_600_000,
  })
  const mut = useMutation({
    mutationFn: () => apiClient.post('/admin/candidates/' + candidateId + '/change-security-question',
      { securityQuestionId: questionId, securityQuestionAnswer: answer }).then(r => r.data),
    onSuccess: (d) => {
      if (d.success) { toast.success('Security Question changed successfully.'); setAnswer(''); setQuestionId(0) }
      else toast.error(d.message ?? 'Failed.')
    },
    onError: () => toast.error('Failed to change security question.'),
  })
  return (
    <div className="l-card" style={{ maxWidth: '500px', marginTop: '16px' }}>
      <div className="l-card-header l-card-header-sm">Change Security Question</div>
      <div className="l-card-body">
        <div className="form-group">
          <label className="control-label">Security Question <span className="required">*</span></label>
          <select className="l-form-control" value={questionId} onChange={e => setQuestionId(Number(e.target.value))}>
            <option value={0}>-- Select --</option>
            {(questions as { value: string; text: string }[]).map(q => (
              <option key={q.value} value={Number(q.value)}>{q.text}</option>
            ))}
          </select>
          <span style={{fontSize:'90%',color:'#666'}}>Security questions load from master data.</span>
        </div>
        <div className="form-group">
          <label className="control-label">Security Answer <span className="required">*</span></label>
          <input type="text" className="l-form-control" placeholder="Enter answer"
            value={answer} onChange={e => setAnswer(e.target.value)} />
        </div>
        <button type="button" className="btn-special"
          disabled={questionId <= 0 || !answer.trim() || mut.isPending}
          onClick={() => mut.mutate()}>
          {mut.isPending ? 'Saving...' : 'Change Security Question'}
        </button>
      </div>
    </div>
  )
}

function ResetPasswordPanel({ candidateId, loginId }: { candidateId: number; loginId: string }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(pwdSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })
  const mut = useMutation({
    mutationFn: (d: { newPassword: string }) =>
      apiClient.post(`/admin/candidates/${candidateId}/reset-password`, { newPassword: d.newPassword }).then(r => r.data),
    onSuccess: (d) => {
      if (d.success) { toast.success('Password reset successfully.'); reset() }
      else toast.error(d.message ?? 'Reset failed.')
    },
    onError: () => toast.error('Reset failed.'),
  })
  return (
    <div className="l-card" style={{ maxWidth: '400px', marginTop: '16px' }}>
      <div className="l-card-header l-card-header-sm">Reset Password for: {loginId}</div>
      <div className="l-card-body">
        <form onSubmit={handleSubmit(d => mut.mutate(d))} noValidate>
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
          <button type="submit" className="btn-special" disabled={mut.isPending}>
            {mut.isPending ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Main hub page ─────────────────────────────────────────────────────────────
export default function CheckApplicationIdAdminPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const flag = (searchParams.get('flag') ?? searchParams.get('Flag') ?? '').toLowerCase()
  const title = Object.entries(FLAG_TITLES).find(([k]) => k.toLowerCase() === flag)?.[1] || 'Check Application ID'

  const [searchBy,   setSearchBy]   = useState('LoginID')
  const [loginId,    setLoginId]    = useState('')
  const [candidateId, setCandidateId] = useState(0)
  const [submitted,  setSubmitted]  = useState(false)
  const [notFound,   setNotFound]   = useState(false)

  const lookupMut = useMutation({
    mutationFn: () => apiClient.get<{ candidateId: number; found: boolean }>(
      `/admin/candidate-by-login?loginId=${encodeURIComponent(loginId)}&searchBy=${searchBy === 'LoginID' ? 'L' : 'A'}`
    ).then(r => r.data),
    onSuccess: (d) => {
      setSubmitted(true)
      if (d.found && d.candidateId > 0) {
        setCandidateId(d.candidateId)
        setNotFound(false)
        // For navigation-based flags, redirect immediately
        switch (flag) {
          case 'checkpaymenthistory':
            navigate(`/fee/history?candidateId=${d.candidateId}`)
            break
          case 'printapplicationform':
            navigate(`/candidate/application-form/print?candidateId=${d.candidateId}`)
            break
          case 'confirmadmission':
            navigate(`/college/confirm-admission/${d.candidateId}`)
            break
          case 'canceladmission':
            navigate(`/admission/cancel?candidateId=${d.candidateId}`)
            break
          case 'printadmissionletter':
            navigate(`/admission/letter?candidateId=${d.candidateId}`)
            break
          case 'printadmissionrejectionletter':
            navigate(`/admission/rejection-letter?candidateId=${d.candidateId}`)
            break
          case 'printadmissioncancellationletter':
            navigate(`/admission/cancellation-letter?candidateId=${d.candidateId}`)
            break
          // changesecurityquestion, changemobileemail, resetcandidatepassword handled inline below
        }
      } else {
        setCandidateId(0)
        setNotFound(true)
      }
    },
    onError: () => { setNotFound(true); setSubmitted(true) },
  })

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card">
        <div className="l-card-header">{title}</div>
        <div className="l-card-body">

          {/* Search form — matches legacy layout exactly */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label className="control-label" style={{ whiteSpace: 'nowrap' }}>Search By :</label>
              <select className="l-form-control" style={{ width: '180px' }} value={searchBy}
                onChange={e => { setSearchBy(e.target.value); setSubmitted(false); setCandidateId(0) }}>
                <option value="LoginID">LoginID</option>
                <option value="ApplicationFormNo">Application Form No.</option>
              </select>
            </div>
            <input type="text" className="l-form-control" style={{ width: '240px' }}
              placeholder={searchBy === 'LoginID' ? 'Enter Login ID' : 'Enter Application Form No.'}
              value={loginId}
              onKeyDown={e => e.key === 'Enter' && loginId.trim() && lookupMut.mutate()}
              onChange={e => { setLoginId(e.target.value); setSubmitted(false); setCandidateId(0) }} />
          </div>

          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <button type="button" className="btn-success-legacy"
              disabled={!loginId.trim() || lookupMut.isPending}
              onClick={() => lookupMut.mutate()}>
              {lookupMut.isPending ? 'Searching…' : 'Search'}
            </button>
          </div>

          {/* Results */}
          {submitted && notFound && (
            <div className="l-alert l-alert-warning">
              Invalid Application No. / Login ID: <strong>{loginId}</strong>
            </div>
          )}

          {/* Flag-specific inline actions */}
          {submitted && candidateId > 0 && flag === 'changemobileemail' && (
            <ChangeMobileEmailPanel candidateId={candidateId} />
          )}

          {submitted && candidateId > 0 && flag === 'resetcandidatepassword' && (
            <ResetPasswordPanel candidateId={candidateId} loginId={loginId} />
          )}

          {submitted && candidateId > 0 && flag === 'changesecurityquestion' && (
            <ChangeSecurityQuestionPanel candidateId={candidateId} />
          )}

          {/* For no-flag or other flags that need basic display */}
          {submitted && candidateId > 0 && !flag && (
            <div className="l-alert l-alert-success">
              Candidate found. Candidate ID: <strong>{candidateId}</strong>
            </div>
          )}

          {/* Fallback: flag was set but didn't match any inline panel — show found message */}
          {submitted && candidateId > 0 && flag &&
            !['changemobileemail','resetcandidatepassword','changesecurityquestion'].includes(flag) && (
            <div className="l-alert l-alert-info">
              Candidate found (ID: <strong>{candidateId}</strong>). Loading…
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



