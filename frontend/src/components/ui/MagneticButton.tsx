import { motion, useMotionValue, useSpring } from 'framer-motion'
import { ReactNode, useRef } from 'react'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
  'aria-label'?: string
}

export function MagneticButton({ 
  children, 
  className = '', 
  onClick, 
  disabled = false,
  variant = 'primary',
  'aria-label': ariaLabel
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const springConfig = { stiffness: 150, damping: 15 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current || disabled) return
    
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const distanceX = e.clientX - centerX
    const distanceY = e.clientY - centerY
    
    x.set(distanceX * 0.2)
    y.set(distanceY * 0.2)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const variants = {
    primary: `
      bg-gradient-to-r from-eclipse-500 to-eclipse-600
      text-white font-semibold
      shadow-[0_0_30px_-5px_rgba(255,77,0,0.4)]
      hover:shadow-[0_0_40px_-5px_rgba(255,77,0,0.6)]
      active:scale-95
    `,
    secondary: `
      bg-glass-surface border border-glass-border
      text-white font-medium
      hover:border-eclipse-500/50
      hover:bg-glass-highlight
      active:scale-95
    `,
    ghost: `
      bg-transparent
      text-gray-400 font-medium
      hover:text-white
      active:scale-95
    `
  }

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      aria-label={ariaLabel}
      className={`
        relative px-8 py-4 rounded-xl
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {/* Inner glow for primary */}
      {variant === 'primary' && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      )}
      
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  )
}
