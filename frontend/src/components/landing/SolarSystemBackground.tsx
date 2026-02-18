import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  speed: number
}

interface Planet {
  orbitRadius: number
  size: number
  speed: number
  color: string
  angle: number
}

export function SolarSystemBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const planetsRef = useRef<Planet[]>([])
  const animationRef = useRef<number>()
  const isPausedRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      const width = window.innerWidth
      const height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      
      starsRef.current = []
      for (let i = 0; i < 200; i++) {
        starsRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 0.02 + 0.01
        })
      }
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const handleVisibilityChange = () => {
      isPausedRef.current = document.hidden
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    const initPlanets = () => {
      planetsRef.current = [
        { orbitRadius: 150, size: 4, speed: 0.008, color: '#8B7355', angle: 0 },
        { orbitRadius: 220, size: 6, speed: 0.006, color: '#E8A87C', angle: Math.PI / 3 },
        { orbitRadius: 300, size: 7, speed: 0.005, color: '#6B93D6', angle: Math.PI * 2 / 3 },
        { orbitRadius: 400, size: 5, speed: 0.004, color: '#C1440E', angle: Math.PI },
        { orbitRadius: 550, size: 18, speed: 0.002, color: '#D4A5A5', angle: Math.PI * 4 / 3 },
        { orbitRadius: 700, size: 15, speed: 0.0015, color: '#F4D03F', angle: Math.PI * 5 / 3 },
      ]
    }

    initPlanets()

    const drawSun = (centerX: number, centerY: number) => {
      const gradient = ctx.createRadialGradient(centerX, centerY, 30, centerX, centerY, 200)
      gradient.addColorStop(0, 'rgba(255, 77, 0, 0.8)')
      gradient.addColorStop(0.2, 'rgba(255, 77, 0, 0.4)')
      gradient.addColorStop(0.5, 'rgba(217, 30, 24, 0.2)')
      gradient.addColorStop(1, 'transparent')
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const sunGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40)
      sunGradient.addColorStop(0, '#FF8800')
      sunGradient.addColorStop(0.5, '#FF4D00')
      sunGradient.addColorStop(1, '#D91E18')
      
      ctx.beginPath()
      ctx.arc(centerX, centerY, 40, 0, Math.PI * 2)
      ctx.fillStyle = sunGradient
      ctx.fill()

      ctx.shadowBlur = 60
      ctx.shadowColor = '#FF4D00'
      ctx.beginPath()
      ctx.arc(centerX, centerY, 35, 0, Math.PI * 2)
      ctx.fillStyle = '#FF4D00'
      ctx.fill()
      ctx.shadowBlur = 0
    }

    const drawOrbits = (centerX: number, centerY: number) => {
      planetsRef.current.forEach((planet) => {
        ctx.beginPath()
        ctx.arc(centerX, centerY, planet.orbitRadius, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255, 77, 0, 0.08)'
        ctx.lineWidth = 1
        ctx.stroke()
      })
    }

    const drawPlanets = (centerX: number, centerY: number) => {
      planetsRef.current.forEach((planet) => {
        const x = centerX + Math.cos(planet.angle) * planet.orbitRadius
        const y = centerY + Math.sin(planet.angle) * planet.orbitRadius

        ctx.shadowBlur = 20
        ctx.shadowColor = planet.color
        
        ctx.beginPath()
        ctx.arc(x, y, planet.size, 0, Math.PI * 2)
        ctx.fillStyle = planet.color
        ctx.fill()
        
        ctx.shadowBlur = 0

        const highlightGradient = ctx.createRadialGradient(
          x - planet.size * 0.3, y - planet.size * 0.3, 0,
          x, y, planet.size
        )
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)')
        highlightGradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.arc(x, y, planet.size, 0, Math.PI * 2)
        ctx.fillStyle = highlightGradient
        ctx.fill()

        planet.angle += planet.speed
      })
    }

    const drawStars = () => {
      starsRef.current.forEach((star) => {
        star.opacity += Math.sin(Date.now() * star.speed) * 0.01
        star.opacity = Math.max(0.2, Math.min(0.9, star.opacity))

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        ctx.fill()

        if (star.size > 1.5) {
          ctx.shadowBlur = 8
          ctx.shadowColor = 'rgba(255, 255, 255, 0.5)'
          ctx.fill()
          ctx.shadowBlur = 0
        }
      })
    }

    const animate = () => {
      if (isPausedRef.current) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      const width = window.innerWidth
      const height = window.innerHeight

      ctx.clearRect(0, 0, width, height)

      const centerX = width * 0.7
      const centerY = height * 0.5

      const bgGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, width * 0.8
      )
      bgGradient.addColorStop(0, 'rgba(255, 77, 0, 0.15)')
      bgGradient.addColorStop(0.3, 'rgba(217, 30, 24, 0.05)')
      bgGradient.addColorStop(0.6, 'rgba(5, 5, 5, 0.8)')
      bgGradient.addColorStop(1, '#050505')
      
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, width, height)

      drawStars()
      drawOrbits(centerX, centerY)
      drawPlanets(centerX, centerY)
      drawSun(centerX, centerY)

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-screen h-screen"
      style={{ background: '#050505' }}
    />
  )
}
