import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'

/** Admin/CheckPGCETApplicationNo.aspx — lookup CET candidate by application number */
export default function CheckPgcetPage() {
  const [appNo, setAppNo] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'pgcet', appNo],
    queryFn: () => apiClient.get(`/master/pgcet-candidate?applicationNo=${appNo}`).then(r => r.data),
    enabled: submitted && appNo.trim().length > 0,
    staleTime: 0,
  })

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); if (appNo.trim()) setSubmitted(true) }
  const S = (k: string) => String(data?.[k] ?? '—')

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card">
        <div className="l-card-header">Check PGCET Application No.</div>
        <div className="l-card-body">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: '0 0 240px' }}>
              <label className="control-label">PGCET Application Form No. <span className="required">*</span></label>
              <input type="text" className="l-form-control" placeholder="Enter Application No."
                value={appNo} onChange={e => { setAppNo(e.target.value); setSubmitted(false) }} />
            </div>
            <button type="submit" className="btn-special" disabled={!appNo.trim() || isLoading}>
              {isLoading ? 'Searching…' : 'Search'}
            </button>
          </form>

          {submitted && (
            isLoading ? <p style={{ textAlign: 'center' }}>Searching…</p>
            : !data ? <div className="l-alert l-alert-warning">No record found for Application No.: <strong>{appNo}</strong></div>
            : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                {[
                  ['Application Form No.', S('applicationFormNo')],
                  ['Candidate Name', S('candidateName')],
                  ['Date of Birth', S('birthDate')],
                  ['Mobile No.', S('mobileNo')],
                ].map(([label, value]) => (
                  <div key={label} style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                    <div style={{ fontSize: '80%', color: '#6c757d' }}>{label}</div>
                    <div style={{ fontWeight: 600 }}>{value}</div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
