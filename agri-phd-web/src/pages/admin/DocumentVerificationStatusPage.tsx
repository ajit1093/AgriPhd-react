import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'

/** Admin/CheckDocumentVerificationStatus.aspx */
export default function DocumentVerificationStatusPage() {
  const [appId, setAppId] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'doc-status', appId],
    queryFn: () => apiClient.get(`/candidates/${appId}/document-status`).then(r => r.data),
    enabled: submitted && appId.trim().length > 0,
    staleTime: 0,
  })

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); if (appId.trim()) setSubmitted(true) }

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card">
        <div className="l-card-header">Check Document Verification Status</div>
        <div className="l-card-body">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: '0 0 240px' }}>
              <label className="control-label">Application Form No. / Candidate ID</label>
              <input type="text" className="l-form-control" placeholder="Enter Application No."
                value={appId} onChange={e => { setAppId(e.target.value); setSubmitted(false) }} />
            </div>
            <button type="submit" className="btn-special" disabled={!appId.trim() || isLoading}>
              {isLoading ? 'Searching…' : 'Search'}
            </button>
          </form>

          {submitted && (
            isLoading ? <p style={{ textAlign: 'center' }}>Searching…</p>
            : !data || (Array.isArray(data) && data.length === 0)
              ? <div className="l-alert l-alert-warning">No document verification records found.</div>
              : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="grid-view" style={{ width: '100%' }}>
                    <thead>
                      <tr><th>Sr.</th><th style={{ textAlign: 'left' }}>Document Name</th><th>Uploaded</th><th>Verification Status</th><th>Comments</th></tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(data) ? data : [data]).map((d: Record<string, unknown>, i: number) => (
                        <tr key={i}>
                          <td style={{ textAlign: 'center' }}>{i + 1}</td>
                          <td style={{ textAlign: 'left' }}>{String(d.documentName ?? d.DocumentName ?? '—')}</td>
                          <td style={{ textAlign: 'center' }}>{String(d.isDocumentUploaded ?? d.IsDocumentUploaded ?? '—')}</td>
                          <td style={{ textAlign: 'center' }}>{String(d.documentVerificationStatus ?? d.DocumentVerificationStatus ?? '—')}</td>
                          <td>{String(d.documentVerificationComments ?? d.DocumentVerificationComments ?? '—')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
          )}
        </div>
      </div>
    </div>
  )
}
