import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import toast from 'react-hot-toast'
import { appFormApi, type PreferenceRow } from '@/api/applicationForm'
import { CANDIDATE_ROUTES } from '@/router/routes'
import { WizardHeader } from '@/components/candidate/WizardHeader'

/**
 * P2-D-07 / P6-THEME-15 — Candidate/ShortListOptions.aspx → ShortlistOptionsPage
 * Modernized Academic Ph.D. Admissions Theme.
 *
 * Drag-and-drop reordering with @dnd-kit/sortable.
 * Generates identical XML for legacy OptionsXML parameter.
 */
function SortableRow({ row, index }: { row: PreferenceRow; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(row.preferenceNo),
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 20 : 1,
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`transition-colors ${isDragging ? 'bg-primary-100 shadow-md ring-1 ring-primary-400' : 'hover:bg-slate-50/70'}`}
    >
      <td className="py-2.5 px-3 text-center">
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 hover:bg-primary-100 text-slate-700 hover:text-primary-800 font-mono text-xs font-bold cursor-grab active:cursor-grabbing select-none border border-slate-200"
          {...attributes}
          {...listeners}
          title="Drag to reorder preference"
        >
          <span className="text-slate-400">⠿</span>
          <span>#{index + 1}</span>
        </div>
      </td>
      <td className="py-2.5 px-3 font-mono text-xs text-primary-900 font-medium">{row.collegeCode}</td>
      <td className="py-2.5 px-3 font-medium text-slate-900">{row.collegeName}</td>
      <td className="py-2.5 px-3 text-slate-700">{row.district}</td>
      <td className="py-2.5 px-3 text-slate-700">{row.facultyName}</td>
      <td className="py-2.5 px-3 text-slate-700">{row.subjectName}</td>
    </tr>
  )
}

export default function ShortlistOptionsPage() {
  const navigate = useNavigate()
  const [preferences, setPreferences] = useState<PreferenceRow[]>([])

  const { data, isLoading } = useQuery({
    queryKey: ['preferences'],
    queryFn: appFormApi.getPreferences,
  })

  useEffect(() => {
    if (data) setPreferences(data)
  }, [data])

  const saveMut = useMutation({
    mutationFn: () => {
      // Build XML matching legacy OptionsXML format
      const xml = preferences.map((p, i) =>
        `<Option PreferenceNo="${i + 1}" CollegeID="${p.collegeCode}" />`
      ).join('')
      return appFormApi.savePreferences(`<Options>${xml}</Options>`)
    },
    onSuccess: (r) => {
      if (r.success) {
        toast.success('College preferences saved successfully.')
        navigate(CANDIDATE_ROUTES.uploadPhotoSign)
      } else {
        toast.error(r.message ?? 'Save failed.')
      }
    },
  })

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setPreferences(prev => {
        const oldIndex = prev.findIndex(p => String(p.preferenceNo) === active.id)
        const newIndex = prev.findIndex(p => String(p.preferenceNo) === over.id)
        return arrayMove(prev, oldIndex, newIndex).map((p, i) => ({ ...p, preferenceNo: i + 1 }))
      })
    }
  }

  return (
    <div className="w-full max-w-[1680px] mx-auto space-y-6">
      <WizardHeader currentStep={6} />

      <div className="l-card bg-white border border-slate-200/90 rounded-xl shadow-card overflow-hidden">
        {/* Card Header */}
        <div className="l-card-header bg-gradient-to-r from-academic-navy to-primary-900 text-white font-semibold text-base py-3.5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-amber-300">🏛️</span>
            <span>Shortlist College Preferences (Step 6 of 10)</span>
          </div>
          <span className="text-xs text-white/80 font-normal hidden sm:inline">
            Drag rows to reorder allotment priorities
          </span>
        </div>

        <div className="l-card-body p-6 space-y-5">

          {/* Instructions banner */}
          <div className="bg-amber-50/80 border-l-4 border-amber-500 rounded-r-lg p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
            <span className="text-amber-700 font-bold text-sm shrink-0">💡</span>
            <p>
              <strong>Priority Instruction:</strong> Drag and drop the handles (⠿ #) to adjust your college preference order. Allotments in CAP rounds will be granted strictly in descending order of your preferences based on merit.
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-2xs">
            <table className="grid-view w-full min-w-[650px] text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="py-2.5 px-3 font-semibold text-center w-28">Preference</th>
                  <th className="py-2.5 px-3 font-semibold w-28">Subject Code</th>
                  <th className="py-2.5 px-3 font-semibold">College Name</th>
                  <th className="py-2.5 px-3 font-semibold">District</th>
                  <th className="py-2.5 px-3 font-semibold">Faculty</th>
                  <th className="py-2.5 px-3 font-semibold">Subject</th>
                </tr>
              </thead>
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={preferences.map(p => String(p.preferenceNo))} strategy={verticalListSortingStrategy}>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-500">
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent mr-2 align-middle" />
                          Loading college options…
                        </td>
                      </tr>
                    ) : preferences.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400 italic">
                          No preferences available for the selected faculty and subject. Please contact the admission helpline.
                        </td>
                      </tr>
                    ) : (
                      preferences.map((row, i) => (
                        <SortableRow key={row.preferenceNo} row={row} index={i} />
                      ))
                    )}
                  </tbody>
                </SortableContext>
              </DndContext>
            </table>
          </div>

          {/* Navigation Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate(CANDIDATE_ROUTES.researchPaper)}
              className="btn-outline-legacy inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors cursor-pointer"
            >
              <span>&lt;&lt;&lt; Back to Research Papers</span>
            </button>

            <button
              type="button"
              className="btn-special inline-flex items-center gap-2 bg-academic-navy hover:bg-primary-900 text-white font-medium px-6 py-2.5 rounded-md shadow-sm transition-all hover:shadow cursor-pointer disabled:opacity-50 text-sm"
              disabled={saveMut.isPending || preferences.length === 0}
              onClick={() => saveMut.mutate()}
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

        </div>
      </div>
    </div>
  )
}
