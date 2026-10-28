import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { collegeApi } from '@/api/college'
import { useMasterData } from '@/hooks/useMasterData'
import type { CollegeSearchResult } from '@/types/college'

/**
 * P2-A-08 / P6-THEME-11 — Public/SearchCollege.aspx → SearchCollegePage
 * Search affiliated agriculture colleges by course, district, and course status.
 */
export default function SearchCollegePage() {
  const [filters, setFilters]     = useState({ courseId: 0, districtId: 0, courseStatusId: 0 })
  const [submitted, setSubmitted] = useState(false)
  const [labels, setLabels]       = useState({ course: 'All', district: 'All', status: 'All' })

  const { data: courses }        = useMasterData('course')
  const { data: districts }      = useMasterData('district')
  const { data: courseStatuses } = useMasterData('course-status')

  const { data, isLoading } = useQuery({
    queryKey: ['colleges', 'search', filters],
    queryFn: () => collegeApi.search(filters),
    enabled: submitted,
  })

  const handleSearch = () => {
    setLabels({
      course:   courses?.find(c => c.value === String(filters.courseId))?.text ?? 'All',
      district: districts?.find(d => d.value === String(filters.districtId))?.text ?? 'All',
      status:   courseStatuses?.find(s => s.value === String(filters.courseStatusId))?.text ?? 'All',
    })
    setSubmitted(true)
  }

  return (
    <div className="space-y-6 w-full py-2">

      {/* Filter Card */}
      <div className="l-card bg-white border border-slate-200/90 rounded-2xl shadow-card overflow-hidden">
        <div className="bg-[#0B1D33] text-white py-4 px-6 sm:px-8 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-lg shadow-2xs">
              🏛️
            </span>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                Search Participating Agriculture Colleges
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Explore doctoral degree courses, college intake capacity, and regional districts
              </p>
            </div>
          </div>
          <span className="text-2xs font-bold uppercase tracking-wider bg-white/15 text-white px-3 py-1 rounded-full border border-white/20">
            MCAER Ph.D.
          </span>
        </div>

        <div className="p-5 sm:p-7 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-end">
            <div className="sm:col-span-5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Course / Discipline
              </label>
              <select
                className="w-full h-11 rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all cursor-pointer bg-white shadow-2xs"
                value={filters.courseId}
                onChange={e => setFilters(f => ({ ...f, courseId: Number(e.target.value) }))}
              >
                <option value={0}>All Courses &amp; Disciplines</option>
                {(courses ?? []).map(c => <option key={c.value} value={c.value}>{c.text}</option>)}
              </select>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                District / Region
              </label>
              <select
                className="w-full h-11 rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all cursor-pointer bg-white shadow-2xs"
                value={filters.districtId}
                onChange={e => setFilters(f => ({ ...f, districtId: Number(e.target.value) }))}
              >
                <option value={0}>All Districts</option>
                {(districts ?? []).map(d => <option key={d.value} value={d.value}>{d.text}</option>)}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                College Status
              </label>
              <select
                className="w-full h-11 rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all cursor-pointer bg-white shadow-2xs"
                value={filters.courseStatusId}
                onChange={e => setFilters(f => ({ ...f, courseStatusId: Number(e.target.value) }))}
              >
                <option value={0}>All Statuses</option>
                {(courseStatuses ?? []).map(s => <option key={s.value} value={s.value}>{s.text}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 bg-agriculture hover:bg-agriculture-600 text-white font-bold px-7 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all text-sm cursor-pointer border border-emerald-400/30 transform hover:-translate-y-0.5"
              onClick={handleSearch}
              disabled={isLoading}
            >
              <span>🔍</span>
              <span>{isLoading ? 'Searching Colleges…' : 'Search Colleges'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Card */}
      {submitted && (
        <div className="l-card bg-white border border-slate-200/90 rounded-2xl shadow-card overflow-hidden">
          <div className="bg-[#0B1D33] text-white py-3.5 px-6 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span>📋</span>
              <span className="font-bold text-sm sm:text-base text-white">College Search Results</span>
            </div>
            {data && (
              <span className="text-2xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-mono font-bold">
                {data.length} Colleges Found
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-2xs font-semibold text-slate-500">
                  <td colSpan={7} className="py-2.5 px-4 bg-slate-100/80">
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700">
                      <span>Course: <strong className="text-slate-900">{labels.course}</strong></span>
                      <span>&bull;</span>
                      <span>District: <strong className="text-slate-900">{labels.district}</strong></span>
                      <span>&bull;</span>
                      <span>Status: <strong className="text-slate-900">{labels.status}</strong></span>
                    </div>
                  </td>
                </tr>
                <tr className="bg-slate-100/90 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <th className="py-3 px-3 text-center w-14">Sr. No.</th>
                  <th className="py-3 px-3 text-center w-28">College Code</th>
                  <th className="py-3 px-3 w-32">District</th>
                  <th className="py-3 px-4">College Name</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-3 text-center w-28">Status</th>
                  <th className="py-3 px-3 text-center w-20">Intake</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">
                      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent mr-2" />
                      Searching colleges…
                    </td>
                  </tr>
                ) : !data || data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      No colleges found matching the selected criteria.
                    </td>
                  </tr>
                ) : (
                  data.map((row: CollegeSearchResult, i: number) => (
                    <tr key={row.collegeCode + i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-center font-mono text-slate-500">{i + 1}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-bold text-primary-900 bg-primary-50 border border-primary-200 px-2.5 py-0.5 rounded text-2xs">
                          {row.collegeCode}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700">{row.district}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{row.collegeName}</td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{row.course}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-3xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {row.courseStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold font-mono text-emerald-700">{row.intake}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
