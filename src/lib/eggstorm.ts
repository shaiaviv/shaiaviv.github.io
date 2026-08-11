/**
 * An infestation of easter eggs: two dozen of them rain in, ricochet off the
 * walls, the floor and each other for a few seconds, then pop one by one.
 *
 * Self-contained on its own throwaway canvas, in the same spirit as
 * lib/confetti.ts — nothing to mount, nothing to clean up, and it can be fired
 * from anywhere including the console.
 *
 * The eggs are drawn as filled bezier shapes with the site's ink outline rather
 * than as 🥚 glyphs, so they belong to the same sticker-book world as the rest of
 * the page instead of looking like emoji dropped on top of it.
 */

const COLORS = ['#6c5ce7', '#ff6b57', '#ffc23c', '#06d6a0']
const INK = '#171310'

const COUNT = 24
const GRAVITY = 0.42
const RESTITUTION = 0.72   // energy kept on a bounce
const FLOOR_FRICTION = 0.86
const BOUNCE_MS = 4200     // how long they get to make a nuisance of themselves
const POP_STAGGER = 55     // ms between pops, so they go off as a cascade

interface Egg {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  rot: number
  vrot: number
  color: string
  spots: { dx: number; dy: number; rr: number }[]
  popAt: number
  popped: boolean
}

interface Shard {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  life: number
}

/**
 * An egg: narrow but ROUNDED at the top, wide and round at the bottom, widest
 * just below centre.
 *
 * The control points leaving the apex and the base are horizontal, which is what
 * keeps both ends smooth — a first attempt sent them diagonally and produced a
 * sharp point, so the whole storm looked like falling teardrops. The asymmetry
 * comes from the shoulders (-0.35h against 0.7h), not from the tips.
 */
function eggPath(ctx: CanvasRenderingContext2D, r: number) {
  const w = r
  const h = r * 1.28
  ctx.beginPath()
  ctx.moveTo(0, -h)
  ctx.bezierCurveTo(w * 0.55, -h, w, -h * 0.35, w, h * 0.1)
  ctx.bezierCurveTo(w, h * 0.7, w * 0.6, h, 0, h)
  ctx.bezierCurveTo(-w * 0.6, h, -w, h * 0.7, -w, h * 0.1)
  ctx.bezierCurveTo(-w, -h * 0.35, -w * 0.55, -h, 0, -h)
  ctx.closePath()
}

export function eggStorm() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const canvas = document.createElement('canvas')
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const W = window.innerWidth
  const H = window.innerHeight
  canvas.width = W * dpr
  canvas.height = H * dpr
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    zIndex: '10000',
    pointerEvents: 'none',
  })
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const start = performance.now()

  const eggs: Egg[] = Array.from({ length: COUNT }, (_, i) => {
    const r = 13 + Math.random() * 9
    return {
      // spawned above the fold and rained in, which reads as an invasion rather
      // than as a burst from one spot
      x: 40 + Math.random() * (W - 80),
      y: -40 - Math.random() * H * 0.6,
      vx: (Math.random() - 0.5) * 7,
      vy: 1 + Math.random() * 4,
      r,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.16,
      color: COLORS[i % COLORS.length],
      spots: Array.from({ length: 2 + Math.floor(Math.random() * 2) }, () => ({
        dx: (Math.random() - 0.5) * r * 0.9,
        dy: (Math.random() - 0.5) * r * 1.3,
        rr: r * (0.16 + Math.random() * 0.12),
      })),
      popAt: BOUNCE_MS + i * POP_STAGGER + Math.random() * 120,
      popped: false,
    }
  })

  let shards: Shard[] = []
  let raf = 0

  const pop = (e: Egg) => {
    e.popped = true
    for (let i = 0; i < 9; i++) {
      const a = (Math.PI * 2 * i) / 9 + Math.random() * 0.4
      const speed = 2.4 + Math.random() * 4
      shards.push({
        x: e.x,
        y: e.y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 1.5,
        size: 2 + Math.random() * 3.5,
        color: e.color,
        life: 1,
      })
    }
  }

  const tick = () => {
    const now = performance.now() - start
    ctx.clearRect(0, 0, W, H)

    for (const e of eggs) {
      if (e.popped) continue
      if (now >= e.popAt) { pop(e); continue }

      e.vy += GRAVITY
      e.x += e.vx
      e.y += e.vy
      e.rot += e.vrot

      // walls and floor
      if (e.x - e.r < 0) { e.x = e.r; e.vx = Math.abs(e.vx) * RESTITUTION; e.vrot = Math.abs(e.vrot) }
      else if (e.x + e.r > W) { e.x = W - e.r; e.vx = -Math.abs(e.vx) * RESTITUTION; e.vrot = -Math.abs(e.vrot) }
      const floor = H - e.r * 1.3
      if (e.y > floor) {
        e.y = floor
        e.vy = -Math.abs(e.vy) * RESTITUTION
        e.vx *= FLOOR_FRICTION
        e.vrot *= FLOOR_FRICTION
      }
    }

    // egg-on-egg contact. Only 24 of them, so the naive O(n²) pass is free — and
    // it is what makes the pile feel alive rather than like independent sprites.
    for (let i = 0; i < eggs.length; i++) {
      const a = eggs[i]
      if (a.popped) continue
      for (let j = i + 1; j < eggs.length; j++) {
        const b = eggs[j]
        if (b.popped) continue
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.hypot(dx, dy)
        const min = a.r + b.r
        if (dist === 0 || dist >= min) continue
        const nx = dx / dist
        const ny = dy / dist
        const push = (min - dist) / 2
        a.x -= nx * push
        a.y -= ny * push
        b.x += nx * push
        b.y += ny * push
        // exchange the velocity along the contact normal
        const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny
        if (rel < 0) {
          const imp = rel * RESTITUTION
          a.vx += nx * imp
          a.vy += ny * imp
          b.vx -= nx * imp
          b.vy -= ny * imp
          a.vrot += rel * 0.004
          b.vrot -= rel * 0.004
        }
      }
    }

    for (const e of eggs) {
      if (e.popped) continue
      ctx.save()
      ctx.translate(e.x, e.y)
      ctx.rotate(e.rot)
      eggPath(ctx, e.r)
      ctx.fillStyle = e.color
      ctx.fill()
      ctx.lineWidth = 2.5
      ctx.strokeStyle = INK
      ctx.stroke()
      ctx.globalAlpha = 0.35
      ctx.fillStyle = '#fdf9ef'
      for (const s of e.spots) {
        ctx.beginPath()
        ctx.arc(s.dx, s.dy, s.rr, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      ctx.restore()
    }

    for (const s of shards) {
      s.vy += GRAVITY * 0.5
      s.x += s.vx
      s.y += s.vy
      s.vx *= 0.97
      s.life -= 0.024
      if (s.life <= 0) continue
      ctx.globalAlpha = Math.max(s.life, 0)
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
      ctx.fillStyle = s.color
      ctx.fill()
    }
    ctx.globalAlpha = 1
    shards = shards.filter((s) => s.life > 0)

    if (eggs.some((e) => !e.popped) || shards.length) {
      raf = requestAnimationFrame(tick)
    } else {
      canvas.remove()
    }
  }

  raf = requestAnimationFrame(tick)

  // safety net in case the tab is backgrounded mid-storm
  setTimeout(() => {
    cancelAnimationFrame(raf)
    canvas.remove()
  }, BOUNCE_MS + COUNT * POP_STAGGER + 4000)
}
