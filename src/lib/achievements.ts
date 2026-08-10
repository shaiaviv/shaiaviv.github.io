export interface Achievement {
  id: string
  emoji: string
  title: string
  message: string
}

export const ACHIEVEMENT_EVENT = 'portfolio:achievement'

const seen = new Set<string>()

/** Dispatches a toast once per session for a given achievement id. */
export function unlockAchievement(achievement: Achievement) {
  if (seen.has(achievement.id)) return
  seen.add(achievement.id)
  window.dispatchEvent(new CustomEvent<Achievement>(ACHIEVEMENT_EVENT, { detail: achievement }))
}
