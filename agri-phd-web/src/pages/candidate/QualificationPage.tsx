import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { appFormApi } from '@/api/applicationForm'
import { useMasterData } from '@/hooks/useMasterData'
import { apiClient } from '@/api/client'
import { CANDIDATE_ROUTES } from '@/router/routes'
import { WizardHeader } from '@/components/candidate/WizardHeader'
import type { DropdownItem } from '@/types/master'

/**
 * P2-D-05 / P6-THEME-14 — Candidate/Qualification.aspx → QualificationPage
 * Modernized Academic Ph.D. Admissions Theme.
 *
 * Preserves 100% of fields, faculty-to-subject cascades, and legacy behavior:
 *   Faculty * | Subject *
 *   Name of College * | College State | College District | College City | Pincode
 *   Bachelor Degree * | CGPA Score * | No. of Years to Complete | Government Employed?
 */
export default function QualificationPage() {
  const navigate = useNavigate()
  const [selectedFacultyId, setSelectedFacultyId]           = useState(0)
  const [selectedCollegeStateId, setSelectedCollegeStateId] = useState(0)
  const [subjects, setSubjects]                             = useState<DropdownItem[]>([])

  const { data: existing, isLoading } = useQuery({ queryKey: ['qualification'], queryFn: appFormApi.getQualification })
  const { data: states }       = useMasterData('state')
  const { data: allDistricts } = useMasterData('district')
  const { data: degrees }      = useMasterData('qualification')

  // Eligible faculties for this candidate
  const { data: faculties } = useQuery({
    queryKey: ['eligible-faculties'],
    queryFn: () => apiClient.get<DropdownItem[]>('/master/faculty').then(r => r.data).catch(() => [] as DropdownItem[]),
    staleTime: 3_600_000,
  })

  // Cascading districts from selected college state
  const districts = (allDistricts ?? []).filter(d => !selectedCollegeStateId || d.group === String(selectedCollegeStateId))

  // Load subjects when faculty changes
  useEffect(() => {
    if (selectedFacultyId > 0) {
      apiClient.get<DropdownItem[]>(`/master/spot-round-subjects?universityId=0`)
        .then(r => setSubjects(r.data))
        .catch(() => setSubjects([]))
    } else {
      setSubjects([])
    }
  }, [selectedFacultyId])

  const { register, handleSubmit, reset, setValue } = useForm<Record<string, number | string | undefined>>({
    defaultValues: {
      facultyID: 0,
      subjectID: 0,
      bachlorDegreeID: 0,
      collegeStateID: 0,
      collegeDistrictID: 0,
      noOfYearsToComplete: 0,
      isEmployed: 0,
      cGPA: 0,
    },
  })

  useEffect(() => {
    if (existing) {
      setSelectedFacultyId(Number(existing.facultyID ?? 0))
      setSelectedCollegeStateId(Number(existing.collegeStateID ?? 0))
      reset(existing as never)
    }
  }, [existing, reset])

  const saveMut = useMutation({
    mutationFn: (d: Record<string, number | string | undefined>) => appFormApi.saveQualification(d as never),
    onSuccess: (r) => {
      if (r.success) {
        toast.success('Qualification details saved successfully.')
        navigate(CANDIDATE_ROUTES.researchPaper)
      } else {
        toast.error(r.message ?? 'Save failed.')
      }
    },
  })

  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        <span>Loading Qualification Details…</span>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1680px] mx-auto space-y-6">
      <WizardHeader currentStep={4} />

      <div className="l-card bg-white border border-slate-200/90 rounded-xl shadow-card overflow-hidden">
        {/* Card Header */}
        <div className="l-card-header bg-gradient-to-r from-academic-navy to-primary-900 text-white font-semibold text-base py-3.5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-amber-300">🎓</span>
            <span>Qualification Details (Step 4 of 10)</span>
          </div>
          <span className="text-xs text-white/80 font-normal hidden sm:inline">
            Postgraduate / Qualifying Degree Credentials
          </span>
        </div>

        <div className="l-card-body p-6">
          <form onSubmit={handleSubmit(d => saveMut.mutate(d))} noValidate className="space-y-6">

            {/* Faculty & Subject Cascade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {/* Faculty */}
              <div className="form-group">
                <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Faculty <span className="required text-rose-600">*</span>
                </label>
                <select
                  className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all bg-white"
                  {...register('facultyID', { valueAsNumber: true })}
                  onChange={e => {
                    setSelectedFacultyId(Number(e.target.value))
                    setValue('subjectID', 0)
                  }}
                >
                  <option value={0}>— Select Faculty —</option>
                  {(faculties ?? []).map(f => <option key={f.value} value={Number(f.value)}>{f.text}</option>)}
                </select>
              </div>

              {/* Subject — cascades from faculty */}
              <div className="form-group">
                <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Subject <span className="required text-rose-600">*</span>
                </label>
                <select
                  className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                  {...register('subjectID', { valueAsNumber: true })}
                  disabled={selectedFacultyId === 0}
                >
                  <option value={0}>— Select Subject —</option>
                  {subjects.map(s => <option key={s.value} value={Number(s.value)}>{s.text}</option>)}
                </select>
              </div>
            </div>

            {/* ── Sub-card: Institution Information ───────────────────────── */}
            <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50/50">
              <div className="l-card-header l-card-header-sm bg-slate-100/90 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2 font-semibold text-slate-800 text-xs uppercase tracking-wider">
                <span>🏫</span>
                <span>Institution / Qualifying College Details</span>
              </div>
              <div className="p-4 sm:p-5 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">

                  {/* College Name */}
                  <div className="form-group md:col-span-2 lg:col-span-3">
                    <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Name of College / University <span className="required text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter full name of college or university institution"
                      className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all"
                      {...register('nameOfCollege')}
                    />
                  </div>

                  {/* College State */}
                  <div className="form-group">
                    <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      College State
                    </label>
                    <select
                      className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all bg-white"
                      {...register('collegeStateID', { valueAsNumber: true })}
                      onChange={e => {
                        setSelectedCollegeStateId(Number(e.target.value))
                        setValue('collegeDistrictID', 0)
                      }}
                    >
                      <option value={0}>— Select State —</option>
                      {(states ?? []).map(s => <option key={s.value} value={Number(s.value)}>{s.text}</option>)}
                    </select>
                  </div>

                  {/* College District */}
                  <div className="form-group">
                    <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      College District
                    </label>
                    <select
                      className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                      {...register('collegeDistrictID', { valueAsNumber: true })}
                      disabled={selectedCollegeStateId === 0}
                    >
                      <option value={0}>— Select District —</option>
                      {districts.map(d => <option key={d.value} value={Number(d.value)}>{d.text}</option>)}
                    </select>
                  </div>

                  {/* College City */}
                  <div className="form-group">
                    <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      College City / Town
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Pune, Rahuri, Parbhani"
                      className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all"
                      {...register('collegeCity')}
                    />
                  </div>

                  {/* College Pincode */}
                  <div className="form-group">
                    <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="6-digit pincode"
                      className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all font-mono"
                      {...register('collegePinCode')}
                    />
                  </div>

                </div>
              </div>
            </div>

            {/* ── Sub-card: Degree & Academic Performance ─────────────────── */}
            <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50/50">
              <div className="l-card-header l-card-header-sm bg-slate-100/90 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2 font-semibold text-slate-800 text-xs uppercase tracking-wider">
                <span>📊</span>
                <span>Qualifying Degree &amp; Marks</span>
              </div>
              <div className="p-4 sm:p-5 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

                  {/* Bachelor Degree */}
                  <div className="form-group lg:col-span-2">
                    <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Bachelor / Qualifying Degree <span className="required text-rose-600">*</span>
                    </label>
                    <select
                      className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all bg-white"
                      {...register('bachlorDegreeID', { valueAsNumber: true })}
                    >
                      <option value={0}>— Select Degree —</option>
                      {(degrees ?? []).map(d => <option key={d.value} value={Number(d.value)}>{d.text}</option>)}
                    </select>
                  </div>

                  {/* CGPA Score */}
                  <div className="form-group">
                    <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      CGPA Score (out of 10) <span className="required text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      placeholder="e.g. 8.25"
                      className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all font-mono"
                      {...register('cGPA', { valueAsNumber: true })}
                    />
                  </div>

                  {/* No. of Years to Complete */}
                  <div className="form-group">
                    <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Years to Complete Degree
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      placeholder="e.g. 4"
                      className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all font-mono"
                      {...register('noOfYearsToComplete', { valueAsNumber: true })}
                    />
                  </div>

                  {/* Government Employed */}
                  <div className="form-group lg:col-span-2">
                    <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Are You Government Employed?
                    </label>
                    <select
                      className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all bg-white"
                      {...register('isEmployed', { valueAsNumber: true })}
                    >
                      <option value={0}>No — Not Employed in Government</option>
                      <option value={1}>Yes — Government / Semi-Govt. Employee</option>
                    </select>
                  </div>

                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => navigate(CANDIDATE_ROUTES.category)}
                className="btn-outline-legacy inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors cursor-pointer"
              >
                <span>&lt;&lt;&lt; Back to Category</span>
              </button>

              <button
                type="submit"
                className="btn-special inline-flex items-center gap-2 bg-academic-navy hover:bg-primary-900 text-white font-medium px-6 py-2.5 rounded-md shadow-sm transition-all hover:shadow cursor-pointer disabled:opacity-50 text-sm"
                disabled={saveMut.isPending}
              >
                {saveMut.isPending ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Saving…</span>
                  </>
                ) : (
                  <>
                    <span>Save &amp; Next</span>
                    <span>&gt;&gt;&gt;</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
