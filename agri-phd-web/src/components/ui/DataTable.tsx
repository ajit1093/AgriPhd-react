import { useState, useMemo, useId } from 'react'
import { Button } from './Button'

export interface Column<T> {
  key: keyof T | string
  header: string
  /** Custom cell renderer */
  render?: (row: T, index: number) => React.ReactNode
  /** Enable client-side sort on this column */
  sortable?: boolean
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  /** Row key extractor */
  rowKey: (row: T) => string | number
  pageSize?: number
  loading?: boolean
  emptyMessage?: string
  caption?: string
}

type SortDir = 'asc' | 'desc'

/**
 * P1-UI-07 — DataTable.
 * Sortable columns, client-side pagination, loading skeleton, empty state.
 * Maps to legacy GridView + DataList patterns throughout the portal.
 * WCAG: role="grid", sortable columns use aria-sort.
 */
export function DataTable<T extends object>({
  columns, data, rowKey, pageSize = 10, loading = false, emptyMessage = 'No records found.', caption,
}: DataTableProps<T>) {
  const captionId = useId()
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const sorted = useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey]
      const bv = (b as Record<string, unknown>)[sortKey]
      const cmp = String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [data, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-labelledby={caption ? captionId : undefined}>
          {caption && <caption id={captionId} className="sr-only">{caption}</caption>}
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  scope="col"
                  className={`px-4 py-3 text-left font-semibold text-neutral-600 whitespace-nowrap ${col.className ?? ''}`}
                  aria-sort={col.sortable ? (sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none') : undefined}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(String(col.key))}
                      className="inline-flex items-center gap-1 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-primary-600 rounded"
                    >
                      {col.header}
                      <SortIcon active={sortKey === String(col.key)} dir={sortDir} />
                    </button>
                  ) : col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <tr key={i}>
                  {columns.map(col => (
                    <td key={String(col.key)} className="px-4 py-3">
                      <div className="h-4 bg-neutral-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-neutral-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row, idx) => (
                <tr key={rowKey(row)} className="hover:bg-neutral-50 transition-colors">
                  {columns.map(col => (
                    <td key={String(col.key)} className={`px-4 py-3 text-neutral-700 ${col.className ?? ''}`}>
                      {col.render
                        ? col.render(row, idx)
                        : String((row as Record<string, unknown>)[String(col.key)] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 bg-neutral-50 text-sm text-neutral-600">
          <span>
            Showing {Math.min((page - 1) * pageSize + 1, sorted.length)}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page">‹ Prev</Button>
            <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Next page">Next ›</Button>
          </div>
        </div>
      )}
    </div>
  )
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <svg className={`h-3.5 w-3.5 transition-opacity ${active ? 'opacity-100' : 'opacity-30'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      {(!active || dir === 'asc') && <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" opacity={active && dir === 'asc' ? 1 : 0.4} />}
      {(!active || dir === 'desc') && <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" opacity={active && dir === 'desc' ? 1 : 0.4} />}
    </svg>
  )
}
