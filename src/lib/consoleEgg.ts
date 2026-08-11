/**
 * The console egg.
 *
 * The riddle on the back of the About polaroid answers "the console", so the
 * greeting here has to be findable and has to name the function, or the chain
 * dead-ends. `onCall` owns the effect and the achievement so this file stays
 * about discovery rather than about what the payoff happens to be.
 */

let installed = false

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

  const w = window as unknown as Record<string, unknown>
  w.hiShai = () => {
    onCall()
    return 'brace yourself 🥚'
  }
}
