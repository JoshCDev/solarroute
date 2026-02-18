import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface LiquidCrystalButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function LiquidCrystalButton({ 
  children, 
  className = '', 
  onClick, 
  disabled = false,
  variant = 'primary',
  size = 'md'
}: LiquidCrystalButtonProps) {
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  const baseClasses = `
    relative overflow-hidden rounded-xl font-medium
    transition-all duration-300 ease-out
    disabled:opacity-50 disabled:cursor-not-allowed
    ${sizeClasses[size]}
    ${className}
  `

  const variantClasses = {
    primary: `
      bg-white/5 backdrop-blur-xl
      border border-white/20
      text-white
      hover:bg-white/10 hover:border-eclipse-500/50
      hover:shadow-[0_0_30px_rgba(255,77,0,0.3),inset_0_0_20px_rgba(255,77,0,0.1)]
      active:scale-95
    `,
    secondary: `
      bg-transparent
      border border-white/10
      text-gray-300
      hover:bg-white/5 hover:border-white/20
      hover:text-white
      active:scale-95
    `,
    ghost: `
      bg-transparent
      border border-transparent
      text-gray-400
      hover:text-white
      hover:bg-white/5
      active:scale-95
    `
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} group`}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {/* Animated gradient border */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div 
          className="absolute inset-0 rounded-xl"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,77,0,0.3), transparent)',
            animation: 'shimmer 2s infinite'
          }}
        />
      </div>

      {/* Inner glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-eclipse-500/0 via-eclipse-500/0 to-eclipse-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Refraction lines */}
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent transform translate-x-full group-hover:-translate-x-full transition-transform duration-700 delay-100" />
      </div>

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  )
}

// Animated border button variant
export function LiquidCrystalButtonAnimated({ 
  children, 
  className = '', 
  onClick, 
  disabled = false,
  size = 'lg'
}: Omit<LiquidCrystalButtonProps, 'variant'>) {
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-10 py-5 text-lg'
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative group
        ${sizeClasses[size]}
        ${className}
      `}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {/* Animated border container */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        {/* Rotating gradient border */}
        <motion.div
          className="absolute inset-[-100%]"
          style={{
            background: 'conic-gradient(from 0deg, transparent, #FF4D00, #FF8800, #D91E18, transparent)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      {/* Inner background */}
      <div className="absolute inset-[1px] rounded-xl bg-eclipse-900/90 backdrop-blur-xl" />
      
      {/* Glass overlay */}
      <div className="absolute inset-[1px] rounded-xl bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50" />
      
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 rounded-xl bg-eclipse-500/20 blur-xl" />
      </div>

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2 text-white font-semibold">
        {children}
      </span>
    </motion.button>
  )
}
