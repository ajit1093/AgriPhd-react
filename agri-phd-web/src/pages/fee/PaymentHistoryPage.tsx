import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { feeApi } from '@/api/fee'

/**
 * Fee/PaymentHistory.aspx
 * Accepts optional ?candidateId= for admin viewing a specific candidate's history.
 * Without param uses logged-in user's own history.
 */
export default function PaymentHistoryPage() {
  const [searchParams] = useSearchParams()
  const candidateId = Number(searchParams.get('candidateId') ?? 0)

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['fee', 'history', candidateId],
    queryFn:  () => feeApi.getHistory(candidateId),
  })

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card">
        <div className="l-card-header">Payment History</div>
        <div className="l-card-body" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="grid-view" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Transaction ID</th>
                  <th>Amount</th>
                  <th>Transaction Date</th>
                  <th>Payment Date</th>
                  <th>Bank Reference No.</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: '16px' }}>Loading…</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: '16px', color: '#888' }}>No payment records found.</td></tr>
                ) : rows.map((r, i) => (
                  <tr key={r.transactionId + i}>
                    <td style={{ textAlign: 'center' }}>{i + 1}</td>
                    <td>{r.transactionId}</td>
                    <td style={{ textAlign: 'right' }}>₹{r.feeAmount}</td>
                    <td>{r.transactionDate}</td>
                    <td>{r.paymentDate || '—'}</td>
                    <td>{r.bankReferenceNo || '—'}</td>
                    <td>{r.purpose}</td>
                    <td style={{ textAlign: 'center', color: r.isPaid ? '#198754' : '#dc3545', fontWeight: 600 }}>
                      {r.isPaid ? 'Paid' : 'Pending'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {r.isPaid && (
                        <a href={`/api/v1/fee/receipt/${r.transactionId}`} target="_blank" rel="noreferrer"
                          style={{ color: '#0d6efd', fontSize: '90%' }}>Print Receipt</a>
                      )}
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
