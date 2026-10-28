import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { apiClient } from '@/api/client'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

/**
 * Administration/ManagePhase.aspx — exact parity
 * SP cols (PascalCase): PhaseID, Phase, AllotmentDisplayStartDateF,
 * AdmissionStartDateF, CandidateAdmissionLastDateF, CollegeAdmissionLastDateF,
 * SystemAdmissionLastDateF, IsCurrentPhaseText, IsActiveText
 */

interface Phase {
  PhaseID: number
  Phase: string
  AllotmentDisplayStartDateF: string
  AdmissionStartDateF: string
  CandidateAdmissionLastDateF: string
  CollegeAdmissionLastDateF: string
  SystemAdmissionLastDateF: string
  IsCurrentPhaseText: string
  IsActiveText: string
}

function toInput(s: string) {
  if (!s?.trim()) return ''
  const [d, t] = s.trim().split(' ')
  const parts = (d ?? '').split('-')
  if (parts.length < 3) return ''
  const [dd, mm, yyyy] = parts
  return `${yyyy}-${mm}-${dd}T${t ?? '00:00'}`
}
function fromInput(s: string) {
  if (!s) return ''
  const [date, time] = s.split('T')
  const [yyyy, mm, dd] = (date ?? '').split('-')
  if (!yyyy) return ''
  return `${dd}-${mm}-${yyyy} ${time ?? '00:00'}`
}

export default function ManagePhasePage() {
  const qc = useQueryClient()
  const [editId, setEditId]     = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const { data: rows = [], isLoading } = useQuery<Phase[]>({
    queryKey: ['admin', 'phases'],
    queryFn: () => apiClient.get('/admin/phases').then(r => r.data),
  })

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      phaseId: 0, phase: '',
      allotmentDisplayStartDate: '', admissionStartDate: '',
      candidateAdmissionLastDate: '', collegeAdmissionLastDate: '',
      systemAdmissionLastDate: '', isCurrentPhase: -1, isActive: 1,
    }
  })

  const saveMutation = useMutation({
    mutationFn: (d: Record<string, unknown>) => apiClient.post('/admin/phases', {
      ...d,
      allotmentDisplayStartDate:  fromInput(d['allotmentDisplayStartDate'] as string),
      admissionStartDate:         fromInput(d['admissionStartDate'] as string),
      candidateAdmissionLastDate: fromInput(d['candidateAdmissionLastDate'] as string),
      collegeAdmissionLastDate:   fromInput(d['collegeAdmissionLastDate'] as string),
      systemAdmissionLastDate:    fromInput(d['systemAdmissionLastDate'] as string),
    }).then(r => r.data),
    onSuccess: () => { toast.success('Phase Details Saved Successfully.'); qc.invalidateQueries({ queryKey: ['admin','phases'] }); resetForm() },
    onError: () => toast.error('Save failed.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/admin/phases/${id}`).then(r => r.data),
    onSuccess: () => { toast.success('Phase Deleted Successfully.'); qc.invalidateQueries({ queryKey: ['admin','phases'] }); setDeleteId(null) },
    onError: () => toast.error('Delete failed.'),
  })

  const resetForm = () => { reset(); setEditId(null); setShowForm(false) }

  const onEdit = (r: Phase) => {
    setValue('phaseId',                    r.PhaseID)
    setValue('phase',                      r.Phase)
    setValue('allotmentDisplayStartDate',  toInput(r.AllotmentDisplayStartDateF))
    setValue('admissionStartDate',         toInput(r.AdmissionStartDateF))
    setValue('candidateAdmissionLastDate', toInput(r.CandidateAdmissionLastDateF))
    setValue('collegeAdmissionLastDate',   toInput(r.CollegeAdmissionLastDateF))
    setValue('systemAdmissionLastDate',    toInput(r.SystemAdmissionLastDateF))
    setValue('isCurrentPhase',             r.IsCurrentPhaseText === 'Yes' ? 1 : -1)
    setValue('isActive',                   r.IsActiveText === 'Active' ? 1 : 0)
    setEditId(r.PhaseID); setShowForm(true)
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
        <div className="l-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Manage Phase</span>
          <button type="button" className="btn-success-legacy" style={{ fontSize: '90%' }}
            onClick={() => { resetForm(); setShowForm(s => !s) }}>
            {showForm ? 'Cancel' : '+ Add Phase'}
          </button>
        </div>
        <div className="l-card-body">

          {showForm && (
            <form onSubmit={handleSubmit(d => saveMutation.mutate(d as Record<string, unknown>))}
              style={{ marginBottom: '24px', background: '#f8f9fa', padding: '16px', borderRadius: '4px' }}>
              <input type="hidden" {...register('phaseId', { valueAsNumber: true })} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label className="control-label">Phase Name <span className="required">*</span></label>
                  <input type="text" className="l-form-control" {...register('phase', { required: true })} />
                </div>
                <DT label="Allotment Display Start"  name="allotmentDisplayStartDate" />
                <DT label="Admission Start"          name="admissionStartDate" />
                <DT label="Candidate Last Date"      name="candidateAdmissionLastDate" />
                <DT label="College Last Date"        name="collegeAdmissionLastDate" />
                <DT label="System Last Date"         name="systemAdmissionLastDate" />
                <div className="form-group" style={{ flex: '1 1 140px' }}>
                  <label className="control-label">Is Current Phase</label>
                  <select className="l-form-control" {...register('isCurrentPhase', { valueAsNumber: true })}>
                    <option value={-1}>-- Select --</option>
                    <option value={1}>Yes</option>
                    <option value={0}>No</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: '1 1 120px' }}>
                  <label className="control-label">Is Active</label>
                  <select className="l-form-control" {...register('isActive', { valueAsNumber: true })}>
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '12px' }}>
                <button type="submit" className="btn-special" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving…' : editId ? 'Update' : 'Save'}
                </button>
                <button type="button" style={{ marginLeft: '8px' }} className="btn-outline-legacy" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table className="grid-view" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Sr.</th><th>Phase</th><th>Allotment Start</th>
                  <th>Admission Start</th><th>Candidate Last</th>
                  <th>Current?</th><th>Active?</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '16px' }}>Loading…</td></tr>
                  : rows.length === 0
                    ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '16px', color: '#888' }}>No phases found.</td></tr>
                    : rows.map((r, i) => (
                      <tr key={r.PhaseID}>
                        <td style={{ textAlign: 'center' }}>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{r.Phase}</td>
                        <td>{r.AllotmentDisplayStartDateF}</td>
                        <td>{r.AdmissionStartDateF}</td>
                        <td>{r.CandidateAdmissionLastDateF}</td>
                        <td style={{ textAlign: 'center' }}>{r.IsCurrentPhaseText}</td>
                        <td style={{ textAlign: 'center' }}>{r.IsActiveText}</td>
                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <button type="button" onClick={() => onEdit(r)}
                            style={{ color: '#0d6efd', background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px' }}>Edit</button>
                          <button type="button" onClick={() => setDeleteId(r.PhaseID)}
                            style={{ color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDialog open={deleteId !== null} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Phase" message="Delete this phase? This cannot be undone."
        confirmLabel="Delete" variant="danger" loading={deleteMutation.isPending} />
    </div>
  )
}
