import { useState, useEffect } from 'react'
import { Info } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

interface InfoTooltipProps {
  title: string
  description: string
  tips?: string[]
  language: 'id' | 'en'
}

export function InfoTooltip({ title, description, tips, language }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [tooltipWidth, setTooltipWidth] = useState(280)

  useEffect(() => {
    const updateTooltipWidth = () => {
      const viewportWidth = window.innerWidth
      if (viewportWidth < 400) {
        setTooltipWidth(Math.min(viewportWidth - 32, 280))
      } else {
        setTooltipWidth(280)
      }
    }
    
    updateTooltipWidth()
    window.addEventListener('resize', updateTooltipWidth)
    return () => window.removeEventListener('resize', updateTooltipWidth)
  }, [])

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget
    const rect = button.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    let tooltipLeft: number
    let tooltipTop: number = rect.top
    
    const actualWidth = Math.min(tooltipWidth, viewportWidth - 32)
    
    if (rect.left < actualWidth + 20) {
      tooltipLeft = rect.right + 10
    } else {
      tooltipLeft = rect.left - actualWidth - 10
    }
    
    tooltipLeft = Math.max(16, Math.min(tooltipLeft, viewportWidth - actualWidth - 16))
    
    if (tooltipTop + 200 > viewportHeight) {
      tooltipTop = viewportHeight - 220
    }
    if (tooltipTop < 16) {
      tooltipTop = 16
    }
    
    setPosition({ top: tooltipTop, left: tooltipLeft })
    setIsOpen(!isOpen)
  }

  const tooltipContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[9999]"
            onClick={() => setIsOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed z-[10000]"
            style={{ top: position.top, left: position.left, width: tooltipWidth }}
            role="dialog"
            aria-modal="false"
            aria-labelledby="tooltip-title"
          >
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl overflow-hidden w-full">
              <div className="bg-gradient-to-r from-[#FF4D00]/20 to-transparent px-4 py-3 border-b border-[#333]">
                <h3 id="tooltip-title" className="text-white font-semibold text-sm">{title}</h3>
              </div>

              <div className="p-4">
                <p className="text-gray-300 text-sm leading-relaxed">{description}</p>

                {tips && tips.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#333]">
                    <p className="text-[#FF4D00] font-medium text-xs mb-2">
                      {language === 'id' ? '💡 Tips:' : '💡 Tips:'}
                    </p>
                    <ul className="space-y-1.5">
                      {tips.map((tip, index) => (
                        <li key={index} className="text-gray-400 text-xs flex items-start gap-2">
                          <span className="text-[#00FF94] mt-0.5 flex-shrink-0">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return (
    <div className="relative inline-block z-50">
      <button
        onClick={handleToggle}
        className="w-5 h-5 rounded-full bg-[#333] text-gray-400 hover:bg-[#FF4D00] hover:text-white flex items-center justify-center transition-colors flex-shrink-0"
        title={language === 'id' ? 'Klik untuk info' : 'Click for info'}
        aria-label={title}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Info className="w-3 h-3" weight="bold" aria-hidden="true" />
      </button>

      {typeof window !== 'undefined' && createPortal(tooltipContent, document.body)}
    </div>
  )
}