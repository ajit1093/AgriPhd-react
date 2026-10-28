import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { collegeApi } from '@/api/college'

/** P2-I-03 — College/CollegeSummary.aspx — SP: College_GetCollegeSummary(@CollegeID) */
export default function CollegeSummaryPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useQuery({
    queryKey: ['college-summary', id],
    queryFn: () => collegeApi.getSummary(parseInt(id ?? '0')),
    enabled: !!id,
  })
  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card">
        <div className="l-card-header">College Summary</div>
        <div className="l-card-body">
          {isLoading ? <p>Loading…</p> : (
            data ? Object.entries(data).map(([k, v]) => (
              <div key={k} className="user-details" style={{ marginBottom: '4px' }}>
                <span className="label-col">{k}</span>
                <span className="value-col">{String(v ?? '—')}</span>
              </div>
            )) : <p style={{ color: '#888' }}>No summary data available.</p>
          )}
        </div>
      </div>
    </div>
  )
}
