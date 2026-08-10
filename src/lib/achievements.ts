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
    message: 'You clicked the sentence about easter eggs. Very on brand.',
  },
  konami: {
    id: 'konami',
    emoji: '🎉',
    title: 'Konami Code!',
    message: 'You know the classics. Respect.',
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
  saidHello: {
    id: 'said-hello',
    emoji: '👋',
    title: 'Nice!',
    message: "Hope you actually hit send — I'll write back.",
  },
}

export const TOTAL_ACHIEVEMENTS = Object.keys(ACHIEVEMENTS).length

export const ACHIEVEMENT_EVENT = 'portfolio:achievement'

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
