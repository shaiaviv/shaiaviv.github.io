/**
 * The console egg, and the x-ray flash it triggers.
 *
 * The riddle on the back of the About polaroid answers "the console", and this
 * is what's waiting there — so the greeting has to be findable and has to name
 * the function, otherwise the chain dead-ends. The payoff is deliberately a
 * wireframe reveal rather than more confetti: you got here by opening devtools,
 * so the page shows you its own skeleton.
 */

const XRAY_CLASS = 'xray-mode'
const XRAY_MS = 4200

/*
 * Injected at trigger time and torn out again afterwards, rather than living in
 * index.css. `.xray-mode *` is a universal selector behind a descendant
 * combinator, which is about the most expensive shape a rule can have: it
 * defeats the style engine's fast path, so EVERY style recalculation has to walk
 * each element's ancestor chain looking for the class. Framer Motion writes
 * inline transforms on dozens of elements per scroll frame, each triggering
 * recalc, and measured against a full-page scroll this one dormant rule cost
 * ~6ms per frame and dragged 88fps down to 56 — while doing nothing at all,
 * because the cost is in matching, not applying. Keeping it out of the document
 * until the egg fires makes the idle cost exactly zero.
 */
const XRAY_CSS = `
.${XRAY_CLASS} * {
  outline: 1px solid rgba(108, 92, 231, 0.4) !important;
  outline-offset: -1px;
}
.${XRAY_CLASS} section[id] { position: relative; }
.${XRAY_CLASS} section[id]::before {
  content: '<' attr(id) '>';
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 5;
  font: 700 10px 'JetBrains Mono', monospace;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(108, 92, 231, 0.85);
  pointer-events: none;
}
.${XRAY_CLASS} body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9995;
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    rgba(108, 92, 231, 0.07) 0 1px,
    transparent 1px 3px
  );
}
`

let installed = false
let xrayTimer: number | undefined
let styleEl: HTMLStyleElement | null = null

/** Outlines every element on the page for a few seconds. Safe to call repeatedly. */
export function flashXray(ms = XRAY_MS) {
  const root = document.documentElement
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.dataset.xray = 'true'
    styleEl.textContent = XRAY_CSS
  }
  if (!styleEl.isConnected) document.head.appendChild(styleEl)
  root.classList.add(XRAY_CLASS)

  window.clearTimeout(xrayTimer)
  xrayTimer = window.setTimeout(() => {
    root.classList.remove(XRAY_CLASS)
    styleEl?.remove()
  }, ms)
}

/**
 * Prints the console greeting and installs window.hiShai(). `onCall` fires once
 * per invocation so the caller owns the achievement and the effect.
 */
export function installConsoleEgg(onCall: () => void) {
  if (installed) return
  installed = true

  const heading = [
    'font: 800 34px "Space Grotesk", system-ui, sans-serif',
    'color: #6c5ce7',
    'text-shadow: 3px 3px 0 #171310',
    'padding: 6px 0',
  ].join(';')
  const body = 'font: 500 13px "JetBrains Mono", monospace; color: #544d3f'
  const cta = 'font: 700 13px "JetBrains Mono", monospace; color: #171310; background: #ffc23c; padding: 4px 8px; border-radius: 4px'

  console.log('%cShai Aviv', heading)
  console.log('%cSo you opened the console. That is exactly the sort of thing I do too.', body)
  console.log('%chiShai()%c  ← call that. There is an easter egg in it.', cta, body)

  const hiShai = () => {
    onCall()
    return 'x-ray vision engaged 🩻 — look at the page'
  }

  const w = window as unknown as Record<string, unknown>
  w.hiShai = hiShai
  // Anyone who guesses the more obvious spelling should still land the egg.
  w.hireShai = hiShai
}
