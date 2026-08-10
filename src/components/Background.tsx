import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useScroll, useTransform } from 'framer-motion'

const BALL_COLORS = [
  'rgba(108, 92, 231, 0.55)',  // violet
  'rgba(255, 107, 87, 0.5)',   // coral
  'rgba(255, 194, 60, 0.55)',  // sunshine
  'rgba(6, 214, 160, 0.45)',   // mint
]

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Scroll/mouse-linked transforms on position:fixed blobs recompute every
  // scroll frame — cheap on desktop, but combined with a fixed layer it
  // reads as stutter on mobile GPUs, so mobile blobs render statically.
  const isMobile = window.matchMedia('(max-width: 768px)').matches

  const { scrollY } = useScroll()
  const blob1Y = useTransform(scrollY, [0, 2000], [0, -160])
  const blob2Y = useTransform(scrollY, [0, 2000], [0, 140])
  const blob3Y = useTransform(scrollY, [0, 2000], [0, -100])

  const rawMouseX = useMotionValue(0.5)
  const smoothMouseX = useSpring(rawMouseX, { stiffness: 40, damping: 15 })
  const blob1X = useTransform(smoothMouseX, [0, 1], [-40, 40])
  const blob2X = useTransform(smoothMouseX, [0, 1], [30, -30])
  const blob3X = useTransform(smoothMouseX, [0, 1], [-25, 25])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      rawMouseX.set(e.clientX / window.innerWidth)
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [rawMouseX])

  // ── ambient "desk toy" balls — soft gummy circles that drift and nudge away from the cursor ──
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    type Ball = { x: number; y: number; vx: number; vy: number; r: number; color: string }
    let balls: Ball[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      const count = window.innerWidth < 768 ? 6 : 11
      balls = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 40 + Math.random() * 70,
        color: BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)],
      }))
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    let mouseX = -2000, mouseY = -2000
    const onMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY }
    window.addEventListener('mousemove', onMove, { passive: true })

    const drawStatic = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const b of balls) {
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fillStyle = b.color
        ctx.filter = 'blur(30px)'
        ctx.fill()
      }
      ctx.filter = 'none'
    }

    if (reduceMotion || isMobile) {
      drawStatic()
      return () => {
        window.removeEventListener('resize', resize)
        window.removeEventListener('mousemove', onMove)
      }
    }

    let raf: number
    const REPEL_DIST = 220

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const b of balls) {
        b.x += b.vx
        b.y += b.vy

        const dx = b.x - mouseX
        const dy = b.y - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < REPEL_DIST) {
          const force = (1 - dist / REPEL_DIST) * 0.6
          b.vx += (dx / (dist || 1)) * force
          b.vy += (dy / (dist || 1)) * force
        }

        // gentle speed cap so repelled balls settle back down
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy)
        const maxSpeed = 2.2
        if (speed > maxSpeed) {
          b.vx = (b.vx / speed) * maxSpeed
          b.vy = (b.vy / speed) * maxSpeed
        }
        b.vx *= 0.985
        b.vy *= 0.985

        if (b.x < -b.r) b.x = canvas.width + b.r
        if (b.x > canvas.width + b.r) b.x = -b.r
        if (b.y < -b.r) b.y = canvas.height + b.r
        if (b.y > canvas.height + b.r) b.y = -b.r

        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fillStyle = b.color
        ctx.filter = 'blur(30px)'
        ctx.fill()
      }
      ctx.filter = 'none'

      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <>
      {/* Dot-grid paper texture */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(23,19,16,0.14) 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden="true"
      />

      {/* Ambient gummy balls */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-70" aria-hidden="true" />

      {/* Violet blob — top-left */}
      <motion.div
        className="fixed pointer-events-none z-0"
        style={{
          top: '-15%', left: '-8%',
          width: 620, height: 620,
          borderRadius: '42% 58% 65% 35% / 45% 40% 60% 55%',
          background: 'radial-gradient(circle, rgba(108,92,231,0.16) 0%, rgba(108,92,231,0.04) 45%, transparent 70%)',
          filter: 'blur(50px)',
          ...(isMobile ? {} : { x: blob1X, y: blob1Y }),
        }}
      />

      {/* Coral blob — bottom-right */}
      <motion.div
        className="fixed pointer-events-none z-0"
        style={{
          bottom: '-12%', right: '-8%',
          width: 560, height: 560,
          borderRadius: '58% 42% 38% 62% / 55% 60% 40% 45%',
          background: 'radial-gradient(circle, rgba(255,107,87,0.14) 0%, rgba(255,107,87,0.03) 45%, transparent 70%)',
          filter: 'blur(50px)',
          ...(isMobile ? {} : { x: blob2X, y: blob2Y }),
        }}
      />

      {/* Sunshine blob — mid right */}
      <motion.div
        className="fixed pointer-events-none z-0 hidden md:block"
        style={{
          top: '35%', right: '15%',
          width: 340, height: 340,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,194,60,0.14) 0%, transparent 70%)',
          filter: 'blur(40px)',
          ...(isMobile ? {} : { x: blob3X, y: blob3Y }),
        }}
      />

      <div className="noise-overlay" aria-hidden="true" />
    </>
  )
}
