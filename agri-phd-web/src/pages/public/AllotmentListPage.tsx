import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { collegeApi } from '@/api/college'
import { useMasterData, useMasterColleges } from '@/hooks/useMasterData'
import type { AllotmentListItem } from '@/types/college'

/**
 * P2-A-10 / P6-THEME-11 — Public/AllotmentList.aspx → AllotmentListPage
 * Official Ph.D. Centralized Allotment List for all agricultural faculties and colleges.
 */
export default function AllotmentListPage() {
  const [facultyId, setFacultyId] = useState(0)
  const [filters, setFilters]     = useState({ collegeId: 0, phaseId: 0 })
  const [submitted, setSubmitted] = useState(false)

  const { data: phases, isLoading: isLoadingPhases }       = useMasterData('phase')
  const { data: faculties, isLoading: isLoadingFaculties } = useMasterData('faculty')
  const { data: colleges, isLoading: isLoadingColleges }   = useMasterColleges(facultyId || undefined)

  const { data, isLoading } = useQuery({
    queryKey: ['allotment', 'list', filters],
    queryFn:  () => collegeApi.getAllotmentList(filters),
    enabled:  submitted,
  })

  return (
    <div className="w-full space-y-6 py-2 sm:py-4">
      {/* Filter Card */}
      <div className="l-card bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden">
        {/* Card Header */}
        <div className="bg-[#0B1D33] text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-xl shadow-2xs">
              🎓
            </span>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                Ph.D. Centralized Allotment List
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Official centralized CAP round seat allotment results
              </p>
            </div>
          </div>
          <span className="text-2xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
            MCAER Allotment
          </span>
        </div>

        <div className="p-5 sm:p-6 bg-white space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Round */}
            <div className="md:col-span-4">
              <label htmlFor="round-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Admission Round <span className="text-rose-600 font-extrabold">*</span>
              </label>
              <select
                id="round-select"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all shadow-2xs cursor-pointer bg-white"
                value={filters.phaseId}
                onChange={e => {
                  setFilters(f => ({ ...f, phaseId: Number(e.target.value) }))
                  setSubmitted(false)
                }}
              >
                <option value={0}>{isLoadingPhases ? 'Loading Rounds…' : '— Select Admission Round —'}</option>
                {(phases ?? []).map(p => <option key={p.value} value={p.value}>{p.text}</option>)}
              </select>
            </div>

            {/* Faculty */}
            <div className="md:col-span-4">
              <label htmlFor="faculty-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Faculty / Stream <span className="text-rose-600 font-extrabold">*</span>
              </label>
              <select
                id="faculty-select"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all shadow-2xs cursor-pointer bg-white"
                value={facultyId}
                onChange={e => {
                  setFacultyId(Number(e.target.value))
                  setFilters(f => ({ ...f, collegeId: 0 }))
                  setSubmitted(false)
                }}
              >
                <option value={0}>{isLoadingFaculties ? 'Loading Faculties…' : '— Select Faculty —'}</option>
                {(faculties ?? []).map(f => <option key={f.value} value={f.value}>{f.text}</option>)}
              </select>
            </div>

            {/* College */}
            <div className="md:col-span-4">
              <label htmlFor="college-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                College / Institution <span className="text-rose-600 font-extrabold">*</span>
              </label>
              <select
                id="college-select"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all shadow-2xs cursor-pointer bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                value={filters.collegeId}
                onChange={e => {
                  setFilters(f => ({ ...f, collegeId: Number(e.target.value) }))
                  setSubmitted(false)
                }}
                disabled={facultyId === 0}
              >
                <option value={0}>
                  {isLoadingColleges ? 'Loading Colleges…' : facultyId === 0 ? '— Select Faculty First —' : '— Select College —'}
                </option>
                {(colleges ?? []).map(c => <option key={c.value} value={c.value}>{c.text}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              className="w-full sm:w-auto px-7 h-11 bg-agriculture hover:bg-agriculture-600 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-emerald-400/30"
              onClick={() => setSubmitted(true)}
              disabled={isLoading || filters.phaseId === 0 || filters.collegeId === 0}
            >
              {isLoading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Fetching Allotment Records…</span>
                </>
              ) : (
                <>
                  <span>📋</span>
                  <span>Get Allotment List</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Card */}
      {submitted && (
        <div className="l-card bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-[#0B1D33] text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-xl shadow-2xs">
                📜
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                  Allotted Candidates List
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Merit-based seat allotment with roster category details
                </p>
              </div>
            </div>
            {data && (
              <span className="text-2xs font-bold font-mono uppercase tracking-wider bg-white/15 text-white px-3 py-1 rounded-full border border-white/20">
                {data.length} Allotments Found
              </span>
            )}
          </div>

          <div className="p-0 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-3 text-center w-14">Sr. No.</th>
                    <th className="py-3 px-3 text-center w-28">App ID</th>
                    <th className="py-3 px-3.5 text-center w-36">Form No.</th>
                    <th className="py-3 px-4 text-left">Candidate Name</th>
                    <th className="py-3 px-3 text-center w-32">Applied Category</th>
                    <th className="py-3 px-3 text-center w-32">Allotted Category</th>
                    <th className="py-3 px-2.5 text-center w-24">Roster Seq</th>
                    <th className="py-3 px-2.5 text-center w-24">Roster Point</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-500">
                        <div className="inline-flex items-center gap-2">
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                          <span>Loading allotment records…</span>
                        </div>
                      </td>
                    </tr>
                  ) : !data || data.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400">
                        No allotment records found for the selected round and college.
                      </td>
                    </tr>
                  ) : (
                    data.map((row: AllotmentListItem, i: number) => (
                      <tr key={row.applicationID + '-' + i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 text-center font-bold text-slate-500">{i + 1}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-primary-950 bg-slate-50/50">
                          {row.applicationID}
                        </td>
                        <td className="py-2.5 px-3.5 text-center font-mono text-3xs text-slate-600">{row.applicationFormNo}</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">{row.candidateName}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {row.studentCategoryDisplay}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-2xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                            {row.allottedCategoryDisplay}
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5 text-center font-mono text-slate-600">{row.roasterSeqNo}</td>
                        <td className="py-2.5 px-2.5 text-center font-mono font-bold text-slate-800">{row.roasterPoint}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
