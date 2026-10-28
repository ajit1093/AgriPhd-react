import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ERROR_ROUTES, PUBLIC_ROUTES } from './routes'

interface ProtectedRouteProps {
  /** If provided, only users with one of these UserTypeIDs are allowed. */
  allowedRoles?: number[]
}

/**
 * ProtectedRoute — guards authenticated routes.
 *
 * Behaviour:
 * 1. If session is still loading (awaiting /auth/me), shows a loading spinner.
 * 2. If not authenticated → redirect to /login (preserves intended URL for post-login redirect).
 * 3. If authenticated but wrong role → redirect to /access-denied.
 * 4. Otherwise → renders <Outlet />.
 *
 * Maps to legacy Helper.IsLoginValid() + role check on every Web Forms page.
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"
          role="status"
          aria-label="Loading"
        />
      </div>
    )
  }

  if (!isAuthenticated) {
    // Preserve current location so we can redirect back after login
    return <Navigate to={PUBLIC_ROUTES.login} state={{ from: location }} replace />
  }

  // SuperAdmin (11) has universal access across all portal routes
  if (user?.userTypeId === 11) {
    return <Outlet />
  }

  // Admin (12) has access to all staff/management routes (admin, college, admission, everification, university, reports, fee)
  if (user?.userTypeId === 12) {
    if (!allowedRoles || allowedRoles.some(r => [11, 12, 41, 42, 61, 93].includes(r))) {
      return <Outlet />
    }
  }

  if (allowedRoles && user && !allowedRoles.includes(user.userTypeId)) {
    return <Navigate to={ERROR_ROUTES.accessDenied} replace />
  }

  return <Outlet />
}
