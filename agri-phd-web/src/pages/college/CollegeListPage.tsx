import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { collegeApi } from '@/api/college'
import { useMasterData } from '@/hooks/useMasterData'

/**
 * P2-I-01 — College/CollegeList.aspx
 * SP: College_GetCollegeList(@FacultyID, @DistrictID, @CollegeCode, @CollegeName)
 * Columns: Sr.No | College Code | College Name | Faculty | College Subjects | College Address |
 *          District | Taluka | University | Nodal Officer | Phone | Email | Intake
 */
export default function CollegeListPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ facultyId: 0, districtId: 0, collegeCode: '', collegeName: '' })
  const [applied, setApplied] = useState(filters)

  const { data: faculties }  = useMasterData('faculty')
  const { data: districts }  = useMasterData('district')

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['college-list', applied],
    queryFn: () => collegeApi.list(applied),
  })

  const S = (r: Record<string, unknown>, k: string) => String(r[k] ?? '')

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card">
        <div className="l-card-header">College List</div>
        <div className="l-card-body">
          {/* Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: '1 1 160px' }}>
              <label className="control-label">Faculty</label>
              <select className="l-form-control" value={filters.facultyId}
                onChange={e => setFilters(f => ({ ...f, facultyId: Number(e.target.value) }))}>
                <option value={0}>-- All --</option>
                {(faculties ?? []).map(f => <option key={f.value} value={Number(f.value)}>{f.text}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: '1 1 160px' }}>
              <label className="control-label">District</label>
              <select className="l-form-control" value={filters.districtId}
                onChange={e => setFilters(f => ({ ...f, districtId: Number(e.target.value) }))}>
                <option value={0}>-- All --</option>
                {(districts ?? []).map(d => <option key={d.value} value={Number(d.value)}>{d.text}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: '1 1 160px' }}>
              <label className="control-label">College Code</label>
              <input type="text" className="l-form-control" value={filters.collegeCode}
                onChange={e => setFilters(f => ({ ...f, collegeCode: e.target.value }))} />
            </div>
            <div className="form-group" style={{ flex: '1 1 200px' }}>
              <label className="control-label">College Name</label>
              <input type="text" className="l-form-control" value={filters.collegeName}
                onChange={e => setFilters(f => ({ ...f, collegeName: e.target.value }))} />
            </div>
            <button type="button" className="btn-success-legacy" onClick={() => setApplied(filters)} disabled={isLoading}>Search</button>
          </div>

          {/* Grid */}
          <div style={{ overflowX: 'auto' }}>
            <table className="grid-view" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>College Code</th>
                  <th style={{ textAlign: 'left' }}>College Name</th>
                  <th>Faculty</th>
                  <th>District</th>
                  <th>Intake</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '16px' }}>Loading…</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '16px', color: '#888' }}>No colleges found.</td></tr>
                ) : rows.map((r, i) => (
                  <tr key={i}>
                    <td style={{ textAlign: 'center' }}>{i + 1}</td>
                    <td>{S(r, 'CollegeCode')}</td>
                    <td style={{ textAlign: 'left' }}>{S(r, 'CollegeName')}</td>
                    <td>{S(r, 'Faculty')}</td>
                    <td>{S(r, 'District')}</td>
                    <td style={{ textAlign: 'center' }}>{S(r, 'Intake')}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button type="button" style={{ color: '#198754', background: 'none', border: 'none', cursor: 'pointer', fontSize: '90%' }}
                        onClick={() => navigate(`/college/edit/${S(r, 'CollegeID')}`)}>Edit</button>
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
