import { useEffect, useState } from 'react'
import { GoogleSolarMap } from '../map/GoogleSolarMap'
import { Sidebar } from '../layout/Sidebar'
import { ResultsHUD } from '../dashboard/ResultsHUD'
import { GuideOverlay } from './GuideOverlay'
import { Toast } from '../ui/Toast'
import { SpotlightCursor } from '../ui/SpotlightCursor'
import { useSimulationStore } from '../../store/simulationStore'
import { useLanguageStore } from '../../store/languageStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Question } from '@phosphor-icons/react'

export function MainApp() {
const { isCalculating, results, polygon, clearToast, toast } = useSimulationStore()
  const { t } = useLanguageStore()
  const [showGuide, setShowGuide] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  // Prevent right-click on map
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.gm-style')) {
        e.preventDefault()
      }
    }
    document.addEventListener('contextmenu', handleContextMenu)
    return () => document.removeEventListener('contextmenu', handleContextMenu)
  }, [])

  // Update guide step based on user progress
  useEffect(() => {
    if (polygon.length >= 3 && currentStep === 2) {
      setCurrentStep(3)
    }
  }, [polygon.length, currentStep])

  // Clear toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => clearToast(), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast, clearToast])

return (
    <div className="relative w-screen h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Spotlight Cursor */}
      <SpotlightCursor />

      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        <GoogleSolarMap />
      </div>

      {/* Guide Overlay */}
      <GuideOverlay 
        isOpen={showGuide} 
        onClose={() => setShowGuide(false)}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
      />

      {/* UI Layers */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Sidebar - Left */}
        <div className="pointer-events-auto">
          <Sidebar />
        </div>

{/* Help Button - Top Left */}
        <button
          onClick={() => setShowGuide(true)}
          className="absolute top-4 left-4 pointer-events-auto
                     w-11 h-11 bg-[#0f0f0f] border border-[#444] rounded-xl
                     text-[#FF4D00] hover:text-white hover:bg-[#FF4D00]/20 hover:border-[#FF4D00]
                     transition-all flex items-center justify-center shadow-lg"
          title={t('app.title')}
          aria-label={t('app.title')}
        >
          <Question className="w-6 h-6" weight="bold" aria-hidden="true" />
        </button>

        {/* Results HUD - Right Bottom */}
        <AnimatePresence>
          {results && !isCalculating && (
            <div className="pointer-events-auto">
              <ResultsHUD />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast Notifications */}
      <Toast />

      {/* Loading Overlay */}
      <AnimatePresence>
        {isCalculating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            aria-busy="true"
            aria-live="polite"
            role="status"
          >
            <div className="text-center">
              <motion.div
                className="w-24 h-24 rounded-full border-4 border-[#FF4D00] border-t-transparent mx-auto mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                aria-hidden="true"
              />
              <p className="text-[#FF4D00] font-mono text-xl font-bold">{t('app.calculating')}</p>
              <p className="text-gray-500 text-sm mt-2">{t('app.calculatingDesc')}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
