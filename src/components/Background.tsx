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
    // Stars follow a real magnitude distribution: mostly dim, a few brilliant
    type BgStar = {
      x: number; y: number; r: number; base: number
      phase: number; spd: number
      bright: boolean   // true → draw atmospheric glow halo
      glowR: number     // pre-computed glow radius
    }
    let bgStars: BgStar[] = []

    const initStars = () => {
      const count = Math.floor((canvas.width * canvas.height) / 5200)
      bgStars = Array.from({ length: count }, () => {
        const roll = Math.random()
        let r: number, base: number, bright: boolean, glowR: number
        if (roll < 0.65) {
          // dim  (~65%) — faint background wash
          r     = Math.random() * 0.3 + 0.1
          base  = Math.random() * 0.18 + 0.07
          bright = false; glowR = 0
        } else if (roll < 0.90) {
          // medium (~25%) — clearly visible
          r     = Math.random() * 0.35 + 0.35
          base  = Math.random() * 0.25 + 0.30
          bright = false; glowR = 0
        } else if (roll < 0.98) {
          // bright (~8%) — prominent, slight glow
          r     = Math.random() * 0.45 + 0.65
          base  = Math.random() * 0.20 + 0.60
          bright = true
          glowR = r * 4.5
        } else {
          // very bright (~2%) — standout stars (Sirius-class)
          r     = Math.random() * 0.5 + 1.1
          base  = Math.random() * 0.10 + 0.90
          bright = true
          glowR = r * 6
        }
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r, base, bright, glowR,
          phase: Math.random() * Math.PI * 2,
          spd: Math.random() * 0.012 + 0.003,
        }
      })
    }

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
      // Pick a random angle across all directions, but bias toward
      // diagonals (avoid purely horizontal/vertical — looks unnatural)
      const angle = Math.random() * Math.PI * 2
      // Spawn along the edge that makes sense for the direction
      const spawnX = Math.random() * canvas.width
      const spawnY = Math.random() * canvas.height
      shooters.push({
        x: spawnX,
        y: spawnY,
        dx: Math.cos(angle),
        dy: Math.sin(angle),
        speed: 14 + Math.random() * 10,
        tailLen: 90 + Math.random() * 90,
        life: 55 + Math.floor(Math.random() * 35),
        maxLife: 90,
      })
    }

    // ── nebula offscreen cache ─────────────────────────
    // Rendered once at init/resize, blitted each frame — no per-frame cost.
    // Each nebula = 3 overlapping soft blobs with a blur pass for that
    // dreamy diffuse glow look from real Hubble photography.
    const nebulaCanvas = document.createElement('canvas')
    const nc = nebulaCanvas.getContext('2d')!

    // [outerColor, innerColor] — cool hydrogen rim → hot ionized core
    const NEBULA_PALETTES: [[number,number,number],[number,number,number]][] = [
      [[180, 40,120], [ 40,180,220]],  // Orion:   magenta rim  → teal core
      [[220, 60, 80], [ 50,160,200]],  // Rosette: crimson ring → blue core
      [[200, 80, 30], [ 20,160,150]],  // Pillars: amber dust   → teal core
      [[ 60,100,220], [120, 40,180]],  // Helix:   blue ring    → violet core
      [[200, 60,140], [ 80,120,240]],  // Lagoon:  hot pink     → royal blue
      [[220, 80, 50], [100, 60,200]],  // Veil:    red filament → indigo
      [[160, 50,200], [ 40,160,180]],  // Purple cloud → cerulean
      [[230,140, 40], [180, 50,100]],  // Amber stellar nursery → rose
    ]

    const paintNebulas = () => {
      nebulaCanvas.width  = canvas.width
      nebulaCanvas.height = canvas.height
      nc.clearRect(0, 0, nebulaCanvas.width, nebulaCanvas.height)

      const count = 14 + Math.floor(Math.random() * 6)  // 14-19 small nebulas
      for (let i = 0; i < count; i++) {
        const [outerC, innerC] = NEBULA_PALETTES[Math.floor(Math.random() * NEBULA_PALETTES.length)]
        const cx = Math.random() * nebulaCanvas.width
        const cy = Math.random() * nebulaCanvas.height
        const baseR = 60 + Math.random() * 100   // 60-160 px — small and tight

        nc.filter = `blur(${14 + Math.random() * 14}px)`

        // Outer cloud
        const outerR = baseR * (1.1 + Math.random() * 0.4)
        const og = nc.createRadialGradient(cx, cy, 0, cx, cy, outerR)
        const [or,og2,ob] = outerC
        og.addColorStop(0,   `rgba(${or},${og2},${ob},0.28)`)
        og.addColorStop(0.5, `rgba(${or},${og2},${ob},0.12)`)
        og.addColorStop(1,   `rgba(${or},${og2},${ob},0)`)
        nc.beginPath(); nc.arc(cx, cy, outerR, 0, Math.PI*2)
        nc.fillStyle = og; nc.fill()

        // Inner hot core
        const ox = (Math.random()-0.5) * baseR * 0.4
        const oy = (Math.random()-0.5) * baseR * 0.4
        const innerR = baseR * (0.45 + Math.random() * 0.25)
        const ig = nc.createRadialGradient(cx+ox, cy+oy, 0, cx+ox, cy+oy, innerR)
        const [ir,ig2,ib] = innerC
        ig.addColorStop(0,   `rgba(${ir},${ig2},${ib},0.38)`)
        ig.addColorStop(0.5, `rgba(${ir},${ig2},${ib},0.15)`)
        ig.addColorStop(1,   `rgba(${ir},${ig2},${ib},0)`)
        nc.beginPath(); nc.arc(cx+ox, cy+oy, innerR, 0, Math.PI*2)
        nc.fillStyle = ig; nc.fill()
      }

      nc.filter = 'none'
    }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars()
      paintNebulas()
    }
    // resize FIRST so canvas.width/height are correct before particles are placed
    resize()

    // ── moving particles — initialized AFTER resize so positions use full viewport ──
    const N = window.innerWidth < 768 ? 40 : 68
    type Particle = { x: number; y: number; vx: number; vy: number; size: number }
    const particles: Particle[] = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      size: Math.random() * 1.1 + 0.3,
    }))
    window.addEventListener('resize', resize, { passive: true })

    let mouseX = -1000, mouseY = -1000
    const onMouseMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY }
    window.addEventListener('mousemove', onMouseMove, { passive: true })

    const MAX_DIST = 130
    const MOUSE_DIST = 210
    // star-white for the network particles
    const PR = 160, PG = 185, PB = 255
    let frame = 0
    let raf: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      // ── blit pre-rendered nebulas (single texture draw — no per-frame gradients) ──
      ctx.drawImage(nebulaCanvas, 0, 0)

      // ── draw static starfield ──
      for (const s of bgStars) {
        const twinkle = 0.7 + 0.3 * Math.sin(frame * s.spd + s.phase)
        const alpha = s.base * twinkle

        // Bright stars: draw atmospheric glow halo first (underneath the point)
        if (s.bright && s.glowR > 0) {
          const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.glowR)
          grd.addColorStop(0,   `rgba(200,220,255,${(alpha * 0.55).toFixed(3)})`)
          grd.addColorStop(0.4, `rgba(180,210,255,${(alpha * 0.18).toFixed(3)})`)
          grd.addColorStop(1,   'rgba(160,200,255,0)')
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.glowR, 0, Math.PI * 2)
          ctx.fillStyle = grd
          ctx.fill()
        }

        // Star point
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`
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
          const alpha = (1 - mdist / MOUSE_DIST) * 0.38
          ctx.strokeStyle = `rgba(200,225,255,${alpha})`
          ctx.lineWidth = 0.9
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
