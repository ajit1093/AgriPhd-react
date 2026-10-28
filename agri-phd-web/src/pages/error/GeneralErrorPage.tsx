import { Link } from 'react-router-dom'
import { PUBLIC_ROUTES } from '@/router/routes'

export default function GeneralErrorPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="card max-w-md w-full text-center">
        <div className="text-5xl mb-4" aria-hidden="true">🔧</div>
        <h1 className="text-xl font-bold text-neutral-800 mb-2">Service Unavailable</h1>
        <p className="text-neutral-600 mb-6">
          The portal is temporarily unavailable due to maintenance. Please try again shortly.
        </p>
        <Link to={PUBLIC_ROUTES.home} className="inline-flex items-center px-4 py-2 bg-primary-700 text-white rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors">
          Go to Home
        </Link>
      </div>
    </div>
  )
}
