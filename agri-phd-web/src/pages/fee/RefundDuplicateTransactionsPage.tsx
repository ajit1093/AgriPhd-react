import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { apiClient } from '@/api/client'

/**
 * Fee/RefundDuplicateTransactions.aspx — exact parity
 * Title: "Duplicate Transactions List"
 * Columns: Sr.No | Refund (button) | Application ID | Payee Name |
 *          Previous Category | Final Category | Purpose | Transaction Status |
 *          Transaction ID | Amount (₹) | Payment Date | Bank Ref. No.
 * SP: Fee_GetDuplicateTransactionsList (no params)
 * "Initiate Refund" button calls Fee_UpdateRefundStatus with CommandName=InitiateRefund
 */

interface DupRow {
  TransactionID: string
  PayeeApplicationID: string
  PayeeName: string
  PreviousCategory: string
  FinalCategory: string
  Purpose: string
  TransactionStatus: string
  FeeAmount: string
  PaymentDate: string
  BankReferenceNo: string
  IsEligibleForRefund: boolean | string
  IsRefundInitiated: boolean | string
}

export default function RefundDuplicateTransactionsPage() {
  const qc = useQueryClient()

  const { data: rows = [], isLoading } = useQuery<DupRow[]>({
    queryKey: ['fee', 'duplicate-transactions'],
    queryFn:  () => apiClient.get('/fee/duplicate-transactions').then(r => r.data),
    staleTime: 0,
  })

  const refundMut = useMutation({
    mutationFn: (transactionId: string) =>
      apiClient.post(`/fee/initiate-refund/${transactionId}`).then(r => r.data),
    onSuccess: (d) => {
      if (d.success) {
        toast.success('Refund initiated successfully.')
        qc.invalidateQueries({ queryKey: ['fee', 'duplicate-transactions'] })
      } else toast.error(d.message ?? 'Refund failed.')
    },
    onError: () => toast.error('Refund initiation failed.'),
  })

  const isEligible = (r: DupRow) =>
    r.IsEligibleForRefund === true ||
    String(r.IsEligibleForRefund).toLowerCase() === 'true' ||
    String(r.IsEligibleForRefund) === '1'

  const isInitiated = (r: DupRow) =>
    r.IsRefundInitiated === true ||
    String(r.IsRefundInitiated).toLowerCase() === 'true' ||
    String(r.IsRefundInitiated) === '1'

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card">
        <div className="l-card-header">Duplicate Transactions List</div>
        <div className="l-card-body" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="grid-view" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '4%' }}>Sr. No.</th>
                  <th style={{ width: '10%' }}>Refund</th>
                  <th style={{ width: '9%' }}>Application ID</th>
                  <th style={{ textAlign: 'left', width: '16%' }}>Payee Name</th>
                  <th style={{ width: '8%' }}>Previous Category</th>
                  <th style={{ width: '8%' }}>Final Category</th>
                  <th style={{ width: '12%' }}>Purpose</th>
                  <th style={{ width: '8%' }}>Transaction Status</th>
                  <th style={{ width: '11%' }}>Transaction ID</th>
                  <th style={{ width: '7%' }}>Amount (₹)</th>
                  <th style={{ width: '10%' }}>Payment Date</th>
                  <th style={{ width: '7%' }}>Bank Ref. No.</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? <tr><td colSpan={12} style={{ textAlign: 'center', padding: '16px' }}>Loading…</td></tr>
                  : rows.length === 0
                    ? <tr><td colSpan={12} style={{ textAlign: 'center', padding: '16px', color: '#888' }}>No duplicate transactions found.</td></tr>
                    : rows.map((r, i) => (
                      <tr key={r.TransactionID + i}>
                        <td style={{ textAlign: 'center' }}>{i + 1}.</td>
                        <td style={{ textAlign: 'center' }}>
                          {isEligible(r) && !isInitiated(r) ? (
                            <button type="button" className="btn-special"
                              style={{ padding: '2px 8px', fontSize: '85%' }}
                              disabled={refundMut.isPending}
                              onClick={() => refundMut.mutate(r.TransactionID)}>
                              Initiate Refund
                            </button>
                          ) : isInitiated(r) ? (
                            <span style={{ color: '#198754', fontSize: '85%', fontWeight: 600 }}>✓ Initiated</span>
                          ) : null}
                        </td>
                        <td style={{ textAlign: 'center' }}>{r.PayeeApplicationID}</td>
                        <td style={{ textAlign: 'left', fontWeight: 600 }}>{r.PayeeName}</td>
                        <td style={{ textAlign: 'center' }}>{r.PreviousCategory}</td>
                        <td style={{ textAlign: 'center' }}>{r.FinalCategory}</td>
                        <td>{r.Purpose}</td>
                        <td style={{ textAlign: 'center', color: r.TransactionStatus === 'Paid' ? '#198754' : '#dc3545', fontWeight: 600 }}>
                          {r.TransactionStatus}
                        </td>
                        <td>{r.TransactionID}</td>
                        <td style={{ textAlign: 'right' }}>₹{r.FeeAmount}</td>
                        <td>{r.PaymentDate}</td>
                        <td style={{ fontSize: '80%' }}>{r.BankReferenceNo || '—'}</td>
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
