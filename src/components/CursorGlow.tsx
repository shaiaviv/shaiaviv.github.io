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
      style={{
        x: springX,
        y: springY,
        translateX: '-50%',
        translateY: '-50%',
      }}
      aria-hidden="true"
    >
      <div
        className="w-72 h-72 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(34, 211, 238, 0.04) 40%, transparent 70%)',
          filter: 'blur(1px)',
        }}
      />
    </motion.div>
  )
}
