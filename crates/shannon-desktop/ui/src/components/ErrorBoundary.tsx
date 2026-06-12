import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-xl text-center">
          <span className="material-symbols-outlined text-[48px] text-error mb-md">error</span>
          <h3 className="font-headline-md text-on-surface mb-sm">Something went wrong</h3>
          <p className="font-body-sm text-on-surface-variant mb-md max-w-md">{this.state.error?.message ?? 'An unexpected error occurred.'}</p>
          <button
            className="px-md py-sm bg-primary text-on-primary rounded-lg font-label-md cursor-pointer hover:shadow-md transition-all"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
