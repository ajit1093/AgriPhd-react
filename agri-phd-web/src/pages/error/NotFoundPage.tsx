import { Link } from 'react-router-dom'
import { PUBLIC_ROUTES } from '@/router/routes'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="card max-w-md w-full text-center">
        <div className="text-6xl font-black text-neutral-200 mb-2" aria-hidden="true">404</div>
        <h1 className="text-xl font-bold text-neutral-800 mb-2">Page Not Found</h1>
        <p className="text-neutral-600 mb-6">The page you are looking for does not exist or has been moved.</p>
        <Link to={PUBLIC_ROUTES.home} className="inline-flex items-center px-4 py-2 bg-primary-700 text-white rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors">
          Go to Home
        </Link>
      </div>
    </div>
  )
}
