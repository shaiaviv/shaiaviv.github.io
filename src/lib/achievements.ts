export interface Achievement {
  id: string
  emoji: string
  title: string
  message: string
}

/**
 * Single source of truth for every easter egg on the site — the progress
 * counter's "total" is just this object's size, so adding a new egg here
 * automatically updates the hunt.
 *
 * Three of these are gated behind a discovery chain rather than being findable
 * cold, and the hints live in the copy below (the badge panel renders each
 * found egg's `message`, so a message is the natural place to plant the next
 * breadcrumb):
 *
 *   polaroidFlip  → the riddle on the photo's back answers "the console"
 *                 → the console greets you and names hiShai()          → consoleHi
 *   open any project screenshot   → unlocks drawing  → draw a shape     → shapeShifter
 *   view EVERY screenshot         → unlocks gravity  → type "gravity"   → gravity
 *
 * shapeShifter's message carries the nudge to view every screenshot, so the
 * chain keeps pulling visitors deeper into the actual project work.
 */
export const ACHIEVEMENTS: Record<string, Achievement> = {
  draggedSomething: {
    id: 'dragged-something',
    emoji: '🫳',
    title: 'Fidgety!',
    message: 'You found out things on this page can be grabbed and flung around.',
  },
  metaSentence: {
    id: 'easter-egg-sentence',
    emoji: '💃',
    title: 'Meta easter egg!',
    message: 'You clicked the sentence about easter eggs and it laid two dozen of them. Very on brand.',
  },
  konami: {
    id: 'konami',
    emoji: '🎉',
    title: 'Konami Code!',
    message: 'You know the classics. Type it again to put the colours back.',
  },
  arkanoidStart: {
    id: 'arkanoid-start',
    emoji: '🕹️',
    title: 'Game on!',
    message: 'You started an actual playable Arkanoid.',
  },
  backgroundBalls: {
    id: 'background-balls',
    emoji: '🫧',
    title: 'Pop!',
    message: 'You clicked a background blob and popped it. Sneaky.',
  },
  doodleDominos: {
    id: 'doodle-dominos',
    emoji: '🖍️',
    title: 'Domino run!',
    message: 'You drew on the page and watched the dots topple into a pile.',
  },
  polaroidFlip: {
    id: 'polaroid-flip',
    emoji: '🔖',
    title: 'Flip side!',
    message: 'You turned the photo over. Solve the riddle on the back and it points at the next egg.',
  },
  consoleHi: {
    id: 'console-hi',
    emoji: '💥',
    title: 'Detonation!',
    message: 'You solved the riddle, opened the console, and called hiShai() — which set off a shockwave under the whole page.',
  },
  shapeShifter: {
    id: 'shape-shifter',
    emoji: '💫',
    title: 'Shape shifter!',
    message: 'Your scribble snapped into a perfect shape. Circles, hearts, stars, triangles, squares and diamonds all work. Psst — look at EVERY screenshot of BOTH featured projects to unlock one more egg.',
  },
  gravity: {
    id: 'gravity',
    emoji: '🪐',
    title: 'Gravity!',
    message: 'You typed the magic word and the whole page fell over. Type it again any time.',
  },
}

export const TOTAL_ACHIEVEMENTS = Object.keys(ACHIEVEMENTS).length

export const ACHIEVEMENT_EVENT = 'portfolio:achievement'

/**
 * The payoff for clearing the board. Anyone who finds all ten has spent real
 * time on the site, so the reward is a one-click warm intro rather than more
 * confetti — the body carries a code only a completionist could have seen, and
 * trails off mid-sentence so they finish it with the actual pitch.
 */
export const COMPLETION_EMAIL = 'shaiaviv99@gmail.com'
export const COMPLETION_CODE = 'Pool Party'
export const COMPLETION_SUBJECT = 'I found all your easter eggs'
/*
 * Ends on a blank line and a bracketed placeholder, so the sender lands on an
 * obvious cursor position with the pitch already framed rather than facing a
 * sentence that trails off. encodeURIComponent turns the newlines into %0A,
 * which mail clients render as real line breaks.
 */
export const COMPLETION_BODY =
  'I found all your easter eggs and to prove it here\'s the secret code that only a true easter egg ' +
  `hunter could unlock: "${COMPLETION_CODE}". Now that I\'ve gotten your attention by completing all ` +
  'easter eggs, I\'d like to see if you\'re interested in the following role:' +
  '\n\n{Describe your open role here}'

export function completionMailto() {
  const params = `subject=${encodeURIComponent(COMPLETION_SUBJECT)}&body=${encodeURIComponent(COMPLETION_BODY)}`
  return `mailto:${COMPLETION_EMAIL}?${params}`
}

export interface AchievementProgress {
  count: number
  total: number
}

export type AchievementToast = Achievement & AchievementProgress

// Session-only — resets on every refresh, intentionally not persisted.
const found = new Set<string>()

/** Dispatches a toast (carrying its own progress snapshot) once per achievement id, for this page load only. */
export function unlockAchievement(achievement: Achievement) {
  if (found.has(achievement.id)) return
  found.add(achievement.id)
  const detail: AchievementToast = { ...achievement, count: found.size, total: TOTAL_ACHIEVEMENTS }
  window.dispatchEvent(new CustomEvent<AchievementToast>(ACHIEVEMENT_EVENT, { detail }))
}
