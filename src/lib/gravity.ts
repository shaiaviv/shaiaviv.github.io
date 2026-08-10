/**
 * Gravity mode — every grabbable thing on the page suddenly gets heavy, falls,
 * tumbles, bounces once, and then springs back to where it belongs.
 *
 * Driven straight through the Web Animations API rather than through Framer
 * Motion, for two reasons:
 *
 *  1. The draggables are ~26 independent components with no shared controller,
 *     so orchestrating them through React would mean threading state into every
 *     one of them. `.cursor-grab` already marks every draggable on the site,
 *     which makes it a reliable selector for "things that should fall".
 *  2. Script animations outrank inline styles in the cascade, so this overrides
 *     whatever transform Framer has written for the duration without fighting
 *     it — and with `fill: 'none'` each element snaps back under Framer's
 *     control the instant its animation ends. (Same cascade rule that made
 *     float-bob silently eat Framer's drag transforms in the hero.)
 */

/*
 * Phases in real milliseconds rather than keyframe offsets, because the offsets
 * are derived and the durations are what anyone actually wants to tune. REST_MS
 * is the one that matters: it's how long everything lies on the floor before
 * floating home, and a short rest reads as a bounce rather than as the page
 * having genuinely fallen over.
 */
const FALL_MS = 1100     // accelerating drop to the floor
const BOUNCE_MS = 320    // rebound and resettle
const REST_MS = 2200     // lying there, defeated
const RETURN_MS = 950    // float back home
const TOTAL_MS = FALL_MS + BOUNCE_MS + REST_MS + RETURN_MS

const MARGIN = 4

/**
 * How far this element can fall before something clips it. Toys live inside
 * clipping wrappers all over the site — the skills marquee, the featured card's
 * rounded panel — and an element that keeps falling past its container just
 * disappears mid-air, so each one lands on the nearest real floor instead.
 */
function floorFor(el: HTMLElement): number {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const s = getComputedStyle(p)
    if (s.overflow !== 'visible' || s.overflowY !== 'visible') {
      return Math.min(p.getBoundingClientRect().bottom, window.innerHeight)
    }
  }
  return window.innerHeight
}

/** Drops every on-screen toy. Returns the total run time in ms. */
export function dropEverything(): number {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 0

  const toys = [...document.querySelectorAll<HTMLElement>('.cursor-grab')]
  let launched = 0

  toys.forEach((el) => {
    const rect = el.getBoundingClientRect()
    // Offscreen toys would animate invisibly — skip the work.
    if (rect.bottom < 0 || rect.top > window.innerHeight) return

    const fall = floorFor(el) - rect.bottom - MARGIN
    if (fall <= 8) return

    const spin = (Math.random() - 0.5) * 70
    const bounce = Math.min(20, fall * 0.16)
    const delay = launched * 14 + Math.random() * 90
    launched++

    const landed = FALL_MS / TOTAL_MS
    const apex = (FALL_MS + BOUNCE_MS * 0.45) / TOTAL_MS
    const settled = (FALL_MS + BOUNCE_MS) / TOTAL_MS
    const restEnd = (FALL_MS + BOUNCE_MS + REST_MS) / TOTAL_MS

    el.animate(
      [
        // accelerate downward — gravity, so ease IN, not out
        { transform: 'translateY(0px) rotate(0deg)', easing: 'cubic-bezier(0.45, 0, 1, 1)' },
        // impact, then rebound
        { transform: `translateY(${fall}px) rotate(${spin}deg)`, offset: landed, easing: 'cubic-bezier(0, 0, 0.35, 1)' },
        { transform: `translateY(${fall - bounce}px) rotate(${spin * 0.9}deg)`, offset: apex, easing: 'cubic-bezier(0.45, 0, 1, 1)' },
        // settle on the floor and lie there
        { transform: `translateY(${fall}px) rotate(${spin}deg)`, offset: settled },
        { transform: `translateY(${fall}px) rotate(${spin}deg)`, offset: restEnd, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
        // and float home
        { transform: 'translateY(0px) rotate(0deg)' },
      ],
      { duration: TOTAL_MS, delay, fill: 'none' },
    )
  })

  return launched ? TOTAL_MS + toys.length * 14 : 0
}
