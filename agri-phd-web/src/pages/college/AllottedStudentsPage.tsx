import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { admissionApi } from '@/api/admission'
import { useMasterData } from '@/hooks/useMasterData'

/**
 * P2-H-06 — Admission/AdmissionAllotedStudent.aspx — College role
 * SP: Admission_GetAllotedStudentList(@Faculty, @SubjectID, @PhaseID, @CollegeID, @ReportStatus)
 */
const REPORT_STATUS_OPTIONS = [
  { value: '', label: '-- All --' }, { value: 'Y', label: 'Confirmed' },
  { value: 'R', label: 'Rejected' }, { value: 'C', label: 'Cancelled' },
]

export default function AllottedStudentsPage() {
  const [filters, setFilters] = useState({ faculty: 0, subjectId: 0, phaseId: 0, reportStatus: '' })
  const [submitted, setSubmitted] = useState(true)

  const { data: faculties } = useMasterData('faculty')
  const { data: phases    } = useMasterData('phase')

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['allotted-students', filters],
    queryFn: () => admissionApi.getAllottedStudents(filters),
    enabled: submitted,
  })

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card">
        <div className="l-card-header">Allotted Students List</div>
        <div className="l-card-body">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', alignItems: 'flex-end' }}>
            {[
              { label: 'Faculty', field: 'faculty', opts: faculties },
              { label: 'Phase',   field: 'phaseId', opts: phases },
            ].map(({ label, field, opts }) => (
              <div key={field} className="form-group" style={{ flex: '1 1 160px' }}>
                <label className="control-label">{label}</label>
                <select className="l-form-control"
                  value={(filters as Record<string, number | string>)[field]}
                  onChange={e => setFilters(f => ({ ...f, [field]: Number(e.target.value) }))}>
                  <option value={0}>-- All --</option>
                  {(opts ?? []).map(o => <option key={o.value} value={Number(o.value)}>{o.text}</option>)}
                </select>
              </div>
            ))}
            <div className="form-group" style={{ flex: '1 1 180px' }}>
              <label className="control-label">Report Status</label>
              <select className="l-form-control" value={filters.reportStatus}
                onChange={e => setFilters(f => ({ ...f, reportStatus: e.target.value }))}>
                {REPORT_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <button type="button" className="btn-success-legacy" onClick={() => setSubmitted(true)} disabled={isLoading}>Search</button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="grid-view" style={{ width: '100%' }}>
              <thead><tr><th>Sr. No.</th><th>Application No</th><th style={{ textAlign: 'left' }}>Candidate Name</th><th>Category</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {isLoading ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '16px' }}>Loading…</td></tr>
                : rows.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '16px', color: '#888' }}>No students found.</td></tr>
                : rows.map((r, i) => {
                    const row = r as Record<string, unknown>
                    return (
                      <tr key={i}>
                        <td style={{ textAlign: 'center' }}>{i + 1}</td>
                        <td>{String(row['ApplicationFormNo'] ?? '')}</td>
                        <td style={{ textAlign: 'left' }}>{String(row['CandidateName'] ?? '')}</td>
                        <td>{String(row['Category'] ?? '')}</td>
                        <td>{String(row['ReportingStatus'] ?? '')}</td>
                        <td style={{ textAlign: 'center' }}>
                          <a href={`/college/confirm-admission/${row['CandidateID']}`} style={{ color: '#0d6efd', fontSize: '90%' }}>Confirm/Reject</a>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
