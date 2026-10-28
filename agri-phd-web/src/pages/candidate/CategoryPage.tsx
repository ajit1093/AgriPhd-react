import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { appFormApi } from '@/api/applicationForm'
import { useMasterData } from '@/hooks/useMasterData'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CANDIDATE_ROUTES } from '@/router/routes'
import { computeFinalCategory } from '@/utils/categoryUtils'
import { WizardHeader } from '@/components/candidate/WizardHeader'

/**
 * P2-D-04 / P6-THEME-14 — Candidate/CategoryAndOtherReservation.aspx → CategoryPage
 * Modernized Academic Ph.D. Admissions Theme.
 *
 * FinalCategoryID business logic (preserved 100%):
 *   If CategoryID is SC/ST/VJ/NT/OBC/SBC/SEBC → requires HasCasteCertificate=1
 *   If EWS → requires HasEWSCertificate=1
 *   If any required cert is absent → FinalCategoryID = GENERAL (1)
 *   Show ConfirmDialog when FinalCategoryID ≠ CategoryID
 */
export default function CategoryPage() {
  const navigate = useNavigate()
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingData, setPendingData] = useState<Record<string, number | string> | null>(null)

  const { data: existing, isLoading } = useQuery({ queryKey: ['category'], queryFn: appFormApi.getCategory })
  const { data: religions }     = useMasterData('religion')
  const { data: domicileTypes } = useMasterData('domicile-type')
  const { data: categories }    = useMasterData('category')

  const { register, handleSubmit, reset } = useForm<Record<string, number | string>>({
    defaultValues: {
      categoryID: 0,
      domicileTypeID: 0,
      religionID: 0,
      domicile: 'Y',
      hasCasteCertificate: 0,
      hasNCLCertificate: 0,
      hasEWSCertificate: 0,
      hasCasteValidityCertificate: 0,
      hasCasteValidityReceipt: 0,
      isOrphan: 0,
      isPWD: 0,
      isExServiceman: 0,
      isFreedomFighter: 0,
      isProjectAffected: 0,
      isIncomeSourceAgriculture: 0,
      caste: '',
    },
  })

  useEffect(() => {
    if (existing) reset(existing as unknown as Record<string, number | string>)
  }, [existing, reset])

  const saveMut = useMutation({
    mutationFn: (data: Record<string, number | string>) => appFormApi.saveCategory(data as never),
    onSuccess: (r) => {
      if (r.success) {
        toast.success('Category & reservation details saved successfully.')
        navigate(CANDIDATE_ROUTES.qualification)
      } else {
        toast.error(r.message ?? 'Save failed.')
      }
    },
  })

  const onSubmit = (values: Record<string, number | string>) => {
    const categoryId      = Number(values.categoryID)
    const hasCasteCert    = Number(values.hasCasteCertificate)
    const hasEWS          = Number(values.hasEWSCertificate)
    const finalCategoryId = computeFinalCategory(categoryId, hasCasteCert, hasEWS)

    const payload = {
      ...values,
      finalCategoryID: finalCategoryId,
      previousCategoryID: existing?.previousCategoryID ?? categoryId,
    }

    if (finalCategoryId !== categoryId) {
      setPendingData(payload)
      setShowConfirm(true)
    } else {
      saveMut.mutate(payload)
    }
  }

  const YNOptions = [
    { value: 1, label: 'Yes' },
    { value: 0, label: 'No' },
  ]

  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        <span>Loading Category Details…</span>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1680px] mx-auto space-y-6">
      <WizardHeader currentStep={3} />

      <div className="l-card bg-white border border-slate-200/90 rounded-xl shadow-card overflow-hidden">
        {/* Card Header */}
        <div className="l-card-header bg-gradient-to-r from-academic-navy to-primary-900 text-white font-semibold text-base py-3.5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-amber-300">🏛️</span>
            <span>Category &amp; Other Reservation Details (Step 3 of 10)</span>
          </div>
          <span className="text-xs text-white/80 font-normal hidden sm:inline">
            Social Category &amp; Constitutional Quota
          </span>
        </div>

        <div className="l-card-body p-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">

            {/* Domicile, Religion, Category, Caste */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">

              {/* Domicile */}
              <div className="form-group">
                <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Domicile <span className="required text-rose-600">*</span>
                </label>
                <select
                  className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all bg-white"
                  {...register('domicile')}
                >
                  <option value="Y">Maharashtra</option>
                  <option value="N">Other than Maharashtra</option>
                </select>
              </div>

              {/* Domicile Type */}
              <div className="form-group">
                <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Domicile Type <span className="required text-rose-600">*</span>
                </label>
                <select
                  className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all bg-white"
                  {...register('domicileTypeID', { valueAsNumber: true })}
                >
                  <option value={0}>— Select Domicile Type —</option>
                  {(domicileTypes ?? []).map(d => <option key={d.value} value={Number(d.value)}>{d.text}</option>)}
                </select>
              </div>

              {/* Religion */}
              <div className="form-group">
                <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Religion <span className="required text-rose-600">*</span>
                </label>
                <select
                  className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all bg-white"
                  {...register('religionID', { valueAsNumber: true })}
                >
                  <option value={0}>— Select Religion —</option>
                  {(religions ?? []).map(r => <option key={r.value} value={Number(r.value)}>{r.text}</option>)}
                </select>
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Category <span className="required text-rose-600">*</span>
                </label>
                <select
                  className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all bg-white"
                  {...register('categoryID', { valueAsNumber: true })}
                >
                  <option value={0}>— Select Category —</option>
                  {(categories ?? []).map(c => <option key={c.value} value={Number(c.value)}>{c.text}</option>)}
                </select>
              </div>

              {/* Caste */}
              <div className="form-group md:col-span-2">
                <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Caste / Sub-Caste
                </label>
                <input
                  type="text"
                  placeholder="Enter caste name as mentioned on certificate"
                  className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all"
                  {...register('caste')}
                />
              </div>

            </div>

            {/* ── Sub-card: Certificate Details ──────────────────────────── */}
            <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50/50">
              <div className="l-card-header l-card-header-sm bg-slate-100/90 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between font-semibold text-slate-800 text-xs uppercase tracking-wider">
                <span className="flex items-center gap-2">
                  <span>📜</span>
                  <span>Certificate Details</span>
                </span>
                <span className="text-2xs text-slate-500 font-normal lowercase">
                  (Required certificates will be verified during e-scrutiny)
                </span>
              </div>
              <div className="p-4 sm:p-5 bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { field: 'hasCasteCertificate', label: 'Caste Certificate' },
                    { field: 'hasNCLCertificate', label: 'NCL Certificate' },
                    { field: 'hasEWSCertificate', label: 'EWS Certificate' },
                    { field: 'hasCasteValidityCertificate', label: 'Caste Validity' },
                    { field: 'hasCasteValidityReceipt', label: 'Validity Receipt' },
                  ].map(({ field, label }) => (
                    <div key={field} className="form-group">
                      <label className="control-label block text-xs font-semibold text-slate-700 mb-1">
                        {label}
                      </label>
                      <select
                        className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all bg-white"
                        {...register(field, { valueAsNumber: true })}
                      >
                        {YNOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Sub-card: Other Reservation ────────────────────────────── */}
            <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50/50">
              <div className="l-card-header l-card-header-sm bg-slate-100/90 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2 font-semibold text-slate-800 text-xs uppercase tracking-wider">
                <span>🎖️</span>
                <span>Special Horizontal Reservation Details</span>
              </div>
              <div className="p-4 sm:p-5 bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                  {[
                    { field: 'isOrphan', label: 'Orphan (अनाथ)' },
                    { field: 'isPWD', label: 'Physically Handicapped (Divyang/PWD)' },
                    { field: 'isExServiceman', label: 'Ex-Serviceman (माजी सैनिक)' },
                    { field: 'isFreedomFighter', label: 'Freedom Fighter Dependent' },
                    { field: 'isProjectAffected', label: 'Project Affected Person (PAP)' },
                    { field: 'isIncomeSourceAgriculture', label: 'Income Source Agriculture (AG)' },
                  ].map(({ field, label }) => (
                    <div key={field} className="form-group bg-slate-50 p-3 rounded-lg border border-slate-200/80 flex items-center justify-between gap-3">
                      <label className="control-label text-xs font-semibold text-slate-700">
                        {label}
                      </label>
                      <select
                        className="l-form-control rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all bg-white w-24"
                        {...register(field, { valueAsNumber: true })}
                      >
                        {YNOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(CANDIDATE_ROUTES.address)}
                className="btn-outline-legacy inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors cursor-pointer"
              >
                <span>&lt;&lt;&lt; Back to Address</span>
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

      {/* FinalCategoryID mismatch confirm dialog */}
      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          setShowConfirm(false)
          if (pendingData) saveMut.mutate(pendingData)
        }}
        title="Category Reclassification Notice"
        message="According to MCAER admission rules, if valid caste or EWS certificates are not provided, your application category will be set to GENERAL. Do you wish to continue?"
        confirmLabel="Yes, Continue"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  )
}
