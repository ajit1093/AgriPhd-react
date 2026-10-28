import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { appFormApi } from '@/api/applicationForm'

/**
 * P2-D-13 / P6-THEME-12 — Candidate/ApplicationFormUnlock.aspx → ApplicationFormUnlockPage
 * Admin/Super Admin command action: unlock a locked application form for candidate editing.
 */
export default function ApplicationFormUnlockPage() {
  const [confirmed, setConfirmed] = useState(false)

  const unlockMut = useMutation({
    mutationFn: appFormApi.unlock,
    onSuccess: (r) => {
      if (r.success) {
        toast.success('Application form unlocked successfully.')
        setConfirmed(false)
      } else {
        toast.error(r.message ?? 'Unlock failed. Please try again.')
      }
    },
    onError: () => toast.error('An error occurred during unlock request. Please try again.'),
  })

  return (
    <div className="w-full max-w-xl mx-auto py-4 sm:py-8">
      <div className="l-card bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden">
        {/* Card Header */}
        <div className="bg-[#0B1D33] text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl shadow-2xs text-amber-300">
              🔓
            </span>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                Unlock Candidate Application Form
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Administrative permission to allow form edits post confirmation
              </p>
            </div>
          </div>
          <span className="text-2xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full">
            Admin Action
          </span>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 bg-white space-y-6">
          {/* Warning Banner */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs sm:text-sm text-amber-900 flex items-start gap-3">
            <span className="text-xl shrink-0">⚠️</span>
            <div className="space-y-1">
              <strong className="block font-bold">Important Administrative Notice:</strong>
              <p className="text-xs text-amber-800 leading-relaxed">
                Unlocking this application form will restore edit permissions to the candidate. All revisions made following an unlock require re-verification by the assigned E-Verification Center (EVC).
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={e => setConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
              />
              <span className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                I hereby confirm that I possess authorized administrative clearance to unlock this application form. I understand that merit position recomputation may be impacted.
              </span>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="button"
              className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-rose-400/30"
              disabled={!confirmed || unlockMut.isPending}
              onClick={() => unlockMut.mutate()}
            >
              {unlockMut.isPending ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Unlocking Application Form…</span>
                </>
              ) : (
                <>
                  <span>🔓</span>
                  <span>Confirm &amp; Unlock Application Form</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
