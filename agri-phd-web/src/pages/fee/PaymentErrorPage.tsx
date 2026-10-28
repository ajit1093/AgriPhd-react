import { Link } from 'react-router-dom'
import { CANDIDATE_ROUTES } from '@/router/routes'

/** P2-F-05 — Fee/PaymentError.aspx */
export default function PaymentErrorPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
      <div className="l-card" style={{ maxWidth: '500px', textAlign: 'center' }}>
        <div className="l-card-header">Payment Error</div>
        <div className="l-card-body">
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
          <h3 style={{ color: '#d97706' }}>Payment Error</h3>
          <p style={{ color: '#666', marginBottom: '16px' }}>
            An error occurred while processing your payment. Your account has not been charged.
            Please try again after some time.
          </p>
          <Link to={CANDIDATE_ROUTES.payFee} className="btn-special">Try Again</Link>
        </div>
      </div>
    </div>
  )
}
