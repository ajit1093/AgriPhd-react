import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { collegeApi } from '@/api/college'
import { masterApi } from '@/api/master'
import { useMasterData } from '@/hooks/useMasterData'

/**
 * P2-A-11 / P6-THEME-11 — Public/UniversityVaccancy.aspx → UniversityVacancyPage
 * Dynamic Vacancy Position for Agricultural Universities and Affiliated Colleges.
 */
export default function UniversityVacancyPage() {
  const [universityId, setUniversityId] = useState(0)
  const [subjectId, setSubjectId]       = useState(0)
  const [submitted, setSubmitted]       = useState(false)

  const { data: universities } = useMasterData('university')

  const { data: subjects, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['master', 'spot-round-subjects', universityId],
    queryFn:  () => masterApi.getSpotRoundSubjects(universityId),
    enabled:  universityId > 0,
    staleTime: 3_600_000,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['university', 'vacancies', universityId, subjectId],
    queryFn:  () => collegeApi.getUniversityVacancies({ universityId, subjectId }),
    enabled:  submitted,
  })

  return (
    <div className="w-full space-y-6 py-2 sm:py-4">
      {/* Search Filter Card */}
      <div className="l-card bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden">
        {/* Card Header */}
        <div className="bg-[#0B1D33] text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-xl shadow-2xs">
              🏫
            </span>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                Search University &amp; Subject Vacancies
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Live seat vacancy matrix across SAUs and affiliated doctoral colleges
              </p>
            </div>
          </div>
          <span className="text-2xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
            Live Vacancy
          </span>
        </div>

        <div className="p-5 sm:p-6 bg-white space-y-5">
          {/* Advisory banner */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5" role="note">
            <span className="text-base shrink-0">⚠️</span>
            <span><strong>Note:</strong> The live vacancy position dynamically updates upon candidate admission cancellations, spot round allotments, and institutional conversions.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5">
              <label htmlFor="univ-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                State Agricultural University <span className="text-rose-600 font-extrabold">*</span>
              </label>
              <select
                id="univ-select"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all shadow-2xs cursor-pointer bg-white"
                value={universityId}
                onChange={e => {
                  setUniversityId(Number(e.target.value))
                  setSubjectId(0)
                  setSubmitted(false)
                }}
              >
                <option value={0}>— Select University —</option>
                {(universities ?? []).map(u => <option key={u.value} value={u.value}>{u.text}</option>)}
              </select>
            </div>

            <div className="md:col-span-4">
              <label htmlFor="subj-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subject / Discipline
              </label>
              <select
                id="subj-select"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all shadow-2xs cursor-pointer bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                value={subjectId}
                onChange={e => {
                  setSubjectId(Number(e.target.value))
                  setSubmitted(false)
                }}
                disabled={universityId === 0}
              >
                <option value={0}>
                  {isLoadingSubjects ? 'Loading Subjects…' : universityId === 0 ? '— Select University First —' : '— All Subjects / Disciplines —'}
                </option>
                {(subjects ?? []).map(s => <option key={s.value} value={s.value}>{s.text}</option>)}
              </select>
            </div>

            <div className="md:col-span-3">
              <button
                type="button"
                className="w-full h-11 bg-agriculture hover:bg-agriculture-600 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-emerald-400/30"
                onClick={() => setSubmitted(true)}
                disabled={isLoading || universityId === 0}
              >
                {isLoading ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Checking Vacancies…</span>
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    <span>Check Vacancies</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {submitted && data && (
        <div className="l-card bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-[#0B1D33] text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-xl shadow-2xs">
                📊
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                  Collegewise Vacancy Breakdown
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Detailed distribution across quotas, categories, and genders
                </p>
              </div>
            </div>
            <span className="text-2xs font-bold font-mono uppercase tracking-wider bg-white/15 text-white px-3 py-1 rounded-full border border-white/20">
              {data.collegeWise.length} Quota Records
            </span>
          </div>

          <div className="p-5 sm:p-6 bg-white space-y-7">
            {/* Row 1: College Quota List + Roster Details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* College Wise List */}
              <div className="lg:col-span-8 overflow-x-auto">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2.5 pb-2 border-b border-slate-200 flex items-center gap-2">
                  <span>📌</span>
                  <span>Subject &amp; Quota Wise Vacancies</span>
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
                  <table className="w-full min-w-[560px] text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                        <th className="py-3 px-3.5 text-left">Subject Name</th>
                        <th className="py-3 px-2.5 text-center">Quota</th>
                        <th className="py-3 px-2.5 text-center">Category</th>
                        <th className="py-3 px-2.5 text-center">Gender</th>
                        <th className="py-3 px-2.5 text-center">Allotted Type</th>
                        <th className="py-3 px-3 text-center">Vacancy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.collegeWise.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-400">
                            No vacancy records found for the chosen criteria.
                          </td>
                        </tr>
                      ) : (
                        data.collegeWise.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-3.5 font-medium text-slate-900">{r.subjectName}</td>
                            <td className="py-2.5 px-2.5 text-center text-slate-600">{r.quota}</td>
                            <td className="py-2.5 px-2.5 text-center">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-2xs">
                                {r.category}
                              </span>
                            </td>
                            <td className="py-2.5 px-2.5 text-center text-slate-600">{r.genderType}</td>
                            <td className="py-2.5 px-2.5 text-center text-slate-600">{r.allottedType}</td>
                            <td className="py-2.5 px-3 text-center font-bold font-mono text-emerald-700 text-sm">
                              {r.vac}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Roster Details */}
              {data.rosterDetails.length > 0 && (
                <div className="lg:col-span-4 overflow-x-auto">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2.5 pb-2 border-b border-slate-200 flex items-center gap-2">
                    <span>📋</span>
                    <span>Roster Point Vacancies</span>
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
                    <table className="w-full min-w-[280px] text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                          <th className="py-3 px-2 text-center">Roster</th>
                          <th className="py-3 px-2 text-center">Points</th>
                          <th className="py-3 px-3 text-left">Category</th>
                          <th className="py-3 px-2.5 text-center">Vac</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.rosterDetails.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-2 text-center font-mono text-slate-600">{r.rosterSrNo}</td>
                            <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-700">{r.rosterPoints}</td>
                            <td className="py-2.5 px-3 text-left font-medium text-slate-800">{r.categoryName}</td>
                            <td className="py-2.5 px-2.5 text-center font-bold font-mono text-emerald-700 text-sm">{r.vac}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Row 2: Subject Wise College breakdown */}
            {data.subjectWise.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2.5 pb-2 border-b border-slate-200 flex items-center gap-2">
                  <span>🏢</span>
                  <span>College-Wise Complete Distribution</span>
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
                  <table className="w-full min-w-[620px] text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                        <th className="py-3 px-3 text-center">Code</th>
                        <th className="py-3 px-3.5 text-left">College Name</th>
                        <th className="py-3 px-2.5 text-center">PhD Code</th>
                        <th className="py-3 px-3.5 text-left">Subject</th>
                        <th className="py-3 px-2.5 text-center">Quota</th>
                        <th className="py-3 px-3 text-center">Vacancy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.subjectWise.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-primary-900 bg-slate-50/50">
                            {r.collegeCode}
                          </td>
                          <td className="py-2.5 px-3.5 font-medium text-slate-900">{r.collegeName}</td>
                          <td className="py-2.5 px-2.5 text-center font-mono text-3xs text-slate-500">{r.pHDCollegeCode}</td>
                          <td className="py-2.5 px-3.5 text-slate-700">{r.subjectName}</td>
                          <td className="py-2.5 px-2.5 text-center text-slate-600">{r.quota}</td>
                          <td className="py-2.5 px-3 text-center font-bold font-mono text-emerald-700 text-sm">
                            {r.vac}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
