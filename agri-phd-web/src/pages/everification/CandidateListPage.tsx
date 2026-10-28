import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { evApi, type EVCandidateRow } from '@/api/everification'

/**
 * P2-G-01 — EVerification/CandidateListForEVerification.aspx
 * SP: EV_GetCandidateListForEVerification(@ApplicationStatus, @UserLoginID)
 * Filter: -1=All, N=Not Verified, H=Hold, R=Partially, P=Re-Uploaded, F=Fully Verified
 * Columns: Verify | LoginID | Application Form No | Candidate Name | Category | Assigned To
 */
const STATUS_OPTIONS = [
  { value: '-1', label: '-- All --' },
  { value: 'N',  label: 'Not Verified' },
  { value: 'H',  label: 'On Hold' },
  { value: 'R',  label: 'Partially Verified' },
  { value: 'P',  label: 'Re-Uploaded Partially Verified' },
  { value: 'F',  label: 'Fully Verified' },
]

export default function CandidateListPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('-1')
  const [applied, setApplied] = useState('-1')

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['evc', 'candidates', applied],
    queryFn: () => evApi.getCandidates(applied),
  })

  return (
    <div className="w-full max-w-[1720px] mx-auto py-2">
      <div className="l-card shadow-sm border border-slate-200/80 rounded-xl overflow-hidden bg-white">
        <div className="l-card-header bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <span className="text-lg font-bold tracking-tight">Candidate List For E-Verification</span>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-slate-300">
            Total Records: <strong className="text-white">{rows.length}</strong>
          </span>
        </div>

        <div className="p-6">
          {/* Filter Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[280px]">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Application Status Filter
              </label>
              <select
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                value={filter}
                onChange={e => setFilter(e.target.value)}
              >
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <button
              type="button"
              className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-lg shadow-sm transition-all duration-150 flex items-center gap-2"
              onClick={() => setApplied(filter)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Filter Candidates
            </button>
          </div>

          {/* Candidates Grid */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[650px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/90 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <th className="py-3 px-4 text-center w-28">Action</th>
                  <th className="py-3 px-4 text-center">Login ID</th>
                  <th className="py-3 px-4 text-center">Application Form No</th>
                  <th className="py-3 px-4 text-left">Candidate Name</th>
                  <th className="py-3 px-4 text-center">Category</th>
                  <th className="py-3 px-4 text-center">Assigned Scrutinizer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent mb-2"></div>
                      <div>Loading candidates verification queue…</div>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <p className="text-base font-medium">No candidates found for the selected status filter.</p>
                    </td>
                  </tr>
                ) : rows.map((r: EVCandidateRow) => (
                  <tr key={r.candidateId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md shadow-sm transition-colors"
                        onClick={() => navigate(`/everification/verify/${r.candidateId}`)}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Verify
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-medium text-slate-700">{r.applicationId}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">{r.applicationFormNo}</td>
                    <td className="py-3 px-4 text-left font-semibold text-slate-900">{r.candidateName}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {r.category || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600">{r.assignedTo || '—'}</td>
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
