import { useState } from 'react'
import { LandingPage } from './components/landing/LandingPage'
import { MainApp } from './components/app/MainApp'
import { ErrorBoundary } from './components/ui/ErrorBoundary'

function App() {
  const [showApp, setShowApp] = useState(false)

  return (
    <div className="bg-eclipse-900 min-h-screen">
      <ErrorBoundary>
        {showApp ? (
          <MainApp />
        ) : (
          <LandingPage onStart={() => setShowApp(true)} />
        )}
      </ErrorBoundary>
    </div>
  )
}

export default App
