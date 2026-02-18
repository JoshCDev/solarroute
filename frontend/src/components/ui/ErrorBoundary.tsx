import { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Warning, ArrowCounterClockwise } from '@phosphor-icons/react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="min-h-screen bg-eclipse-900 flex items-center justify-center p-4"
        >
          <div className="max-w-md w-full bg-[#0f0f0f] border border-[#333] rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#D91E18]/20 flex items-center justify-center mx-auto mb-6">
              <Warning className="w-8 h-8 text-[#D91E18]" weight="fill" />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2">
              Something went wrong
            </h2>
            
            <p className="text-gray-400 text-sm mb-6">
              An unexpected error occurred. Please try again.
            </p>
            
            {this.state.error && (
              <pre className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 mb-6 text-left overflow-x-auto">
                <code className="text-xs text-red-400">
                  {this.state.error.message}
                </code>
              </pre>
            )}
            
            <button
              onClick={this.handleRetry}
              className="w-full py-3 bg-gradient-to-r from-[#FF4D00] to-[#D91E18] text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <ArrowCounterClockwise className="w-5 h-5" />
              Try Again
            </button>
          </div>
        </motion.div>
      )
    }

    return this.props.children
  }
}
