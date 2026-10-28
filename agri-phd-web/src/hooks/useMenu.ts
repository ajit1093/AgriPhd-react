import { useQuery } from '@tanstack/react-query'
import { menuApi } from '@/api/menu'
import type { MenuItem } from '@/api/menu'

/**
 * P3-09: Fetches the dynamic nav menu for the currently logged-in user.
 * Calls GET /api/v1/menu — MenuController returns tree for userTypeId from JWT.
 * staleTime 30s — short enough to pick up menu changes after login/role change.
 * Server cache is 1hr per role; this client cache is intentionally shorter
 * so a fresh login always gets current menu URLs (e.g. after flag-fix deployments).
 */
export function useMenu() {
  return useQuery<MenuItem[]>({
    queryKey: ['menu'],
    queryFn: menuApi.getMenu,
    staleTime: 0,        // Always refetch on mount so menu changes are immediately visible
    gcTime:    3_600_000,
    retry: 1,
  })
}
