import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { apiClient } from '@/api/client'

/**
 * Administration/ManageAdmissionActivityStatus.aspx — exact parity
 * SP cols (PascalCase): PhaseID, Phase, AllotmentDisplayStartDateF,
 * AdmissionStartDateF, CandidateAdmissionLastDateF, CollegeAdmissionLastDateF,
 * SystemAdmissionLastDateF, IsCurrentPhase, IsActive
 */

interface AdmissionActivity {
  PhaseID: number
  Phase: string
  AllotmentDisplayStartDateF: string
  AdmissionStartDateF: string
  CandidateAdmissionLastDateF: string
  CollegeAdmissionLastDateF: string
  SystemAdmissionLastDateF: string
  IsCurrentPhase: boolean | string
  IsActive: boolean | string
}

function toInput(s: string) {
  if (!s?.trim()) return ''
  const [d, t] = s.trim().split(' ')
  const [dd, mm, yyyy] = (d ?? '').split('-')
  if (!yyyy) return ''
  return `${yyyy}-${mm}-${dd}T${t ?? '00:00'}`
}
function fromInput(s: string) {
  if (!s) return ''
  const [date, time] = s.split('T')
  const [yyyy, mm, dd] = (date ?? '').split('-')
  if (!yyyy) return ''
  return `${dd}-${mm}-${yyyy} ${time ?? '00:00'}`
}

export default function ManageAdmissionActivityStatusPage() {
  const qc = useQueryClient()
  const [editId, setEditId] = useState<number | null>(null)

  const { data: rows = [], isLoading } = useQuery<AdmissionActivity[]>({
    queryKey: ['admin', 'admission-activity'],
    queryFn: () => apiClient.get('/admin/admission-activity').then(r => r.data),
  })

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      phaseId: 0,
      allotmentDisplayStartDate: '', admissionStartDate: '',
      candidateAdmissionLastDate: '', collegeAdmissionLastDate: '',
      systemAdmissionLastDate: '', isCurrentPhase: false, isActive: true,
    }
  })

  const saveMutation = useMutation({
    mutationFn: (d: Record<string, unknown>) => apiClient.post('/admin/admission-activity', {
      ...d,
      allotmentDisplayStartDate:  fromInput(d['allotmentDisplayStartDate'] as string),
      admissionStartDate:         fromInput(d['admissionStartDate'] as string),
      candidateAdmissionLastDate: fromInput(d['candidateAdmissionLastDate'] as string),
      collegeAdmissionLastDate:   fromInput(d['collegeAdmissionLastDate'] as string),
      systemAdmissionLastDate:    fromInput(d['systemAdmissionLastDate'] as string),
    }).then(r => r.data),
    onSuccess: () => {
      toast.success('Saved.')
      qc.invalidateQueries({ queryKey: ['admin', 'admission-activity'] })
      setEditId(null); reset()
    },
    onError: () => toast.error('Save failed.'),
  })

  const onEdit = (r: AdmissionActivity) => {
    setValue('phaseId',                    r.PhaseID)
    setValue('allotmentDisplayStartDate',  toInput(r.AllotmentDisplayStartDateF))
    setValue('admissionStartDate',         toInput(r.AdmissionStartDateF))
    setValue('candidateAdmissionLastDate', toInput(r.CandidateAdmissionLastDateF))
    setValue('collegeAdmissionLastDate',   toInput(r.CollegeAdmissionLastDateF))
    setValue('systemAdmissionLastDate',    toInput(r.SystemAdmissionLastDateF))
    setValue('isCurrentPhase', String(r.IsCurrentPhase).toLowerCase() === 'true')
    setValue('isActive', String(r.IsActive).toLowerCase() === 'true')
    setEditId(r.PhaseID)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const DT = ({ label, name }: { label: string; name: string }) => (
    <div className="form-group" style={{ flex: '1 1 200px' }}>
      <label className="control-label">{label}</label>
      <input type="datetime-local" className="l-form-control" {...register(name as Parameters<typeof register>[0])} />
    </div>
  )

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card">
        <div className="l-card-header">Manage Admission Activity Status</div>
        <div className="l-card-body">

          {editId !== null && (
            <form onSubmit={handleSubmit(d => saveMutation.mutate(d as Record<string, unknown>))}
              style={{ marginBottom: '24px', background: '#f8f9fa', padding: '16px', borderRadius: '4px' }}>
              <input type="hidden" {...register('phaseId', { valueAsNumber: true })} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <DT label="Allotment Display Start"  name="allotmentDisplayStartDate" />
                <DT label="Admission Start"          name="admissionStartDate" />
                <DT label="Candidate Last Date"      name="candidateAdmissionLastDate" />
                <DT label="College Last Date"        name="collegeAdmissionLastDate" />
                <DT label="System Last Date"         name="systemAdmissionLastDate" />
                <div className="form-group" style={{ flex: '1 1 120px' }}>
                  <label className="control-label">Is Current Phase</label>
                  <select className="l-form-control" {...register('isCurrentPhase', { setValueAs: v => v === 'true' || v === true })}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: '1 1 120px' }}>
                  <label className="control-label">Is Active</label>
                  <select className="l-form-control" {...register('isActive', { setValueAs: v => v === 'true' || v === true })}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '12px' }}>
                <button type="submit" className="btn-special" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving…' : 'Save'}
                </button>
                <button type="button" className="btn-outline-legacy" style={{ marginLeft: '8px' }}
                  onClick={() => { setEditId(null); reset() }}>Cancel</button>
              </div>
            </form>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table className="grid-view" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Phase</th><th>Allotment Start</th><th>Admission Start</th>
                  <th>Candidate Last</th><th>College Last</th>
                  <th>Current</th><th>Active</th><th>Edit</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '16px' }}>Loading…</td></tr>
                  : rows.length === 0
                    ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '16px', color: '#888' }}>No phases found.</td></tr>
                    : rows.map(r => (
                      <tr key={r.PhaseID} style={{ background: editId === r.PhaseID ? '#fff3cd' : undefined }}>
                        <td style={{ fontWeight: 600 }}>{r.Phase}</td>
                        <td>{r.AllotmentDisplayStartDateF}</td>
                        <td>{r.AdmissionStartDateF}</td>
                        <td>{r.CandidateAdmissionLastDateF}</td>
                        <td>{r.CollegeAdmissionLastDateF}</td>
                        <td style={{ textAlign: 'center' }}>{String(r.IsCurrentPhase).toLowerCase() === 'true' ? 'Yes' : 'No'}</td>
                        <td style={{ textAlign: 'center' }}>{String(r.IsActive).toLowerCase() === 'true' ? 'Active' : 'Inactive'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button type="button" onClick={() => onEdit(r)}
                            style={{ color: '#0d6efd', background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
