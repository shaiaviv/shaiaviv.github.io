import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useScroll, useTransform } from 'framer-motion'
import { unlockAchievement, ACHIEVEMENTS } from '../lib/achievements'

const BALL_COLORS = [
  'rgba(108, 92, 231, 0.55)',  // violet
  'rgba(255, 107, 87, 0.5)',   // coral
  'rgba(255, 194, 60, 0.55)',  // sunshine
  'rgba(6, 214, 160, 0.45)',   // mint
]
// Solid counterparts of BALL_COLORS (same index) for the crisp, unblurred pop particles
const PARTICLE_COLORS = ['#6c5ce7', '#ff6b57', '#ffc23c', '#06d6a0']

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

  // ── ambient "desk toy" balls — soft gummy circles that drift and nudge away
  // from the cursor. Catch one and click it dead-on and it pops, exploding and
  // dissolving into the background before quietly reforming elsewhere — a
  // hidden easter egg with no hover hint (the canvas stays pointer-events-none,
  // so cursor never changes) and no way to trigger it by accident, since the
  // achievement only unlocks on an actual click hit, never on proximity alone.
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    type Ball = {
      x: number; y: number; vx: number; vy: number; r: number; baseR: number; color: string; colorIndex: number
      state: 'idle' | 'popping' | 'spawning'
      t: number
    }
    let balls: Ball[] = []

    type Particle = { x: number; y: number; vx: number; vy: number; size: number; color: string; life: number }
    let particles: Particle[] = []

    const spawnBall = (): Ball => {
      const colorIndex = Math.floor(Math.random() * BALL_COLORS.length)
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 40 + Math.random() * 70,
        baseR: 0,
        color: BALL_COLORS[colorIndex],
        colorIndex,
        state: 'idle',
        t: 0,
      }
    }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      const count = window.innerWidth < 768 ? 6 : 11
      balls = Array.from({ length: count }, spawnBall).map((b) => ({ ...b, baseR: b.r }))
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

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
      return () => window.removeEventListener('resize', resize)
    }

    // Pop is two distinct phases: a quick punchy BURST (grows fast, sharpens
    // into focus) immediately followed by a DISSOLVE that only starts fading
    // once the burst has fully landed — the delay is what sells the "pop".
    const BURST_FRAMES = 14
    const FADE_FRAMES = 26
    const POP_FRAMES = BURST_FRAMES + FADE_FRAMES
    const SPAWN_FRAMES = 40
    const REPEL_DIST = 220

    let mouseX = -2000, mouseY = -2000
    const onMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY }
    window.addEventListener('mousemove', onMove, { passive: true })

    const onClick = (e: MouseEvent) => {
      for (const b of balls) {
        if (b.state !== 'idle') continue
        const dx = e.clientX - b.x, dy = e.clientY - b.y
        if (Math.sqrt(dx * dx + dy * dy) < b.r) {
          b.state = 'popping'
          b.t = 0
          unlockAchievement(ACHIEVEMENTS.backgroundBalls)

          // sharp, unblurred particles flying outward — read clearly against
          // the soft blurred blobs, the main thing that makes the pop register
          const particleColor = PARTICLE_COLORS[b.colorIndex]
          const count = 16
          for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
            const speed = 3 + Math.random() * 4.5
            particles.push({
              x: b.x, y: b.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              size: 4 + Math.random() * 6,
              color: particleColor,
              life: 1,
            })
          }
          break
        }
      }
    }
    window.addEventListener('click', onClick)

    let raf: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const b of balls) {
        if (b.state === 'popping') {
          b.t += 1
          if (b.t >= POP_FRAMES) {
            Object.assign(b, spawnBall(), { baseR: 0, state: 'spawning', t: 0 })
            b.baseR = b.r
          } else if (b.t <= BURST_FRAMES) {
            // Phase 1 — burst: fast growth, full opacity, blur sharpens into focus
            const p = b.t / BURST_FRAMES
            const r = b.baseR * (1 + p * 1.5)
            const blurPx = 30 - p * 22
            ctx.beginPath()
            ctx.arc(b.x, b.y, r, 0, Math.PI * 2)
            ctx.fillStyle = b.color
            ctx.filter = `blur(${blurPx}px)`
            ctx.fill()
          } else {
            // Phase 2 — dissolve: only starts once the burst has fully landed
            const p = (b.t - BURST_FRAMES) / FADE_FRAMES
            const r = b.baseR * 2.5 * (1 + p * 0.35)
            const blurPx = 8 + p * 55
            ctx.globalAlpha = 1 - p
            ctx.beginPath()
            ctx.arc(b.x, b.y, r, 0, Math.PI * 2)
            ctx.fillStyle = b.color
            ctx.filter = `blur(${blurPx}px)`
            ctx.fill()
            ctx.globalAlpha = 1
          }
          continue
        }

        const dx = b.x - mouseX, dy = b.y - mouseY
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

        b.x += b.vx
        b.y += b.vy

        // bounce off the viewport edges instead of wrapping — a repelled
        // ball should never leave the screen, just ricochet back in
        if (b.x - b.r < 0) { b.x = b.r; b.vx = Math.abs(b.vx) }
        else if (b.x + b.r > canvas.width) { b.x = canvas.width - b.r; b.vx = -Math.abs(b.vx) }
        if (b.y - b.r < 0) { b.y = b.r; b.vy = Math.abs(b.vy) }
        else if (b.y + b.r > canvas.height) { b.y = canvas.height - b.r; b.vy = -Math.abs(b.vy) }

        let alpha = 1
        if (b.state === 'spawning') {
          b.t += 1 / SPAWN_FRAMES
          if (b.t >= 1) { b.state = 'idle'; b.t = 0 }
          else alpha = b.t
        }

        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fillStyle = b.color
        ctx.filter = 'blur(30px)'
        ctx.fill()
        ctx.globalAlpha = 1
      }
      ctx.filter = 'none'

      // pop particle bursts — sharp, unblurred, drawn on top of the blurred blobs
      if (particles.length) {
        particles = particles.filter((p) => p.life > 0)
        for (const p of particles) {
          p.x += p.vx
          p.y += p.vy
          p.vx *= 0.94
          p.vy *= 0.94
          p.vy += 0.08
          p.life -= 0.028
          if (p.life <= 0) continue
          ctx.globalAlpha = Math.max(p.life, 0)
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.fill()
        }
        ctx.globalAlpha = 1
      }

      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('click', onClick)
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
