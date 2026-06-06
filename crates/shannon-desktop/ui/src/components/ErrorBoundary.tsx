// React Error Boundary with retry functionality
import { Component, ReactNode, ErrorInfo } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#1a1b26] p-4">
          <div className="max-w-lg w-full bg-[#24283b] border border-[#f7768e] rounded-lg p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-[#f7768e] flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-[#c0caf5] mb-2">
                  Something went wrong
                </h2>
                <p className="text-sm text-[#a9b1d6] mb-4">
                  The application encountered an unexpected error. You can try
                  reloading or contact support if the problem persists.
                </p>

                {this.state.error && (
                  <div className="mb-4">
                    <div className="text-xs text-[#565f89] mb-1">
                      Error message:
                    </div>
                    <pre className="bg-[#1a1b26] p-3 rounded text-xs text-[#f7768e] overflow-x-auto">
                      {this.state.error.message}
                    </pre>
                  </div>
                )}

                {this.state.errorInfo && (
                  <details className="mb-4">
                    <summary className="text-xs text-[#565f89] cursor-pointer hover:text-[#a9b1d6]">
                      Technical details (dev mode)
                    </summary>
                    <pre className="mt-2 bg-[#1a1b26] p-3 rounded text-xs text-[#565f89] overflow-x-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}

                <button
                  onClick={this.handleRetry}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#7aa2f7] hover:bg-[#7aa2f7]/80 text-[#1a1b26] rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
