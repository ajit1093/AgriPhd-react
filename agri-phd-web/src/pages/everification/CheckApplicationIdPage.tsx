import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '@/api/client'

/**
 * P2-G-03 — EVerification/CheckApplicationID.aspx
 * EVC can look up any candidate by Application ID.
 * API: GET /api/v1/candidates/lookup?applicationId=
 */
export default function CheckApplicationIdPage() {
  const navigate  = useNavigate()
  const [appId, setAppId]   = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!appId.trim()) { setError('Please enter an Application ID.'); return }
    setLoading(true); setError('')
    try {
      const r = await apiClient.get<{ candidateId: number }>(`/candidates/lookup?applicationId=${appId.trim()}`)
      if (r.data?.candidateId) {
        navigate(`/everification/verify/${r.data.candidateId}`)
      } else {
        setError('No candidate found for this Application ID.')
      }
    } catch {
      setError('Candidate not found or not assigned to your EVC.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card" style={{ maxWidth: '500px' }}>
        <div className="l-card-header">Check Application ID</div>
        <div className="l-card-body">
          <div className="form-group">
            <label className="control-label">Application ID <span className="required">*</span></label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" className="l-form-control" style={{ flex: 1 }}
                placeholder="Enter Application Form No."
                value={appId} onChange={e => setAppId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()} />
              <button type="button" className="btn-special" disabled={loading} onClick={handleSearch}>
                {loading ? 'Searching…' : 'Search'}
              </button>
            </div>
            {error && <span className="required" style={{ fontSize: '90%', display: 'block', marginTop: '4px' }}>{error}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
