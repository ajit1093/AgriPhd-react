import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'

/**
 * Axios instance for all AgriPhd API calls.
 *
 * Key behaviours:
 * - withCredentials: true  → sends the httpOnly JWT cookie on every request
 * - CSRF header interceptor → reads CSRF token from the 'csrf-token' cookie and
 *   attaches it as 'X-CSRF-Token' header on all mutating requests (POST/PUT/DELETE/PATCH)
 * - 401 interceptor        → clears auth state and redirects to /login
 */

const MUTATING_METHODS = new Set(['post', 'put', 'delete', 'patch'])

/**
 * Read a cookie value by name from document.cookie.
 * The CSRF token is stored in a readable (non-httpOnly) cookie by the API.
 */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export const apiClient = axios.create({
  baseURL: '/api/v1',       // Vite proxies /api → https://localhost:7038 (see vite.config.ts)
  withCredentials: true,     // Send httpOnly JWT cookie cross-origin in dev
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// ─── Request interceptor: attach CSRF token on mutations ─────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const method = config.method?.toLowerCase() ?? ''
  if (MUTATING_METHODS.has(method)) {
    const csrfToken = getCookie('csrf-token')
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken
    }
  }
  return config
})

// ─── Response interceptor: handle 401 → redirect to login ────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const url = error.config?.url ?? ''
      // These endpoints returning 401 is normal — don't redirect or show errors
      const silentOn401 = ['/auth/me', '/auth/login', '/auth/forgot-password']
      const isSilent = silentOn401.some(path => url.includes(path))
      
      if (!isSilent) {
        useAuthStore.getState().clearUser()
        const publicPaths = ['/login', '/register', '/forgot-password']
        const currentPath = window.location.pathname
        if (!publicPaths.some((p) => currentPath.startsWith(p))) {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
