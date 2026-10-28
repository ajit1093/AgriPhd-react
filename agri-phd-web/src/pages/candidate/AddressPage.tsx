import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { appFormApi } from '@/api/applicationForm'
import { useMasterData } from '@/hooks/useMasterData'
import { CANDIDATE_ROUTES } from '@/router/routes'
import { WizardHeader } from '@/components/candidate/WizardHeader'

/**
 * P2-D-03 / P6-THEME-14 — Candidate/Address.aspx → AddressPage
 * Modernized Academic Ph.D. Admissions Theme.
 *
 * Preserves 100% of fields, validations, and cascading behavior:
 *   Address Line 1 * | Address Line 2
 *   State * (cascades Districts)
 *   District * (cascades Talukas)
 *   Taluka | City * | Pincode * (6 digits)
 */
const schema = z.object({
  addressLine1: z.string().min(1, 'Address Line 1 is required.'),
  addressLine2: z.string().optional(),
  stateID:      z.number().min(1,  'Please select State.'),
  districtID:   z.number().min(1,  'Please select District.'),
  talukaID:     z.number().optional(),
  taluka:       z.string().optional(),
  city:         z.string().min(1,  'City is required.'),
  pincode:      z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits.'),
})
type FormValues = z.infer<typeof schema>

export default function AddressPage() {
  const navigate = useNavigate()
  const [selStateId, setSelStateId]       = useState(0)
  const [selDistrictId, setSelDistrictId] = useState(0)

  const { data: existing, isLoading } = useQuery({ queryKey: ['address'], queryFn: appFormApi.getAddress })
  const { data: states }              = useMasterData('state')
  const { data: allDistricts }        = useMasterData('district')
  const { data: allTalukas }          = useMasterData('taluka')

  // Cascading filter
  const districts = (allDistricts ?? []).filter(d => !selStateId    || d.group === String(selStateId))
  const talukas   = (allTalukas   ?? []).filter(t => !selDistrictId || t.group === String(selDistrictId))

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { stateID: 0, districtID: 0, talukaID: 0 },
  })

  useEffect(() => {
    if (existing) {
      setSelStateId(existing.stateID ?? 0)
      setSelDistrictId(existing.districtID ?? 0)
      reset({
        addressLine1: existing.addressLine1 ?? '',
        addressLine2: existing.addressLine2 ?? '',
        stateID:      existing.stateID      ?? 0,
        districtID:   existing.districtID   ?? 0,
        talukaID:     existing.talukaID     ?? 0,
        taluka:       existing.taluka       ?? '',
        city:         existing.city         ?? '',
        pincode:      existing.pincode      ?? '',
      })
    }
  }, [existing, reset])

  const saveMut = useMutation({
    mutationFn: (v: FormValues) => appFormApi.saveAddress({
      addressLine1: v.addressLine1,
      addressLine2: v.addressLine2,
      stateID: v.stateID,
      districtID: v.districtID,
      talukaID: v.talukaID ?? 0,
      taluka: v.taluka ?? '',
      city: v.city,
      pincode: v.pincode,
    }),
    onSuccess: (r) => {
      if (r.success) {
        toast.success('Address details saved successfully.')
        navigate(CANDIDATE_ROUTES.category)
      } else {
        toast.error(r.message ?? 'Save failed.')
      }
    },
  })

  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        <span>Loading Address Details…</span>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1680px] mx-auto space-y-6">
      <WizardHeader currentStep={2} />

      <div className="l-card bg-white border border-slate-200/90 rounded-xl shadow-card overflow-hidden">
        {/* Card Header */}
        <div className="l-card-header bg-gradient-to-r from-academic-navy to-primary-900 text-white font-semibold text-base py-3.5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-amber-300">📍</span>
            <span>Address Details (Step 2 of 10)</span>
          </div>
          <span className="text-xs text-white/80 font-normal hidden sm:inline">
            Permanent &amp; Correspondence Address
          </span>
        </div>

        <div className="l-card-body p-6">
          <form onSubmit={handleSubmit(v => saveMut.mutate(v))} noValidate className="space-y-6">

            {/* Address Lines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div className="form-group">
                <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Address Line 1 <span className="required text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="House/Flat No., Building Name, Street"
                  className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all"
                  {...register('addressLine1')}
                />
                {errors.addressLine1 && (
                  <span className="required block text-rose-600 text-xs mt-1">
                    {errors.addressLine1.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  placeholder="Area, Landmark (optional)"
                  className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all"
                  {...register('addressLine2')}
                />
              </div>
            </div>

            {/* Location Details: State / District / Taluka / City / Pincode */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">

              {/* State */}
              <div className="form-group">
                <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  State <span className="required text-rose-600">*</span>
                </label>
                <select
                  className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all bg-white"
                  {...register('stateID', { valueAsNumber: true })}
                  onChange={e => {
                    setSelStateId(Number(e.target.value))
                    setSelDistrictId(0)
                    setValue('districtID', 0)
                    setValue('talukaID', 0)
                  }}
                >
                  <option value={0}>— Select State —</option>
                  {(states ?? []).map(s => <option key={s.value} value={Number(s.value)}>{s.text}</option>)}
                </select>
                {errors.stateID && (
                  <span className="required block text-rose-600 text-xs mt-1">
                    {errors.stateID.message}
                  </span>
                )}
              </div>

              {/* District */}
              <div className="form-group">
                <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  District <span className="required text-rose-600">*</span>
                </label>
                <select
                  className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                  {...register('districtID', { valueAsNumber: true })}
                  onChange={e => {
                    setSelDistrictId(Number(e.target.value))
                    setValue('talukaID', 0)
                  }}
                  disabled={selStateId === 0}
                >
                  <option value={0}>— Select District —</option>
                  {districts.map(d => <option key={d.value} value={Number(d.value)}>{d.text}</option>)}
                </select>
                {errors.districtID && (
                  <span className="required block text-rose-600 text-xs mt-1">
                    {errors.districtID.message}
                  </span>
                )}
              </div>

              {/* Taluka */}
              <div className="form-group">
                <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Taluka
                </label>
                <select
                  className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                  {...register('talukaID', { valueAsNumber: true })}
                  disabled={selDistrictId === 0}
                >
                  <option value={0}>— Select Taluka —</option>
                  {talukas.map(t => <option key={t.value} value={Number(t.value)}>{t.text}</option>)}
                </select>
              </div>

              {/* City */}
              <div className="form-group">
                <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  City / Village <span className="required text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter city or town"
                  className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all"
                  {...register('city')}
                />
                {errors.city && (
                  <span className="required block text-rose-600 text-xs mt-1">
                    {errors.city.message}
                  </span>
                )}
              </div>

              {/* Pincode */}
              <div className="form-group">
                <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Pincode <span className="required text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit postal code"
                  className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all font-mono"
                  {...register('pincode')}
                />
                {errors.pincode && (
                  <span className="required block text-rose-600 text-xs mt-1">
                    {errors.pincode.message}
                  </span>
                )}
              </div>

            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(CANDIDATE_ROUTES.personal)}
                className="btn-outline-legacy inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors cursor-pointer"
              >
                <span>&lt;&lt;&lt; Back to Personal</span>
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
