import { Component } from 'react'
import InternalErrorPage from '@/pages/error/InternalErrorPage'

interface Props {
  children: React.ReactNode
  /** Optional custom fallback — defaults to InternalErrorPage */
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * P1-QUERY-03 — React ErrorBoundary.
 * Wraps each role's route group to catch unhandled component errors.
 * Renders InternalErrorPage with reset button.
 * Maps to legacy Global.asax Application_Error handler.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Unhandled error:', error, info.componentStack)
    // In production, POST to /api/v1/log/client-error (Phase 3 task)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <InternalErrorPage
          error={this.state.error ?? undefined}
          resetError={this.handleReset}
        />
      )
    }
    return this.props.children
  }
}
