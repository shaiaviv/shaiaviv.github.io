import { useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const DOTS = [
  { size: 14, color: '#6c5ce7', stiffness: 700, damping: 32 },
  { size: 11, color: '#ff6b57', stiffness: 420, damping: 30 },
  { size: 9,  color: '#ffc23c', stiffness: 300, damping: 28 },
  { size: 7,  color: '#06d6a0', stiffness: 220, damping: 26 },
]

/** A small swarm of colorful dots that chase the cursor with staggered spring lag. */
export default function CursorGlow() {
  const mouseX = useMotionValue(-200)
  const mouseY = useMotionValue(-200)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  // Each dot's spring chases the previous dot's motion value — a lagging chain.
  const x0 = useSpring(mouseX, { stiffness: DOTS[0].stiffness, damping: DOTS[0].damping })
  const y0 = useSpring(mouseY, { stiffness: DOTS[0].stiffness, damping: DOTS[0].damping })
  const x1 = useSpring(x0, { stiffness: DOTS[1].stiffness, damping: DOTS[1].damping })
  const y1 = useSpring(y0, { stiffness: DOTS[1].stiffness, damping: DOTS[1].damping })
  const x2 = useSpring(x1, { stiffness: DOTS[2].stiffness, damping: DOTS[2].damping })
  const y2 = useSpring(y1, { stiffness: DOTS[2].stiffness, damping: DOTS[2].damping })
  const x3 = useSpring(x2, { stiffness: DOTS[3].stiffness, damping: DOTS[3].damping })
  const y3 = useSpring(y2, { stiffness: DOTS[3].stiffness, damping: DOTS[3].damping })

  const positions = [
    { x: x0, y: y0 },
    { x: x1, y: y1 },
    { x: x2, y: y2 },
    { x: x3, y: y3 },
  ]

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998] hidden md:block" aria-hidden="true">
      {DOTS.map((dot, i) => (
        <motion.div
          key={i}
          className="absolute top-0 left-0 rounded-full"
          style={{
            width: dot.size,
            height: dot.size,
            backgroundColor: dot.color,
            x: positions[i].x,
            y: positions[i].y,
            translateX: '-50%',
            translateY: '-50%',
            opacity: 0.85 - i * 0.15,
          }}
        />
      ))}
    </div>
  )
}
