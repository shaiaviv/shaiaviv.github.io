import { unlockAchievement, ACHIEVEMENTS } from './achievements'

/**
 * Shared physics for the grab-and-fling-back interaction introduced on the
 * hero name letters — reused on chips, badges, icons, and labels across the
 * site so the whole page feels like a box of fidget toys, not just the name.
 */
export const dragBounce = { bounceStiffness: 400, bounceDamping: 20 }
export const dragWhile = { scale: 1.15, zIndex: 50 }

/**
 * The "you can drag things around" easter egg should unlock from the FIRST
 * drag of ANY draggable element on the page, not just the hero name — wire
 * this into every draggable's onDragStart (unlockAchievement itself dedupes,
 * so calling it repeatedly per-element is harmless).
 */
export const onDragUnlock = () => unlockAchievement(ACHIEVEMENTS.draggedSomething)
