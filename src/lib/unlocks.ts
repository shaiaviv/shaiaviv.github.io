/**
 * Feature unlocks — the middle link of the easter-egg chain.
 *
 * An unlock is NOT an achievement. It hands the visitor a new *ability* and
 * announces it in a banner; actually using that ability is what unlocks the
 * matching egg. Both of these are earned in the screenshot lightbox, which is
 * the point: the reward for looking at the real project work is more toys.
 */
export type UnlockId = 'shapes' | 'gravity'

export interface Unlock {
  id: UnlockId
  emoji: string
  title: string
  body: string
  /**
   * The achievement id that retires this banner. A banner is an instruction, so
   * once the visitor has actually done the thing it stops being help and starts
   * being clutter — UnlockBanners watches for this and closes itself.
   */
  completedBy: string
}

export const UNLOCKS: Record<UnlockId, Unlock> = {
  shapes: {
    id: 'shapes',
    emoji: '✏️',
    title: 'Drawing unlocked!',
    body: 'Click and hold on the page background and draw a CLOSED shape — a circle, heart, star, triangle, square or diamond — then let go and watch what happens to it.',
    completedBy: 'shape-shifter',
  },
  gravity: {
    id: 'gravity',
    emoji: '🪐',
    title: 'Gravity mode unlocked!',
    body: 'You looked at every single screenshot. Now type "gravity" anywhere on the page to knock the whole thing over.',
    completedBy: 'gravity',
  },
}

export const UNLOCK_EVENT = 'portfolio:unlock'

// Session-only, matching the achievement hunt — a refresh re-locks everything.
const unlocked = new Set<UnlockId>()

/** Announces an ability once per page load; repeat calls are ignored. */
export function unlockFeature(id: UnlockId) {
  if (unlocked.has(id)) return
  unlocked.add(id)
  window.dispatchEvent(new CustomEvent<Unlock>(UNLOCK_EVENT, { detail: UNLOCKS[id] }))
}

export function isUnlocked(id: UnlockId) {
  return unlocked.has(id)
}
