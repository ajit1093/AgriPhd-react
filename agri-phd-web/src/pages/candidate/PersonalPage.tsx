import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { appFormApi } from '@/api/applicationForm'
import { useMasterData, useSaluationMap } from '@/hooks/useMasterData'
import { CANDIDATE_ROUTES } from '@/router/routes'
import { WizardHeader } from '@/components/candidate/WizardHeader'

/**
 * P2-D-02 / P6-THEME-14 — Candidate/Personal.aspx → PersonalPage
 * Modernized Academic Ph.D. Admissions Theme.
 *
 * Preserves 100% of fields, validations, and legacy behavior:
 *   Salutation * (filtered by gender)
 *   Candidate's Full Name * (uppercase, read-only)
 *   Father's / Husband's Full Name *
 *   Parent Information:
 *     Father's / Parent's Occupation
 *     Mother's Maidan Full Name | Mother's Present Full Name
 *     Gender (read-only) | Date of Birth (read-only)
 *     Mobile Number * (read-only) | Alternate Mobile Number
 *     E-Mail ID * | Course Applied For *
 */
const schema = z.object({
  saluationID:        z.number().min(1, 'Please select Salutation.'),
  candidateName:      z.string().min(1, 'Candidate Name is required.').toUpperCase(),
  fatherName:         z.string().min(1, "Father's / Husband's Full Name is required."),
  fathersOccupation:  z.string().optional(),
  motherMaidanName:   z.string().optional(),
  motherPresentName:  z.string().optional(),
  mobileNo:           z.string().regex(/^\d{10}$/, 'Mobile Number must be 10 digits.'),
  alternateMobileNo:  z.string().optional(),
  eMailID:            z.string().email('Enter a valid E-Mail ID.').toLowerCase(),
  appliedCourseID:    z.number().min(1, 'Please select Applied Course.'),
})
type FormValues = z.infer<typeof schema>

export default function PersonalPage() {
  const navigate = useNavigate()
  const { data: existing, isLoading } = useQuery({ queryKey: ['personal'], queryFn: appFormApi.getPersonal })
  const { data: courses }      = useMasterData('course')
  const { data: saluationMap } = useSaluationMap()

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { saluationID: 0, appliedCourseID: 0 },
  })

  useEffect(() => {
    if (existing) {
      reset({
        saluationID:       existing.saluationID       ?? 0,
        candidateName:     existing.candidateName      ?? '',
        fatherName:        existing.fatherName         ?? '',
        fathersOccupation: existing.fathersOccupation  ?? '',
        motherMaidanName:  existing.motherMaidanName   ?? '',
        motherPresentName: existing.motherPresentName  ?? '',
        mobileNo:          existing.mobileNo           ?? '',
        alternateMobileNo: existing.alternateMobileNo  ?? '',
        eMailID:           existing.eMailID            ?? '',
        appliedCourseID:   existing.appliedCourseID    ?? 0,
      })
    }
  }, [existing, reset])

  const saveMut = useMutation({
    mutationFn: (v: FormValues) => appFormApi.savePersonal({
      saluationID: v.saluationID,
      candidateName: v.candidateName.toUpperCase(),
      fatherName: v.fatherName,
      fathersOccupation: v.fathersOccupation,
      motherMaidanName: v.motherMaidanName,
      motherPresentName: v.motherPresentName,
      mobileNo: v.mobileNo,
      alternateMobileNo: v.alternateMobileNo,
      eMailID: v.eMailID.toLowerCase(),
      appliedCourseID: v.appliedCourseID,
    }),
    onSuccess: (r) => {
      if (r.success) {
        toast.success('Personal details saved successfully.')
        navigate(CANDIDATE_ROUTES.address)
      } else {
        toast.error(r.message ?? 'Save failed.')
      }
    },
  })

  // Filter salutations by candidate's gender
  const genderCode = existing?.genderCode ?? ''
  const filteredSalutations = (saluationMap ?? [])
    .filter(sm => !genderCode || sm.genderCode === genderCode)
    .map(sm => ({ value: sm.saluationMapId, text: sm.genderCode }))

  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        <span>Loading Personal Details…</span>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1680px] mx-auto space-y-6">
      <WizardHeader currentStep={1} />

      <div className="l-card bg-white border border-slate-200/90 rounded-xl shadow-card overflow-hidden">
        {/* Card Header */}
        <div className="l-card-header bg-gradient-to-r from-academic-navy to-primary-900 text-white font-semibold text-base py-3.5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-amber-300">👤</span>
            <span>Personal Details (Step 1 of 10)</span>
          </div>
          <span className="text-xs text-white/80 font-normal hidden sm:inline">
            Fields marked with <span className="text-rose-400 font-bold">*</span> are mandatory
          </span>
        </div>

        <div className="l-card-body p-6">
          <form onSubmit={handleSubmit(v => saveMut.mutate(v))} noValidate className="space-y-6">

            {/* Candidate Basic Details */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
              {/* Salutation */}
              <div className="form-group md:col-span-3 lg:col-span-2">
                <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Salutation <span className="required text-rose-600">*</span>
                </label>
                <select
                  className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all bg-white"
                  {...register('saluationID', { valueAsNumber: true })}
                >
                  <option value={0}>— Select —</option>
                  {filteredSalutations.map(s => <option key={s.value} value={s.value}>{s.text}</option>)}
                </select>
                {errors.saluationID && (
                  <span className="required block text-rose-600 text-xs mt-1">
                    {errors.saluationID.message}
                  </span>
                )}
              </div>

              {/* Candidate's Full Name */}
              <div className="form-group md:col-span-9 lg:col-span-5">
                <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Candidate&apos;s Full Name <span className="required text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-slate-100 text-slate-700 cursor-not-allowed font-medium uppercase"
                  value={existing?.candidateName ?? ''}
                  readOnly
                  disabled
                />
                <span className="text-2xs text-slate-400 mt-0.5 block">From entrance exam registration</span>
              </div>

              {/* Father's / Husband's Full Name */}
              <div className="form-group md:col-span-12 lg:col-span-5">
                <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Father&apos;s / Husband&apos;s Full Name <span className="required text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all"
                  {...register('fatherName')}
                />
                {errors.fatherName && (
                  <span className="required block text-rose-600 text-xs mt-1">
                    {errors.fatherName.message}
                  </span>
                )}
              </div>
            </div>

            {/* ── Parent Information Sub-card ─────────────────────────────── */}
            <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50/50">
              <div className="l-card-header l-card-header-sm bg-slate-100/90 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2 font-semibold text-slate-800 text-xs uppercase tracking-wider">
                <span>👪</span>
                <span>Parent &amp; Demographic Information</span>
              </div>
              <div className="p-4 sm:p-5 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">

                  {/* Father's Occupation */}
                  <div className="form-group">
                    <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Father&apos;s / Parent&apos;s Occupation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Agriculture / Service"
                      className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all"
                      {...register('fathersOccupation')}
                    />
                  </div>

                  {/* Mother's Maidan Name */}
                  <div className="form-group">
                    <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Mother&apos;s Maidan Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Mother's name before marriage"
                      className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all"
                      {...register('motherMaidanName')}
                    />
                  </div>

                  {/* Mother's Present Name */}
                  <div className="form-group">
                    <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Mother&apos;s Present Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Mother's present name"
                      className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all"
                      {...register('motherPresentName')}
                    />
                  </div>

                  {/* Gender */}
                  <div className="form-group">
                    <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Gender
                    </label>
                    <input
                      type="text"
                      className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-slate-100 text-slate-700 cursor-not-allowed"
                      value={existing?.genderCode ?? ''}
                      disabled
                    />
                  </div>

                  {/* Date of Birth */}
                  <div className="form-group">
                    <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="text"
                      className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-slate-100 text-slate-700 cursor-not-allowed font-mono"
                      value={existing?.dOB ?? ''}
                      disabled
                    />
                  </div>

                  {/* Mobile Number */}
                  <div className="form-group">
                    <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Mobile Number <span className="required text-rose-600">*</span>
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-2.5 py-1.5 bg-slate-100 border border-r-0 border-slate-300 rounded-l-md text-xs font-semibold text-slate-600">
                        +91
                      </span>
                      <input
                        type="tel"
                        className="l-form-control flex-1 rounded-r-md rounded-l-none border border-slate-300 px-3 py-2 text-sm bg-slate-100 text-slate-700 cursor-not-allowed font-mono"
                        value={existing?.mobileNo ?? ''}
                        readOnly
                        disabled
                      />
                    </div>
                    <span className="text-2xs text-slate-500 mt-1 block">To update, visit Change Mobile / E-Mail.</span>
                  </div>

                  {/* Alternate Mobile */}
                  <div className="form-group">
                    <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Alternate Mobile Number
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10-digit number (optional)"
                      className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all font-mono"
                      {...register('alternateMobileNo')}
                    />
                  </div>

                  {/* E-Mail ID */}
                  <div className="form-group">
                    <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      E-Mail ID <span className="required text-rose-600">*</span>
                    </label>
                    <input
                      type="email"
                      className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all"
                      {...register('eMailID')}
                    />
                    {errors.eMailID && (
                      <span className="required block text-rose-600 text-xs mt-1">
                        {errors.eMailID.message}
                      </span>
                    )}
                  </div>

                  {/* Applied Course */}
                  <div className="form-group">
                    <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Course Applied For <span className="required text-rose-600">*</span>
                    </label>
                    <select
                      className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all bg-white"
                      {...register('appliedCourseID', { valueAsNumber: true })}
                    >
                      <option value={0}>— Select Course —</option>
                      {(courses ?? []).map(c => <option key={c.value} value={Number(c.value)}>{c.text}</option>)}
                    </select>
                    {errors.appliedCourseID && (
                      <span className="required block text-rose-600 text-xs mt-1">
                        {errors.appliedCourseID.message}
                      </span>
                    )}
                  </div>

                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
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
