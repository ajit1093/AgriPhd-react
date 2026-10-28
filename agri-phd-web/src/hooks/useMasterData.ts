import { useQuery } from '@tanstack/react-query'
import { masterApi } from '@/api/master'
import type { DropdownItem, SaluationMapItem } from '@/types/master'

/**
 * P1-MASTER-04 — useMasterData hook.
 * Fetches a master dropdown list with staleTime: 1 hour (matching legacy Global.asax TTL).
 * The cache key includes the tableName so each list is independently cached.
 *
 * Usage:
 *   const { data: genders } = useMasterData('gender')
 *   const { data: categories } = useMasterData('category')
 */
export function useMasterData(tableName: string) {
  return useQuery<DropdownItem[]>({
    queryKey: ['master', tableName],
    queryFn: () => masterApi.getList(tableName),
    staleTime: 3_600_000, // 1 hour — matches legacy cache TTL
    gcTime:    3_600_000,
    enabled:   !!tableName,
  })
}

/**
 * Cascading district list — identical staleTime since districts don't change.
 */
export function useMasterDistricts() {
  return useMasterData('district')
}

/**
 * Cascading taluka list — filtered client-side by districtId after fetching all.
 */
export function useMasterTalukas(districtId?: string | number) {
  const query = useMasterData('taluka')
  const filtered = districtId
    ? (query.data ?? []).filter(t => t.group === String(districtId))
    : (query.data ?? [])
  return { ...query, data: filtered }
}

/**
 * Salutation map — needed on Personal Details page to filter by gender.
 */
export function useSaluationMap() {
  return useQuery<SaluationMapItem[]>({
    queryKey: ['master', 'saluation-map'],
    queryFn: () => masterApi.getSaluationMap(),
    staleTime: 3_600_000,
    gcTime:    3_600_000,
  })
}

/**
 * Colleges filtered by faculty ID.
 */
export function useMasterColleges(facultyId?: number) {
  return useQuery<DropdownItem[]>({
    queryKey: ['master', 'colleges', facultyId],
    queryFn: () => masterApi.getColleges(facultyId!),
    enabled: !!facultyId,
    staleTime: 3_600_000,
    gcTime:    3_600_000,
  })
}
