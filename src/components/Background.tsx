import { useEffect, useRef } from 'react'

// Emerald accent RGB components
const R = 0, G = 229, B = 160

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    const N = window.innerWidth < 768 ? 48 : 80
    type Particle = { x: number; y: number; vx: number; vy: number; size: number }
    const particles: Particle[] = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      size: Math.random() * 1.3 + 0.4,
    }))

    let mouseX = -1000
    let mouseY = -1000

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })

    const MAX_DIST = 130
    const MOUSE_DIST = 190

    let raf: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Move particles
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
      }

      // Particle-to-particle connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.09
            ctx.strokeStyle = `rgba(${R},${G},${B},${alpha})`
            ctx.lineWidth = 0.6
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }

        // Particle-to-mouse connections
        const mdx = particles[i].x - mouseX
        const mdy = particles[i].y - mouseY
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy)
        if (mdist < MOUSE_DIST) {
          const alpha = (1 - mdist / MOUSE_DIST) * 0.28
          ctx.strokeStyle = `rgba(${R},${G},${B},${alpha})`
          ctx.lineWidth = 0.8
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(mouseX, mouseY)
          ctx.stroke()
        }
      }

      // Draw particles
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${R},${G},${B},0.38)`
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
      {/* Canvas constellation */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* Ambient glow blobs */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          top: '-20%', left: '-10%',
          width: 700, height: 700,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(${R},${G},${B},0.12) 0%, rgba(${R},${G},${B},0.04) 40%, transparent 70%)`,
          filter: 'blur(60px)',
        }}
      />
      <div
        className="fixed pointer-events-none z-0"
        style={{
          bottom: '-15%', right: '-10%',
          width: 600, height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,184,212,0.1) 0%, rgba(0,184,212,0.04) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Radial vignette — keeps edges darker */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 35%, rgba(2,10,6,0.65) 100%)',
        }}
      />

      {/* Noise grain */}
      <div className="noise-overlay" aria-hidden="true" />
    </>
  )
}
