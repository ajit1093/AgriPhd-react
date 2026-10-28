import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'

/** P2-J-03 — University/UniversityRegisteredCandidates.aspx — SpotRound_GetRegisteredCandidates */
export default function RegisteredCandidatesPage() {
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['spot-round-registered'],
    queryFn: () => apiClient.get<Record<string, unknown>[]>('/university/spot-round/registered-candidates').then(r => r.data),
  })
  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card">
        <div className="l-card-header">Spot Round Registered Candidates</div>
        <div className="l-card-body" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="grid-view" style={{ width: '100%' }}>
              <thead><tr><th>Sr. No.</th><th>Application No</th><th style={{ textAlign: 'left' }}>Candidate Name</th><th>Category</th><th>Status</th></tr></thead>
              <tbody>
                {isLoading ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '16px' }}>Loading…</td></tr>
                : rows.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '16px', color: '#888' }}>No candidates registered.</td></tr>
                : rows.map((r, i) => (
                  <tr key={i}>
                    <td style={{ textAlign: 'center' }}>{i + 1}</td>
                    <td>{String(r['ApplicationFormNo'] ?? '')}</td>
                    <td style={{ textAlign: 'left' }}>{String(r['CandidateName'] ?? '')}</td>
                    <td>{String(r['Category'] ?? '')}</td>
                    <td>{String(r['Status'] ?? '')}</td>
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
