import { useEffect } from 'react'
import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import { AppRouter } from '@/router'
import { useAuthStore } from '@/store/authStore'
import { apiClient } from '@/api/client'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import type { AxiosError } from 'axios'

/** Extract a human-readable message from an API error. */
function getErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{ title?: string; message?: string }>
  return (
    axiosError?.response?.data?.message ??
    axiosError?.response?.data?.title ??
    (error instanceof Error ? error.message : 'An unexpected error occurred.')
  )
}

/**
 * P1-QUERY-01 — Global QueryClient configuration.
 * - staleTime: 30s default (master-data hooks override with 1 hour)
 * - retry: 1 — don't hammer a down API
 * - global onError: show toast for all query/mutation failures
 */
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Only show toast for background refetch failures (not initial load 401s)
      const url = String(query.queryKey[0] ?? '')
      const silentQueries = ['auth', 'registration', 'notifications']
      const isSilent = silentQueries.some(k => url.includes(k))
      if (!isSilent && query.state.data !== undefined) {
        toast.error(`Data refresh failed: ${getErrorMessage(error)}`)
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, _mutation) => {
      // Don't show global toast for auth mutations — they handle errors locally
      const url = (error as { config?: { url?: string } })?.config?.url ?? ''
      const isAuthMutation = url.includes('/auth/') || url.includes('/registration/')
      if (!isAuthMutation) {
        toast.error(getErrorMessage(error))
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime:           30_000,
      retry:               1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  const { setUser, clearUser, setLoading } = useAuthStore()

  // On app load, restore session from JWT httpOnly cookie via /auth/me
  useEffect(() => {
    setLoading(true)
    apiClient.get('/auth/me')
      .then((res) => {
        const data = res.data
        // Map legacy ASPX dashboardPath → React route using userTypeId
        const legacyToReact: Record<number, string> = {
          91: '/candidate/dashboard',
          11: '/super-admin/dashboard',
          12: '/admin/dashboard',
          61: '/college/dashboard',
          41: '/everification/dashboard',
          42: '/everification/dashboard',
          93: '/university/dashboard',
        }
        data.dashboardPath = legacyToReact[data.userTypeId] ?? '/candidate/dashboard'
        setUser(data)
        // Invalidate menu cache so fresh login always fetches updated menu URLs
        queryClient.invalidateQueries({ queryKey: ['menu'] })
      })
      .catch(() => { clearUser() })
  }, [setUser, clearUser, setLoading])

  // Health check silent
  useEffect(() => {
    apiClient.get('/health').then((res) => console.info('[AgriPHD] API:', res.data)).catch(() => {})
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* P1-QUERY-03: Top-level ErrorBoundary catches unhandled component throws */}
        <ErrorBoundary>
          <AppRouter />
        </ErrorBoundary>

        {/* P1-UI-13: react-hot-toast global config */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#f8fafc' } },
            error:   { iconTheme: { primary: '#dc2626', secondary: '#f8fafc' }, duration: 6000 },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
