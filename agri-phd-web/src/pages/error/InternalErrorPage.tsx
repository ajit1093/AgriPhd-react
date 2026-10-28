import { Link } from 'react-router-dom'
import { PUBLIC_ROUTES } from '@/router/routes'

interface Props {
  /** Passed by React ErrorBoundary */
  error?: Error
  resetError?: () => void
}

export default function InternalErrorPage({ error, resetError }: Props) {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="card max-w-md w-full text-center">
        <div className="text-5xl mb-4" aria-hidden="true">⚠️</div>
        <h1 className="text-xl font-bold text-neutral-800 mb-2">Something Went Wrong</h1>
        <p className="text-neutral-600 mb-2">An unexpected error occurred. Please try again.</p>
        {error && (
          <p className="text-xs text-danger bg-danger-light rounded p-2 mb-4 text-left font-mono break-all">
            {error.message}
          </p>
        )}
        <div className="flex justify-center gap-3">
          {resetError && (
            <button
              onClick={resetError}
              className="px-4 py-2 bg-primary-700 text-white rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors"
            >
              Try Again
            </button>
          )}
          <Link to={PUBLIC_ROUTES.home} className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-100 transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
