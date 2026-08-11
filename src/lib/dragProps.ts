import { unlockAchievement, ACHIEVEMENTS } from './achievements'

/**
 * Shared physics for the grab-and-fling-back interaction introduced on the
 * hero name letters — reused on chips, badges, icons, and labels across the
 * site so the whole page feels like a box of fidget toys, not just the name.
 *
 * These are a spring with mass 1, so the feel is set by the damping ratio
 * ζ = damping / (2 × √stiffness). At 12 / 380 that is ≈ 0.31, which gives a
 * couple of visible bounces before it settles; the previous 20 / 400 sat at 0.50
 * and overshot just once. Bounciness is the DAMPING knob — raising stiffness
 * alone only makes the return faster, because it raises ζ's denominator too.
 *
 * The hero letters used to override this inline with their own pair, which meant
 * the name and the rest of the page drifted apart. One constant now, so tuning
 * the fidget feel is a single edit.
 */
export const dragBounce = { bounceStiffness: 380, bounceDamping: 12 }
export const dragWhile = { scale: 1.15, zIndex: 50 }

/**
 * The "you can drag things around" easter egg should unlock from the FIRST
 * drag of ANY draggable element on the page, not just the hero name — wire
 * this into every draggable's onDragStart (unlockAchievement itself dedupes,
 * so calling it repeatedly per-element is harmless).
 */
export const onDragUnlock = () => unlockAchievement(ACHIEVEMENTS.draggedSomething)
