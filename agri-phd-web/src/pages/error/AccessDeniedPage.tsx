import { Link } from 'react-router-dom'
import { PUBLIC_ROUTES } from '@/router/routes'

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="card max-w-md w-full text-center">
        <div className="text-5xl mb-4" aria-hidden="true">🔒</div>
        <h1 className="text-xl font-bold text-neutral-800 mb-2">Access Denied</h1>
        <p className="text-neutral-600 mb-6">You do not have permission to view this page, or your session has expired.</p>
        <Link to={PUBLIC_ROUTES.login} className="inline-flex items-center px-4 py-2 bg-primary-700 text-white rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors">
          Back to Login
        </Link>
      </div>
    </div>
  )
}
