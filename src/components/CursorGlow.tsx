import { useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CursorGlow() {
  const cursorX = useMotionValue(-200)
  const cursorY = useMotionValue(-200)

  const springX = useSpring(cursorX, { stiffness: 120, damping: 20, restDelta: 0.001 })
  const springY = useSpring(cursorY, { stiffness: 120, damping: 20, restDelta: 0.001 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [cursorX, cursorY])

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9998]"
      style={{ x: springX, y: springY, translateX: '-50%', translateY: '-50%' }}
      aria-hidden="true"
    >
      <div
        className="w-80 h-80 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0,229,160,0.06) 0%, rgba(0,184,212,0.03) 45%, transparent 70%)',
        }}
      />
    </motion.div>
  )
}
