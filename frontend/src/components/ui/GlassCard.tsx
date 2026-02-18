import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  glow?: boolean
  noise?: boolean
}

export function GlassCard({ children, className = '', glow = true, noise = true }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className={`
        relative overflow-hidden rounded-2xl
        backdrop-blur-xl bg-glass-surface
        border border-glass-border
        ${glow ? 'shadow-[0_0_40px_-10px_rgba(255,77,0,0.15)]' : ''}
        ${noise ? 'noise-overlay' : ''}
        ${className}
      `}
    >
      <div className="absolute inset-0 rounded-2xl pointer-events-none inner-border-gradient" />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}
