import { useQuery } from '@tanstack/react-query'
import { feeApi } from '@/api/fee'

/** P2-F-07 — Fee/CheckFailedTransactions.aspx — Admin only */
export default function CheckFailedTransactionsPage() {
  const { data: rows = [], isLoading } = useQuery({ queryKey: ['fee', 'failed'], queryFn: feeApi.getFailedTransactions })

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card">
        <div className="l-card-header">Check Failed Transactions</div>
        <div className="l-card-body" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="grid-view" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Sr. No.</th><th>Transaction ID</th><th>Amount</th>
                  <th>Transaction Date</th><th>Bank Reference No.</th><th>Purpose</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '16px' }}>Loading…</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '16px', color: '#888' }}>No failed transactions found.</td></tr>
                ) : rows.map((r, i) => (
                  <tr key={r.transactionId}>
                    <td style={{ textAlign: 'center' }}>{i + 1}</td>
                    <td>{r.transactionId}</td>
                    <td style={{ textAlign: 'right' }}>₹{r.feeAmount}</td>
                    <td>{r.transactionDate}</td>
                    <td>{r.bankReferenceNo}</td>
                    <td>{r.purpose}</td>
                    <td style={{ color: '#dc3545' }}>{r.paidStatus || 'Failed'}</td>
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
