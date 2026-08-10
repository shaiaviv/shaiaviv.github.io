import { useEffect, useRef } from 'react'
import { unlockAchievement, ACHIEVEMENTS } from '../lib/achievements'
import { isUnlocked } from '../lib/unlocks'
import { recogniseShape, alignTargets, type Vertex, type ShapeKind } from '../lib/shapes'
import { burstConfetti } from '../lib/confetti'

// Same swarm the cursor drags around (see CursorGlow) — the trail has to read
// as "those dots, left behind", so colors and sizes are deliberately shared.
const DOT_COLORS = ['#6c5ce7', '#ff6b57', '#ffc23c', '#06d6a0']
const DOT_SIZES = [14, 11, 9, 12]

const DOT_SPACING = 22   // px of travel between beads — also the springs' rest length
const PATH_STEP = 3      // px between recorded polyline vertices
const MAX_DOTS = 240     // ~5m of drawing; past this the stroke stops growing (see onMove)

// Release physics, in arc-length space
const STIFF = 0.16
const DAMP = 0.8
const MIN_SPEED = 13     // px/frame ceiling on travel — see the note in tick()
const MAX_SPEED = 40     // ...raised for long scribbles so they don't crawl
const TRAVEL_FRAMES = 90 // target frames for the tail dot's trip down the path
const LEADER_KICK = 2.4  // the click itself, shoving the first domino
const GAP_DECAY = 0.82   // how fast a dot's rest gap collapses once its turn comes
const WAVE_FRAMES = 60   // total budget for the cascade to reach the tail, any length
const OFF_DECAY = 0.9    // hand-drawn jitter unwinding back onto the path
const LIFE_DRAIN = 0.055

// Shape-snap mode (unlocked by opening a project's screenshots)
const MORPH_STIFF = 0.16
const MORPH_DAMP = 0.8
const MORPH_HOLD_FRAMES = 62  // fly into formation, then hold it long enough to read
const MIN_SHAPE_SIZE = 70     // px — smaller than this is a scribble, not a drawing

/** Anything interactive, or opted out — never a drawing surface, anywhere in its box. */
const NEVER_DRAW =
  'a, button, input, textarea, select, label, canvas, svg, img, video, iframe, form, nav, header, footer, ' +
  '[role="link"], [role="button"], [contenteditable], [data-no-doodle]'

/** Text carriers, which only block where their glyphs actually are — see overText. */
const TEXT_TAGS = 'h1, h2, h3, h4, h5, h6, p, span, li, code, strong, em, b, i, blockquote'

const TEXT_PAD = 3

/**
 * Is the point on this element's rendered TEXT, rather than merely inside its
 * box? A text block is a full-width rectangle with ragged contents: the gap to
 * the right of a short last line, and the leading between lines, all hit-test as
 * the paragraph while being visually bare page. Treating the whole box as text
 * meant a drag starting in that blank space refused to draw AND let the browser
 * start a selection, so the gesture selected a sentence instead of drawing.
 *
 * Range line rects are the glyphs' real footprint, which is what the visitor is
 * actually aiming at — plus a few px of slack so grabbing the text stays easy.
 */
function overText(el: Element, x: number, y: number): boolean {
  const range = document.createRange()
  range.selectNodeContents(el)
  for (const r of range.getClientRects()) {
    if (r.width === 0 || r.height === 0) continue
    if (
      x >= r.left - TEXT_PAD && x <= r.right + TEXT_PAD &&
      y >= r.top - TEXT_PAD && y <= r.bottom + TEXT_PAD
    ) return true
  }
  return false
}

/**
 * True only for the page's own empty scaffolding. Rather than enumerate every
 * card class (which rots the moment a new one is added), walk up from the hit
 * target: if anything between it and the doodle root paints a background,
 * border, or shadow, the click landed ON something, not on the backdrop.
 */
function isBackdrop(target: EventTarget | null, x: number, y: number): boolean {
  if (!(target instanceof Element)) return false
  if (target.closest(NEVER_DRAW)) return false

  for (let el: Element | null = target; el; el = el.parentElement) {
    if (el.hasAttribute('data-doodle-root') || el === document.body) break
    if (el.matches(TEXT_TAGS) && overText(el, x, y)) return false
  }

  for (let el: Element | null = target; el; el = el.parentElement) {
    if (el.hasAttribute('data-doodle-root') || el === document.body) return true
    const s = getComputedStyle(el)
    const painted = s.backgroundColor !== 'transparent' && s.backgroundColor !== 'rgba(0, 0, 0, 0)'
    if (painted || s.boxShadow !== 'none' || parseFloat(s.borderTopWidth) > 0) return false
  }
  return true
}

type Dot = {
  s: number        // position along the path, in arc length
  v: number        // arc-length velocity, release phase only
  seg: number      // cached polyline segment index (s only ever grows)
  gap: number      // spring rest length to the dot ahead; collapses on cue
  delay: number    // frames after release before this dot's gap starts collapsing
  offX: number     // crayon jitter off the path, unwound during the run
  offY: number
  born: number
  size: number
  color: string
  landed: boolean
  life: number
  // Shape-snap only: free 2D position and its target on the ideal shape. The
  // domino run is 1D (a position along the drawn path), but snapping into a
  // circle or heart means leaving the path, so those beads need real x/y.
  mx: number
  my: number
  mvx: number
  mvy: number
  tx: number
  ty: number
}

type Trail = {
  path: Vertex[]
  dots: Dot[]
  length: number
  sinceDot: number
  released: boolean
  frame: number
  speed: number
  endX: number
  endY: number
  finale: boolean
  morph: { kind: ShapeKind; frame: number; cx: number; cy: number } | null
}

type Spark = { x: number; y: number; vx: number; vy: number; size: number; color: string; life: number }
type Ripple = { x: number; y: number; r: number; grow: number; color: string; life: number }

const easeOutBack = (t: number) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2

/**
 * Click-and-drag anywhere on the bare page background to paint a beaded trail
 * of the cursor-swarm dots. Let go and the beads topple: the last one is
 * shoved toward the release point, every dot behind it follows the drawn path
 * as the slack ahead of it opens up, and they pile into the release point one
 * by one — dominos, on rails.
 */
export default function DoodleTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    let trails: Trail[] = []
    let sparks: Spark[] = []
    let ripples: Ripple[] = []
    let drawing: Trail | null = null
    let raf = 0

    // ── path sampling ────────────────────────────────────────────────
    const addDot = (t: Trail) => {
      const i = t.dots.length
      t.dots.push({
        s: t.length,
        v: 0,
        seg: Math.max(0, t.path.length - 2),
        gap: DOT_SPACING,
        delay: 0,
        offX: (Math.random() - 0.5) * 6,
        offY: (Math.random() - 0.5) * 6,
        born: 0,
        size: DOT_SIZES[i % DOT_SIZES.length] + (Math.random() - 0.5) * 2,
        color: DOT_COLORS[i % DOT_COLORS.length],
        landed: false,
        life: 1,
        mx: 0,
        my: 0,
        mvx: 0,
        mvy: 0,
        tx: 0,
        ty: 0,
      })
    }

    const pointAt = (t: Trail, dot: Dot) => {
      const path = t.path
      while (dot.seg < path.length - 2 && path[dot.seg + 1].d < dot.s) dot.seg++
      const a = path[dot.seg]
      const b = path[dot.seg + 1] ?? a
      const span = b.d - a.d
      const f = span > 0 ? (dot.s - a.d) / span : 0
      return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f }
    }

    // ── crash effects ────────────────────────────────────────────────
    const impact = (x: number, y: number, dot: Dot) => {
      for (let i = 0; i < 5; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 1.6 + Math.random() * 2.6
        sparks.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 1.6 + Math.random() * 2.2,
          color: dot.color,
          life: 1,
        })
      }
      ripples.push({ x, y, r: dot.size * 0.5, grow: 1.8, color: dot.color, life: 1 })
    }

    // ── input ────────────────────────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      const t = drawing
      if (!t) return
      const last = t.path[t.path.length - 1]
      const dx = e.clientX - last.x
      const dy = e.clientY - last.y
      const step = Math.sqrt(dx * dx + dy * dy)
      if (step < PATH_STEP) return

      // Past MAX_DOTS the path stops growing too, so the beads stay anchored to
      // a stroke that actually exists rather than trailing off into nothing.
      if (t.dots.length >= MAX_DOTS) return

      t.length += step
      t.path.push({ x: e.clientX, y: e.clientY, d: t.length })
      // Kept current so a blur mid-stroke crashes the chain into the cursor's
      // last known spot rather than snapping the target back to the origin.
      t.endX = e.clientX
      t.endY = e.clientY
      t.sinceDot += step
      while (t.sinceDot >= DOT_SPACING) {
        t.sinceDot -= DOT_SPACING
        addDot(t)
      }
    }

    /**
     * The browser fires a click after any mouseup, so a doodle that happens to
     * end on top of a background blob would also pop it — stealing an easter
     * egg the visitor never intentionally clicked. Swallow that one click.
     * Capture phase on window runs before Background's bubble-phase listener.
     */
    const swallowClick = () => {
      const onClick = (e: MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        window.removeEventListener('click', onClick, true)
      }
      window.addEventListener('click', onClick, true)
      // mouseup → click is dispatched in the same task, so a macrotask later is
      // strictly after it; this only fires if no click followed at all.
      setTimeout(() => window.removeEventListener('click', onClick, true), 0)
    }

    const release = () => {
      const t = drawing
      if (!t) return
      drawing = null
      document.body.style.cursor = ''

      // A plain click with no travel leaves nothing behind — not a doodle.
      if (t.dots.length < 2) {
        trails = trails.filter((x) => x !== t)
        return
      }

      // Pin the path's end to where the button actually came up, so the pile
      // lands exactly under the cursor rather than at the last sampled vertex.
      const tail = t.path[t.path.length - 1]
      const dx = t.endX - tail.x
      const dy = t.endY - tail.y
      const step = Math.sqrt(dx * dx + dy * dy)
      if (step > 0.5) {
        t.length += step
        t.path.push({ x: t.endX, y: t.endY, d: t.length })
      }

      // Once drawing is unlocked, a CLOSED stroke that reads as a known shape
      // abandons the domino run and snaps into a perfect version of itself.
      // Open strokes never qualify — that is the point of the egg — and a closed
      // one the recogniser doesn't know falls through and topples as usual, so
      // this never feels like a failed gesture.
      const shape = isUnlocked('shapes') ? recogniseShape(t.path, t.length) : null
      if (shape) {
        const n = t.dots.length
        const from = t.dots.map((dot) => {
          const at = pointAt(t, dot)
          return { x: at.x + dot.offX, y: at.y + dot.offY }
        })
        const targets = alignTargets(shape.targets(n), from)

        t.dots.forEach((dot, i) => {
          dot.mx = from[i].x
          dot.my = from[i].y
          dot.mvx = 0
          dot.mvy = 0
          dot.tx = targets[i].x
          dot.ty = targets[i].y
        })
        t.released = true
        t.morph = { kind: shape.kind, frame: 0, cx: shape.centre.x, cy: shape.centre.y }

        unlockAchievement(ACHIEVEMENTS.doodleDominos)
        unlockAchievement(ACHIEVEMENTS.shapeShifter)
        swallowClick()
        return
      }

      // Stagger is budgeted, not fixed: a 200-bead scribble collapses in the
      // same wall-clock time as a 10-bead flick, just with a tighter ripple.
      const stagger = Math.max(0.8, Math.min(3, WAVE_FRAMES / t.dots.length))
      // Same idea for travel: a metre-long scribble would crawl at the speed
      // that suits a short flick, so the ceiling scales with the trip length.
      t.speed = Math.min(MAX_SPEED, Math.max(MIN_SPEED, t.length / TRAVEL_FRAMES))
      const n = t.dots.length
      t.dots.forEach((dot, i) => { dot.delay = (n - 1 - i) * stagger })
      t.dots[n - 1].v = LEADER_KICK
      t.released = true
      t.frame = 0

      unlockAchievement(ACHIEVEMENTS.doodleDominos)
      swallowClick()
    }

    const onDown = (e: MouseEvent) => {
      if (e.button !== 0 || drawing) return
      if (!isBackdrop(e.target, e.clientX, e.clientY)) return
      e.preventDefault() // no text selection dragging along with the stroke

      drawing = {
        path: [{ x: e.clientX, y: e.clientY, d: 0 }],
        dots: [],
        length: 0,
        sinceDot: 0,
        released: false,
        frame: 0,
        speed: MIN_SPEED,
        endX: e.clientX,
        endY: e.clientY,
        finale: false,
        morph: null,
      }
      addDot(drawing)
      trails.push(drawing)
      // Only appears mid-gesture, so it never hints at the egg beforehand.
      document.body.style.cursor = 'crosshair'
      if (!raf) raf = requestAnimationFrame(tick)
    }

    const onUp = (e: MouseEvent) => {
      if (!drawing) return
      drawing.endX = e.clientX
      drawing.endY = e.clientY
      release()
    }

    // Losing the window mid-stroke should still resolve the trail, not freeze it.
    const onBlur = () => { if (drawing) release() }

    // ── frame ────────────────────────────────────────────────────────
    const tick = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      for (const t of trails) {
        const n = t.dots.length

        // ── shape snap: beads leave the path entirely and fly into formation,
        // hold the shape long enough to register, then all burst at once.
        if (t.morph) {
          t.morph.frame++
          const burst = t.morph.frame >= MORPH_HOLD_FRAMES
          for (const dot of t.dots) {
            if (dot.landed) { dot.life -= LIFE_DRAIN; continue }
            dot.mvx = (dot.mvx + (dot.tx - dot.mx) * MORPH_STIFF) * MORPH_DAMP
            dot.mvy = (dot.mvy + (dot.ty - dot.my) * MORPH_STIFF) * MORPH_DAMP
            dot.mx += dot.mvx
            dot.my += dot.mvy
            if (burst) {
              dot.landed = true
              impact(dot.mx, dot.my, dot)
            }
          }
          if (burst && !t.finale) {
            t.finale = true
            ripples.push({ x: t.morph.cx, y: t.morph.cy, r: 8, grow: 5, color: '#171310', life: 1 })
            burstConfetti(t.morph.cx, t.morph.cy, 30)
          }

          for (const dot of t.dots) {
            if (dot.life <= 0) continue
            const scale = dot.landed ? 1 + (1 - dot.life) * 0.7 : 1
            ctx.globalAlpha = dot.landed ? 0.92 * dot.life : 0.92
            ctx.beginPath()
            ctx.arc(dot.mx, dot.my, Math.max((dot.size / 2) * scale, 0.1), 0, Math.PI * 2)
            ctx.fillStyle = dot.color
            ctx.fill()
          }
          ctx.globalAlpha = 1
          continue
        }

        if (t.released) t.frame++

        for (let i = n - 1; i >= 0; i--) {
          const dot = t.dots[i]

          if (!t.released) { dot.born++; continue }
          if (dot.landed) { dot.life -= LIFE_DRAIN; continue }

          // The rest gap is the whole trick: while it holds, a dot sits in
          // equilibrium behind the one ahead and the chain slides as a unit.
          // Once its turn arrives the gap shrinks to nothing and the dot is
          // pulled the last stretch into the release point.
          if (t.frame >= dot.delay) dot.gap *= GAP_DECAY

          const ahead = i === n - 1 ? t.length : t.dots[i + 1].s
          const target = i === n - 1 ? t.length : Math.max(0, ahead - dot.gap)
          dot.v += (target - dot.s) * STIFF
          dot.v *= DAMP
          // A proportional spring's speed scales with its error, so a dot 700px
          // from the pile would cover the whole path in a handful of frames and
          // read as a teleport. The clamp keeps the spring for the easing near
          // the target but caps travel, so beads visibly roll down their path.
          dot.v = Math.max(-t.speed, Math.min(t.speed, dot.v))
          dot.s += dot.v

          // Inelastic bump — a domino cannot pass the one it just hit.
          if (dot.s > ahead) { dot.s = ahead; dot.v *= 0.3 }
          if (dot.s > t.length) { dot.s = t.length; dot.v = 0 }

          dot.offX *= OFF_DECAY
          dot.offY *= OFF_DECAY

          if (t.length - dot.s <= 1.5) {
            dot.s = t.length
            dot.v = 0
            dot.landed = true
            impact(t.endX, t.endY, dot)
            // i === 0 is the first bead drawn, so its crash ends the run.
            if (i === 0 && !t.finale) {
              t.finale = true
              ripples.push({ x: t.endX, y: t.endY, r: 6, grow: 4.5, color: '#171310', life: 1 })
              if (n >= 10) burstConfetti(t.endX, t.endY, 24)
            }
          }
        }

        for (const dot of t.dots) {
          if (dot.life <= 0) continue
          const p = pointAt(t, dot)
          let scale = 1
          let alpha = 0.92
          if (!t.released) scale = easeOutBack(Math.min(dot.born / 7, 1))
          if (dot.landed) {
            scale = 1 + (1 - dot.life) * 0.7   // squash outward as it puffs away
            alpha = 0.92 * dot.life
          }
          ctx.globalAlpha = alpha
          ctx.beginPath()
          ctx.arc(p.x + dot.offX, p.y + dot.offY, Math.max((dot.size / 2) * scale, 0.1), 0, Math.PI * 2)
          ctx.fillStyle = dot.color
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1

      for (const s of sparks) {
        s.x += s.vx
        s.y += s.vy
        s.vx *= 0.93
        s.vy = s.vy * 0.93 + 0.12
        s.life -= 0.045
        if (s.life <= 0) continue
        ctx.globalAlpha = s.life
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fillStyle = s.color
        ctx.fill()
      }

      for (const r of ripples) {
        r.r += r.grow
        r.life -= 0.06
        if (r.life <= 0) continue
        ctx.globalAlpha = r.life * 0.5
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2)
        ctx.strokeStyle = r.color
        ctx.lineWidth = 2
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      sparks = sparks.filter((s) => s.life > 0)
      ripples = ripples.filter((r) => r.life > 0)
      trails = trails.filter((t) => !t.released || t.dots.some((d) => d.life > 0))

      // Idle costs nothing: the loop only exists while there is something to show.
      if (trails.length || sparks.length || ripples.length) {
        raf = requestAnimationFrame(tick)
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
        raf = 0
      }
    }

    window.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseup', onUp)
    window.addEventListener('blur', onBlur)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('blur', onBlur)
      document.body.style.cursor = ''
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[9997] hidden md:block"
      aria-hidden="true"
    />
  )
}
