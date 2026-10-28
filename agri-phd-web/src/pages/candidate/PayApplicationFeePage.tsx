import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { appFormApi } from '@/api/applicationForm'
import { CANDIDATE_ROUTES } from '@/router/routes'
import { WizardHeader } from '@/components/candidate/WizardHeader'

/**
 * P2-D-10 / P6-THEME-15 — Candidate/PayApplicationFee.aspx → PayApplicationFeePage
 * Modernized Academic Ph.D. Admissions Theme.
 *
 * Application fee invoice & payment step.
 */
export default function PayApplicationFeePage() {
  const navigate = useNavigate()

  const { data: feeData, isLoading } = useQuery({
    queryKey: ['application-fee'],
    queryFn: appFormApi.getApplicationFeeDetails,
  })

  const markDoneMut = useMutation({
    mutationFn: appFormApi.markFeeDone,
    onSuccess: (r) => {
      if (r.success) {
        toast.success('Fee marked as paid. Proceeding to summary.')
        navigate(CANDIDATE_ROUTES.formSummary)
      } else {
        toast.error(r.message ?? 'Payment confirmation failed.')
      }
    },
  })

  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        <span>Loading Application Fee Details…</span>
      </div>
    )
  }

  const feeAmount = parseInt(feeData?.feeAmount ?? '0')
  const isPaid    = feeData?.paidStatus === 'Paid'

  return (
    <div className="w-full max-w-[1680px] mx-auto space-y-6">
      <WizardHeader currentStep={9} />

      <div className="l-card bg-white border border-slate-200/90 rounded-xl shadow-card overflow-hidden">
        {/* Card Header */}
        <div className="l-card-header bg-gradient-to-r from-academic-navy to-primary-900 text-white font-semibold text-base py-3.5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-amber-300">💳</span>
            <span>Pay Application Fee (Step 9 of 10)</span>
          </div>
          <span className="text-xs text-white/80 font-normal hidden sm:inline">
            Non-Refundable Processing Fee
          </span>
        </div>

        <div className="l-card-body p-6 space-y-6">

          {/* Invoice Summary Card */}
          <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 block">
                  Payment Purpose
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Ph.D. Entrance &amp; Admission Processing Fee 2026-27
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    isPaid
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
                >
                  {feeData?.paidStatus ?? 'Pending'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 font-medium block">Total Payable Fee</span>
                <span className="text-2xl font-bold font-mono text-primary-950 mt-1 block">
                  {feeAmount === 0 ? 'EXEMPT (₹0)' : `₹${feeData?.feeAmount}`}
                </span>
                <span className="text-2xs text-slate-400 mt-1 block">As per category entitlement</span>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col justify-center">
                <span className="text-xs text-slate-500 font-medium block">Payment Security</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg">🔒</span>
                  <span className="text-xs font-semibold text-slate-700">
                    256-Bit SSL Encrypted Gateway
                  </span>
                </div>
                <span className="text-2xs text-slate-400 mt-1">Supports UPI, Net Banking &amp; Debit/Credit Cards</span>
              </div>
            </div>
          </div>

          {/* Conditional state actions */}
          {isPaid ? (
            <div className="l-alert l-alert-success bg-emerald-50 border-l-4 border-emerald-500 text-emerald-900 p-4 rounded-r-lg space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-emerald-700 text-lg">✓</span>
                <span className="font-semibold text-sm">
                  Application fee has already been paid and verified.
                </span>
              </div>
              <p className="text-xs text-emerald-800">
                You can now proceed to the final step to review your entire application details and lock your form for submission.
              </p>
            </div>
          ) : feeAmount === 0 ? (
            <div className="bg-sky-50 border-l-4 border-sky-500 text-sky-900 p-4 rounded-r-lg space-y-2 text-xs">
              <p className="font-semibold text-sm text-sky-950">Fee Exemption Applied:</p>
              <p>
                Based on your social category or reservation criteria, you are fully exempt from the admission application fee. Click below to continue.
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-4 rounded-r-lg space-y-2 text-xs">
              <p className="font-semibold text-sm text-amber-950">Online Fee Payment Note:</p>
              <p>
                Please ensure you have sufficient balance before initiating transaction. Do not refresh or press back during transaction processing.
              </p>
            </div>
          )}

          {/* Navigation Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(CANDIDATE_ROUTES.uploadDocuments)}
              className="btn-outline-legacy inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors cursor-pointer"
            >
              <span>&lt;&lt;&lt; Back to Documents</span>
            </button>

            {isPaid ? (
              <button
                type="button"
                className="btn-success-legacy inline-flex items-center gap-2 bg-agriculture hover:bg-agriculture-600 text-white font-medium px-6 py-2.5 rounded-md shadow-sm transition-all hover:shadow cursor-pointer text-sm"
                onClick={() => navigate(CANDIDATE_ROUTES.formSummary)}
              >
                <span>Proceed to Summary</span>
                <span>&gt;&gt;&gt;</span>
              </button>
            ) : feeAmount === 0 ? (
              <button
                type="button"
                className="btn-special inline-flex items-center gap-2 bg-academic-navy hover:bg-primary-900 text-white font-medium px-6 py-2.5 rounded-md shadow-sm transition-all hover:shadow cursor-pointer disabled:opacity-50 text-sm"
                disabled={markDoneMut.isPending}
                onClick={() => markDoneMut.mutate()}
              >
                {markDoneMut.isPending ? 'Processing…' : 'Proceed (Fee Exempt) >>>'}
              </button>
            ) : (
              <button
                type="button"
                className="btn-special inline-flex items-center gap-2 bg-academic-navy hover:bg-primary-900 text-white font-medium px-6 py-2.5 rounded-md shadow-sm transition-all hover:shadow cursor-pointer disabled:opacity-50 text-sm"
                disabled={markDoneMut.isPending}
                onClick={() => markDoneMut.mutate()}
              >
                {markDoneMut.isPending ? 'Connecting Gateway…' : 'Pay Application Fee >>>'}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
