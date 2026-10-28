import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/** Redirects to the unified GenerateReportPage with the correct report ID. */
export default function EVCCandidateListReportPage() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/reports/generate?report=evc-candidate-list', { replace: true })
  }, [navigate])
  return <div style={{ padding: '20px', textAlign: 'center' }}>Loading EVC Wise Candidate List…</div>
}
