import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { collegeApi } from '@/api/college'
import { useMasterData } from '@/hooks/useMasterData'

/** P2-I-02 — College/EditCollegeDetails.aspx — SP: College_SaveCollegeDetails (22 @params) */
export default function EditCollegePage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const collegeId = parseInt(id ?? '0')

  const { data: existing, isLoading } = useQuery({
    queryKey: ['college', collegeId],
    queryFn: () => collegeApi.getDetails(collegeId),
    enabled: collegeId > 0,
  })

  const { data: districts } = useMasterData('district')
  const { data: courses }   = useMasterData('course')
  const { data: courseStatuses } = useMasterData('course-status')

  const { register, handleSubmit, reset } = useForm<Record<string, string | number>>()

  useEffect(() => {
    if (existing) reset(existing as Record<string, string | number>)
  }, [existing, reset])

  const saveMut = useMutation({
    mutationFn: (v: Record<string, string | number>) => collegeApi.saveDetails(collegeId, v as Record<string, unknown>),
    onSuccess: r => { if (r.success) { toast.success('College details saved.'); navigate('/college/list') } else toast.error('Save failed.') },
  })

  if (isLoading) return <div style={{ padding: '20px' }}>Loading…</div>

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card">
        <div className="l-card-header">Edit College Details</div>
        <div className="l-card-body">
          <form onSubmit={handleSubmit(v => saveMut.mutate(v))} noValidate>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {[
                { field: 'CollegeCode',   label: 'College Code', readonly: true },
                { field: 'CollegeName',   label: 'College Name' },
                { field: 'CollegeAddress',label: 'College Address' },
                { field: 'City',          label: 'City' },
                { field: 'Pincode',       label: 'Pincode' },
                { field: 'MobileNo',      label: 'Mobile No' },
                { field: 'EMailID',       label: 'E-Mail ID' },
                { field: 'Intake',        label: 'Intake' },
                { field: 'PrincipalName', label: 'Principal Name' },
                { field: 'PrincipalEMailID', label: 'Principal Email' },
                { field: 'PrincipalMobileNo', label: 'Principal Mobile' },
                { field: 'AdmissionInchargeName', label: 'Admission Incharge Name' },
                { field: 'AdmissionInchargeEMailID', label: 'Admission Incharge Email' },
                { field: 'AdmissionInchargeMobileNo', label: 'Admission Incharge Mobile' },
              ].map(({ field, label, readonly }) => (
                <div key={field} className="form-group" style={{ flex: '1 1 230px' }}>
                  <label className="control-label">{label}</label>
                  <input type="text" className="l-form-control" readOnly={readonly} {...register(field)} />
                </div>
              ))}
              <div className="form-group" style={{ flex: '1 1 200px' }}>
                <label className="control-label">District</label>
                <select className="l-form-control" {...register('DistrictID', { valueAsNumber: true })}>
                  <option value={0}>-- Select --</option>
                  {(districts ?? []).map(d => <option key={d.value} value={Number(d.value)}>{d.text}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ flex: '1 1 200px' }}>
                <label className="control-label">Course</label>
                <select className="l-form-control" {...register('CourseID', { valueAsNumber: true })}>
                  <option value={0}>-- Select --</option>
                  {(courses ?? []).map(c => <option key={c.value} value={Number(c.value)}>{c.text}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ flex: '1 1 200px' }}>
                <label className="control-label">Course Status</label>
                <select className="l-form-control" {...register('CourseStatusID', { valueAsNumber: true })}>
                  <option value={0}>-- Select --</option>
                  {(courseStatuses ?? []).map(s => <option key={s.value} value={Number(s.value)}>{s.text}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn-special" disabled={saveMut.isPending}>
                {saveMut.isPending ? 'Saving…' : 'Save College Details'}
              </button>
              <button type="button" className="btn-success-legacy" onClick={() => navigate(-1)}>Back</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
