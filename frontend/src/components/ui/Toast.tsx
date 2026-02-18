import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Info, X } from '@phosphor-icons/react'
import { useSimulationStore } from '../../store/simulationStore'
import { useLanguageStore } from '../../store/languageStore'

export function Toast() {
  const { toast, clearToast } = useSimulationStore()
  const { t } = useLanguageStore()

  if (!toast) return null

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-profit" weight="fill" aria-hidden="true" />,
    error: <XCircle className="w-5 h-5 text-red-500" weight="fill" aria-hidden="true" />,
    info: <Info className="w-5 h-5 text-eclipse-500" weight="fill" aria-hidden="true" />
  }

  const borderColors = {
    success: 'border-profit/50',
    error: 'border-red-500/50',
    info: 'border-eclipse-500/50'
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] pointer-events-auto`}
        role="alert"
        aria-live="polite"
      >
        <div 
          className={`flex items-center gap-3 px-6 py-4 rounded-xl 
                     bg-glass-surface/90 backdrop-blur-xl 
                     border ${borderColors[toast.type]}
                     shadow-[0_0_30px_rgba(0,0,0,0.5)]`}
        >
          {icons[toast.type]}
          <p className="text-white font-medium">{toast.message}</p>
          <button 
            onClick={clearToast}
            className="ml-2 p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label={t('toast.dismiss')}
          >
            <X className="w-4 h-4" weight="bold" aria-hidden="true" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
