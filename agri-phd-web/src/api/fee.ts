import { apiClient } from './client'

export interface FeeHistoryRow {
  transactionId: string
  feeAmount: string
  transactionDate: string
  paymentDate: string
  bankReferenceNo: string
  purpose: string
  isPaid: boolean
  paidStatus: string
}

export const feeApi = {
  getHistory:            (candidateId = 0) => apiClient.get<FeeHistoryRow[]>(`/fee/history${candidateId > 0 ? `?candidateId=${candidateId}` : ''}`).then(r => r.data),
  getFailedTransactions: ()           => apiClient.get<FeeHistoryRow[]>('/fee/failed-transactions').then(r => r.data),
  getRefundable:         (input = '') => apiClient.get<FeeHistoryRow[]>(`/fee/refundable?input=${encodeURIComponent(input)}`).then(r => r.data),
  refund: (transactionId: string, refundId: string, status: string) =>
    apiClient.post<{ success: boolean }>(`/fee/refund/${transactionId}`, { refundId, status }).then(r => r.data),
}
