import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useScroll, useTransform } from 'framer-motion'

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const { scrollY } = useScroll()
  const blob1Y = useTransform(scrollY, [0, 2000], [0, -180])
  const blob2Y = useTransform(scrollY, [0, 2000], [0, 120])

  const rawMouseX = useMotionValue(0.5)
  const smoothMouseX = useSpring(rawMouseX, { stiffness: 40, damping: 15 })
  const blob1X = useTransform(smoothMouseX, [0, 1], [-50, 50])
  const blob2X = useTransform(smoothMouseX, [0, 1], [40, -40])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      rawMouseX.set(e.clientX / window.innerWidth)
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [rawMouseX])

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    // ── static starfield ──────────────────────────────
    type BgStar = { x: number; y: number; r: number; base: number; phase: number; spd: number }
    let bgStars: BgStar[] = []

    const initStars = () => {
      const count = Math.floor((canvas.width * canvas.height) / 6000)
      bgStars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 0.85 + 0.15,
        base: Math.random() * 0.55 + 0.15,
        phase: Math.random() * Math.PI * 2,
        spd: Math.random() * 0.018 + 0.004,
      }))
    }

    // ── moving particles (constellation network) ──────
    const N = window.innerWidth < 768 ? 40 : 68
    type Particle = { x: number; y: number; vx: number; vy: number; size: number }
    const particles: Particle[] = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      size: Math.random() * 1.1 + 0.3,
    }))

    // ── shooting stars ────────────────────────────────
    type ShootingStar = {
      x: number; y: number
      dx: number; dy: number
      speed: number; tailLen: number
      life: number; maxLife: number
    }
    let shooters: ShootingStar[] = []
    let nextShoot = 200 + Math.random() * 280  // frames until first one

    const spawnShooter = () => {
      // Start from upper-left region, travel down-right at varying angles
      const angle = 0.3 + Math.random() * 0.45   // ~17°–43° below horizontal
      shooters.push({
        x: Math.random() * canvas.width * 0.65,
        y: Math.random() * canvas.height * 0.45,
        dx: Math.cos(angle),
        dy: Math.sin(angle),
        speed: 14 + Math.random() * 10,
        tailLen: 90 + Math.random() * 90,
        life: 55 + Math.floor(Math.random() * 35),
        maxLife: 90,
      })
    }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars()
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    let mouseX = -1000, mouseY = -1000
    const onMouseMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY }
    window.addEventListener('mousemove', onMouseMove, { passive: true })

    const MAX_DIST = 120
    const MOUSE_DIST = 180
    // star-white for the network particles
    const PR = 160, PG = 185, PB = 255
    let frame = 0
    let raf: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      // ── draw static starfield ──
      for (const s of bgStars) {
        const twinkle = 0.7 + 0.3 * Math.sin(frame * s.spd + s.phase)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${(s.base * twinkle).toFixed(3)})`
        ctx.fill()
      }

      // ── spawn & draw shooting stars ──
      if (frame >= nextShoot) {
        spawnShooter()
        nextShoot = frame + 200 + Math.random() * 340   // ~3–9 s at 60 fps
      }
      shooters = shooters.filter(s => s.life > 0)
      for (const s of shooters) {
        const elapsed = s.maxLife - s.life
        const hx = s.x + s.dx * s.speed * elapsed
        const hy = s.y + s.dy * s.speed * elapsed
        const tx = hx - s.dx * s.tailLen
        const ty = hy - s.dy * s.tailLen
        const op = s.life / s.maxLife

        const grad = ctx.createLinearGradient(tx, ty, hx, hy)
        grad.addColorStop(0, 'rgba(255,255,255,0)')
        grad.addColorStop(0.7, `rgba(200,220,255,${(op * 0.7).toFixed(3)})`)
        grad.addColorStop(1,   `rgba(255,255,255,${op.toFixed(3)})`)

        ctx.beginPath()
        ctx.moveTo(tx, ty)
        ctx.lineTo(hx, hy)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.5
        ctx.stroke()
        s.life--
      }

      // ── move & draw constellation network ──
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.07
            ctx.strokeStyle = `rgba(${PR},${PG},${PB},${alpha})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
        const mdx = particles[i].x - mouseX
        const mdy = particles[i].y - mouseY
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy)
        if (mdist < MOUSE_DIST) {
          const alpha = (1 - mdist / MOUSE_DIST) * 0.22
          ctx.strokeStyle = `rgba(${PR},${PG},${PB},${alpha})`
          ctx.lineWidth = 0.7
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(mouseX, mouseY)
          ctx.stroke()
        }
      }

      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${PR},${PG},${PB},0.32)`
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true" />

      {/* Deep purple nebula — top-left */}
      <motion.div
        className="fixed pointer-events-none z-0"
        style={{
          top: '-20%', left: '-10%',
          width: 700, height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(100,60,200,0.14) 0%, rgba(80,40,180,0.05) 40%, transparent 70%)',
          filter: 'blur(70px)',
          x: blob1X,
          y: blob1Y,
        }}
      />

      {/* Deep blue nebula — bottom-right */}
      <motion.div
        className="fixed pointer-events-none z-0"
        style={{
          bottom: '-15%', right: '-10%',
          width: 620, height: 620,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(40,90,255,0.11) 0%, rgba(20,60,200,0.04) 40%, transparent 70%)',
          filter: 'blur(70px)',
          x: blob2X,
          y: blob2Y,
        }}
      />

      {/* Vignette */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 35%, rgba(3,4,14,0.7) 100%)',
        }}
      />

      <div className="noise-overlay" aria-hidden="true" />
    </>
  )
}
