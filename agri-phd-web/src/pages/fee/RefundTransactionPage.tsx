import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { feeApi } from '@/api/fee'

/**
 * Fee/RefundTransaction.aspx — Search by Application ID / Transaction ID then initiate refund
 */
export default function RefundTransactionPage() {
  const qc = useQueryClient()
  const [input, setInput]   = useState('')
  const [search, setSearch] = useState('')

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['fee', 'refundable', search],
    queryFn:  () => feeApi.getRefundable(search),
    enabled:  search.trim().length > 0,  // only fetch when user searches
    staleTime: 0,
  })

  const refundMut = useMutation({
    mutationFn: ({ id }: { id: string }) => feeApi.refund(id, '', 'Refund Initiated'),
    onSuccess: (r) => {
      if (r.success) {
        toast.success('Refund initiated successfully.')
        qc.invalidateQueries({ queryKey: ['fee', 'refundable'] })
      } else {
        toast.error('Refund failed.')
      }
    },
    onError: () => toast.error('Refund failed.'),
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) setSearch(input.trim())
  }

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card">
        <div className="l-card-header">Refund Transaction</div>
        <div className="l-card-body">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: '1 1 300px' }}>
              <label className="control-label">Search by Application ID / Transaction ID</label>
              <input type="text" className="l-form-control"
                placeholder="Enter Application ID or Transaction ID"
                value={input} onChange={e => setInput(e.target.value)} />
            </div>
            <button type="submit" className="btn-success-legacy" style={{ alignSelf: 'flex-end' }}
              disabled={!input.trim()}>
              Search
            </button>
          </form>

          <div style={{ overflowX: 'auto' }}>
            <table className="grid-view" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Transaction ID</th>
                  <th>Amount</th>
                  <th>Transaction Date</th>
                  <th>Payment Date</th>
                  <th>Bank Ref. No.</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: '16px' }}>Searching…</td></tr>
                ) : !search ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: '16px', color: '#888' }}>
                    Enter a search term and click Search.
                  </td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: '16px', color: '#888' }}>No records found.</td></tr>
                ) : rows.map((r, i) => (
                  <tr key={r.transactionId}>
                    <td style={{ textAlign: 'center' }}>{i + 1}</td>
                    <td>{r.transactionId}</td>
                    <td style={{ textAlign: 'right' }}>₹{r.feeAmount}</td>
                    <td>{r.transactionDate}</td>
                    <td>{r.paymentDate}</td>
                    <td>{r.bankReferenceNo}</td>
                    <td>{r.purpose}</td>
                    <td style={{ color: r.isPaid ? '#198754' : '#dc3545', fontWeight: 600 }}>
                      {r.isPaid ? 'Paid' : (r.paidStatus || 'Pending')}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button type="button" className="btn-special"
                        style={{ padding: '2px 8px', fontSize: '90%' }}
                        disabled={refundMut.isPending}
                        onClick={() => refundMut.mutate({ id: r.transactionId })}>
                        Initiate Refund
                      </button>
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
