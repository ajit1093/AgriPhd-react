import { Link, useLocation } from 'react-router-dom'
import { CANDIDATE_ROUTES } from '@/router/routes'

/** P2-F-04 — Fee/PaymentFailed.aspx */
export default function PaymentFailedPage() {
  const location = useLocation()
  const reason = new URLSearchParams(location.search).get('reason') ?? 'Payment was not completed.'

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
      <div className="l-card" style={{ maxWidth: '500px', textAlign: 'center' }}>
        <div className="l-card-header">Payment Failed</div>
        <div className="l-card-body">
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>❌</div>
          <h3 style={{ color: '#dc3545' }}>Payment Failed</h3>
          <p style={{ color: '#666', marginBottom: '16px' }}>{reason}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to={CANDIDATE_ROUTES.payFee} className="btn-special">Try Again</Link>
            <Link to={CANDIDATE_ROUTES.dashboard} className="btn-success-legacy">Back to Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
