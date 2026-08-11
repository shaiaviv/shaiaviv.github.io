/**
 * A pulse that travels out from a point and knocks the whole page as it passes.
 *
 * Two halves: a visible ring, and a per-element pop whose delay is the element's
 * distance from the origin divided by the wave speed. That stagger is the entire
 * trick — animate everything at once and the page merely twitches; delay each
 * element by its distance and the eye reads a single physical wavefront crossing
 * the screen.
 *
 * Elements are popped through the Web Animations API rather than Framer for the
 * same reason gravity is: script animations outrank inline styles, so this can
 * borrow elements Framer is already controlling and hand them straight back on
 * `fill: 'none'` without either side knowing about the other.
 */

const SPEED = 1.45          // px per ms — crosses a laptop viewport in ~1s
const POP_MS = 420
const RING_MS = 900

/*
 * Deliberately a curated list, not `*`. Partly for looks — the wave reads best
 * hitting whole objects — and partly because a universal selector is how the
 * x-ray effect once cost 6ms per frame just by existing.
 */
const TARGETS = [
  '.sticker',
  '.sticker-btn',
  '.chip',
  '.cursor-grab',
  '.section-label',
  'h2',
  'h3',
  'img',
].join(', ')

/**
 * Keeps only the outermost matches. A card and the chips inside it would
 * otherwise both pop, compounding transforms — the child inherits the parent's
 * scale — which reads as chaos rather than as a wave.
 */
function outermost(els: HTMLElement[]): HTMLElement[] {
  const set = new Set(els)
  return els.filter((el) => {
    for (let p = el.parentElement; p; p = p.parentElement) if (set.has(p)) return false
    return true
  })
}

export function shockwave(originX: number, originY: number) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  /*
   * The visible wavefront: a tight, saturated band, NOT a soft glow. A first
   * pass used a wide low-alpha gradient and it vanished into the page — on a
   * cream background with ambient colour blobs, a bright haze reads as nothing.
   * Contrast here has to come from saturation and a dark leading edge, which is
   * the same reason the whole site is built on hard ink outlines.
   *
   * A gradient band rather than a bordered circle, because a border scales with
   * the element and would balloon from hairline to 80px. It starts at a small
   * non-zero scale so the band has real width in the first frames, when the
   * blast should read hardest.
   */
  const ring = document.createElement('div')
  Object.assign(ring.style, {
    position: 'fixed',
    left: `${originX}px`,
    top: `${originY}px`,
    width: '150vmax',
    height: '150vmax',
    marginLeft: '-75vmax',
    marginTop: '-75vmax',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: '9996',
    background:
      'radial-gradient(circle,' +
      ' transparent 58%,' +
      ' rgba(23,19,16,0.22) 63%,' +
      ' rgba(108,92,231,0.95) 67%,' +
      ' rgba(255,194,60,0.9) 70%,' +
      ' rgba(255,107,87,0.6) 73%,' +
      ' rgba(23,19,16,0.14) 76%,' +
      ' transparent 80%)',
  })
  document.body.appendChild(ring)
  const ringAnim = ring.animate(
    [
      { transform: 'scale(0.05)', opacity: 1, offset: 0 },
      { transform: 'scale(0.6)', opacity: 1, offset: 0.55 },
      { transform: 'scale(1)', opacity: 0, offset: 1 },
    ],
    { duration: RING_MS, easing: 'cubic-bezier(0.15, 0.6, 0.3, 1)', fill: 'none' },
  )
  ringAnim.finished.then(() => ring.remove()).catch(() => ring.remove())

  // ── and the page reacting, element by element, as the front reaches it
  const all = [...document.querySelectorAll<HTMLElement>(TARGETS)]
  for (const el of outermost(all)) {
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue
    if (r.bottom < -200 || r.top > window.innerHeight + 200) continue

    const dist = Math.hypot(r.left + r.width / 2 - originX, r.top + r.height / 2 - originY)
    const spin = (Math.random() - 0.5) * 16

    /*
     * Transform only — no filter. A first pass flashed brightness/saturate on
     * every element and collapsed the page to ~12fps, because filter cannot be
     * composited and repaints its whole layer each frame. Twenty-six of those at
     * once is a repaint storm. Transform and opacity are the only two properties
     * safe to animate across this many elements, so the pop carries the effect
     * and the colour flash is gone.
     */
    el.animate(
      [
        { transform: 'scale(1) rotate(0deg)', offset: 0 },
        { transform: `scale(1.22) rotate(${spin}deg)`, offset: 0.3, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
        { transform: `scale(0.94) rotate(${spin * -0.4}deg)`, offset: 0.6 },
        { transform: 'scale(1) rotate(0deg)', offset: 1 },
      ],
      {
        duration: POP_MS,
        delay: dist / SPEED,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        fill: 'none',
      },
    )
  }
}
