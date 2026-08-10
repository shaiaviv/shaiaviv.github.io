const COLORS = ['#6c5ce7', '#ff6b57', '#ffc23c', '#06d6a0', '#ff9f43']

interface Particle {
  x: number; y: number
  vx: number; vy: number
  rot: number; vrot: number
  size: number
  color: string
  shape: 'rect' | 'circle'
  life: number
}

/** Fires a one-shot confetti burst from a screen point. Self-cleans, no dependencies. */
export function burstConfetti(originX: number, originY: number, count = 60) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const canvas = document.createElement('canvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  canvas.style.position = 'fixed'
  canvas.style.inset = '0'
  canvas.style.zIndex = '10000'
  canvas.style.pointerEvents = 'none'
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')!

  const particles: Particle[] = Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2
    const speed = 4 + Math.random() * 9
    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.4,
      size: 5 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
      life: 1,
    }
  })

  let raf: number
  const gravity = 0.28

  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    let alive = false

    for (const p of particles) {
      if (p.life <= 0) continue
      p.vy += gravity
      p.vx *= 0.992
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vrot
      p.life -= 0.012
      if (p.y > canvas.height + 40) p.life = 0
      if (p.life <= 0) continue
      alive = true

      ctx.save()
      ctx.globalAlpha = Math.max(p.life, 0)
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.fillStyle = p.color
      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66)
      } else {
        ctx.beginPath()
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }

    if (alive) {
      raf = requestAnimationFrame(tick)
    } else {
      canvas.remove()
    }
  }

  raf = requestAnimationFrame(tick)

  // safety net in case the tab is backgrounded mid-animation
  setTimeout(() => {
    cancelAnimationFrame(raf)
    canvas.remove()
  }, 4000)
}
