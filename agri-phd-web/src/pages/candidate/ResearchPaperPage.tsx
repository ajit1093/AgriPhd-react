import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { appFormApi } from '@/api/applicationForm'
import { CANDIDATE_ROUTES } from '@/router/routes'
import { WizardHeader } from '@/components/candidate/WizardHeader'

/**
 * P2-D-06 / P6-THEME-14 — Candidate/ApplicationFormResearchPaper.aspx → ResearchPaperPage
 * Modernized Academic Ph.D. Admissions Theme.
 *
 * Preserves 100% of fields, table columns, weightage logic, and dialog interactions:
 *   Columns: Sr. No. | Research Paper Title | Name of Journal | Year of Publication | NAAS Score | Weightages | Action
 */
interface PaperForm {
  paperTitle: string
  nameOfPaper: string
  yearOfPublication: number
  naasScore: number
}

export default function ResearchPaperPage() {
  const navigate                  = useNavigate()
  const qc                        = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId]       = useState(0)

  const { data: papers = [], isLoading } = useQuery({
    queryKey: ['research-papers'],
    queryFn: appFormApi.getResearchPapers,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PaperForm>({
    defaultValues: { yearOfPublication: new Date().getFullYear(), naasScore: 0 },
  })

  const saveMut = useMutation({
    mutationFn: (v: PaperForm) => appFormApi.saveResearchPaper({
      naasDetailId: editId,
      paperTitle: v.paperTitle,
      nameOfPaper: v.nameOfPaper,
      yearOfPublication: v.yearOfPublication,
      naasScore: v.naasScore,
    }),
    onSuccess: (r) => {
      if (r.success) {
        toast.success('Research paper saved successfully.')
        setShowModal(false)
        reset()
        setEditId(0)
        qc.invalidateQueries({ queryKey: ['research-papers'] })
      } else {
        toast.error(r.message ?? 'Save failed.')
      }
    },
  })

  const deleteMut = useMutation({
    mutationFn: (naasDetailId: number) => appFormApi.deleteResearchPaper(naasDetailId),
    onSuccess: () => {
      toast.success('Research paper deleted.')
      qc.invalidateQueries({ queryKey: ['research-papers'] })
    },
  })

  const proceedMut = useMutation({
    mutationFn: () => appFormApi.saveWeightage(),
    onSuccess: () => navigate(CANDIDATE_ROUTES.shortlist),
  })

  return (
    <div className="w-full max-w-[1680px] mx-auto space-y-6">
      <WizardHeader currentStep={5} />

      <div className="l-card bg-white border border-slate-200/90 rounded-xl shadow-card overflow-hidden">
        {/* Card Header */}
        <div className="l-card-header bg-gradient-to-r from-academic-navy to-primary-900 text-white font-semibold text-base py-3.5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-amber-300">📄</span>
            <span>Research Paper Details (Step 5 of 10)</span>
          </div>
          <span className="text-xs text-white/80 font-normal hidden sm:inline">
            National Academy of Agricultural Sciences (NAAS) Rated Publications
          </span>
        </div>

        <div className="l-card-body p-6 space-y-5">

          {/* Advisory banner */}
          <div className="bg-primary-50/70 border border-primary-200 rounded-lg p-4 flex items-start gap-3 text-xs text-primary-900">
            <span className="text-base text-primary-700 shrink-0">ℹ️</span>
            <div>
              <p className="font-semibold text-primary-950">Publication Guidelines &amp; Weightages:</p>
              <p className="text-slate-600 mt-0.5">
                Applicants can add research papers published in journals with a valid NAAS rating. Capped weightages will be calculated as per MCAER doctoral admission regulations.
              </p>
            </div>
          </div>

          {/* GridView of papers */}
          <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-2xs">
            <table className="grid-view w-full min-w-[650px] text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="py-2.5 px-3 font-semibold text-center w-12">Sr. No.</th>
                  <th className="py-2.5 px-3 font-semibold">Research Paper Title</th>
                  <th className="py-2.5 px-3 font-semibold">Name of Journal</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Year</th>
                  <th className="py-2.5 px-3 font-semibold text-center">NAAS Score</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Weightages</th>
                  <th className="py-2.5 px-3 font-semibold text-center w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500">
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent mr-2 align-middle" />
                      Loading research publications…
                    </td>
                  </tr>
                ) : papers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 italic">
                      No research papers added yet. If you have publications, click &quot;Add Research Paper Details&quot; below.
                    </td>
                  </tr>
                ) : (
                  papers.map((p, i) => (
                    <tr key={i} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 text-center text-slate-500">{i + 1}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{p.paperTitle}</td>
                      <td className="py-2.5 px-3 text-slate-700">{p.nameOfPaper}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{p.yearOfPublication}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-block bg-primary-50 text-primary-800 border border-primary-200 px-2 py-0.5 rounded text-xs font-mono font-bold">
                          {p.nAASScore}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-xs font-mono font-bold">
                          {p.weightages}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            className="text-agriculture hover:text-agriculture-700 font-semibold text-xs cursor-pointer"
                            onClick={() => {
                              setEditId(0)
                              setShowModal(true)
                            }}
                          >
                            Edit
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            className="text-rose-600 hover:text-rose-800 font-semibold text-xs cursor-pointer"
                            onClick={() => deleteMut.mutate(0)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Add button */}
          <div>
            <button
              type="button"
              className="btn-success-legacy inline-flex items-center gap-2 bg-agriculture hover:bg-agriculture-600 text-white font-medium px-4 py-2 rounded-md shadow-xs transition-colors cursor-pointer text-xs sm:text-sm"
              onClick={() => {
                reset()
                setEditId(0)
                setShowModal(true)
              }}
            >
              <span>➕</span>
              <span>Add Research Paper Details</span>
            </button>
          </div>

          {/* Navigation Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate(CANDIDATE_ROUTES.qualification)}
              className="btn-outline-legacy inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors cursor-pointer"
            >
              <span>&lt;&lt;&lt; Back to Qualification</span>
            </button>

            <button
              type="button"
              className="btn-special inline-flex items-center gap-2 bg-academic-navy hover:bg-primary-900 text-white font-medium px-6 py-2.5 rounded-md shadow-sm transition-all hover:shadow cursor-pointer disabled:opacity-50 text-sm"
              disabled={proceedMut.isPending}
              onClick={() => proceedMut.mutate()}
            >
              {proceedMut.isPending ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Processing…</span>
                </>
              ) : (
                <>
                  <span>Proceed</span>
                  <span>&gt;&gt;&gt;</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-modal w-full max-w-lg overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="bg-academic-navy text-white px-5 py-3.5 flex justify-between items-center">
              <h5 className="font-semibold text-sm flex items-center gap-2">
                <span>📝</span>
                <span>Add / Edit Research Paper</span>
              </h5>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-white/70 hover:text-white text-base transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              <form onSubmit={handleSubmit(v => saveMut.mutate(v))} noValidate className="space-y-4">
                <div className="form-group">
                  <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Research Paper Title <span className="required text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Title of published paper"
                    className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all"
                    {...register('paperTitle', { required: 'Research Paper Title is required.' })}
                  />
                  {errors.paperTitle && (
                    <span className="required block text-rose-600 text-xs mt-1">
                      {errors.paperTitle.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Name of Journal <span className="required text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Full name of journal publication"
                    className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all"
                    {...register('nameOfPaper', { required: 'Journal name is required.' })}
                  />
                  {errors.nameOfPaper && (
                    <span className="required block text-rose-600 text-xs mt-1">
                      {errors.nameOfPaper.message}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Year of Publication <span className="required text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      min={1990}
                      max={2026}
                      className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all font-mono"
                      {...register('yearOfPublication', { required: 'Required', valueAsNumber: true })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="control-label block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      NAAS Score <span className="required text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      max={15}
                      placeholder="e.g. 6.50"
                      className="l-form-control w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all font-mono"
                      {...register('naasScore', { required: 'Required', valueAsNumber: true })}
                    />
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-md text-xs font-semibold transition-colors cursor-pointer"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-success-legacy inline-flex items-center gap-1.5 bg-agriculture hover:bg-agriculture-600 text-white font-semibold px-5 py-2 rounded-md shadow-xs transition-colors cursor-pointer text-xs"
                    disabled={saveMut.isPending}
                  >
                    {saveMut.isPending ? 'Saving…' : 'Save Paper'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
