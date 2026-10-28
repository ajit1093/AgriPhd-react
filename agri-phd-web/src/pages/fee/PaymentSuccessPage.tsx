import { Link, useLocation } from 'react-router-dom'
import { CANDIDATE_ROUTES } from '@/router/routes'

/** P2-F-03 — Fee/PaymentSuccess.aspx */
export default function PaymentSuccessPage() {
  const location = useLocation()
  const txId = new URLSearchParams(location.search).get('transactionId') ?? ''

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
      <div className="l-card" style={{ maxWidth: '500px', textAlign: 'center' }}>
        <div className="l-card-header">Payment Successful</div>
        <div className="l-card-body">
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
          <h3 style={{ color: '#198754' }}>Payment Successful!</h3>
          <p style={{ color: '#666', marginBottom: '16px' }}>
            Your application fee has been paid successfully.
            {txId && <><br />Transaction ID: <strong>{txId}</strong></>}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {txId && (
              <a href={`/api/v1/fee/receipt/${txId}`} target="_blank" rel="noreferrer" className="btn-success-legacy">
                Download Receipt
              </a>
            )}
            <Link to={CANDIDATE_ROUTES.formSummary} className="btn-special">
              Continue to Application Form
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
