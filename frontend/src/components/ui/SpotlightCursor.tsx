import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function SpotlightCursor() {
  const [isVisible, setIsVisible] = useState(false)
  
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  
  const springConfig = { stiffness: 100, damping: 25 }
  const x = useSpring(cursorX, springConfig)
  const y = useSpring(cursorY, springConfig)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.body.addEventListener('mouseleave', handleMouseLeave)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.body.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [cursorX, cursorY, isVisible])

  return (
    <>
      <motion.div
        className="fixed pointer-events-none z-[9999]"
        style={{
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div 
          className="w-[300px] h-[300px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,77,0,0.06) 0%, rgba(255,77,0,0.02) 40%, transparent 70%)',
          }}
        />
      </motion.div>

      <motion.div
        className="fixed pointer-events-none z-[9999] w-2 h-2 rounded-full"
        style={{
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
          background: 'radial-gradient(circle, rgba(255,77,0,0.5) 0%, transparent 70%)',
        }}
        animate={{ opacity: isVisible ? 0.5 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </>
  )
}
