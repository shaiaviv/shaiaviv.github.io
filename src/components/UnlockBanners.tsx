import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { UNLOCK_EVENT, type Unlock } from '../lib/unlocks'
import { ACHIEVEMENT_EVENT, type AchievementToast } from '../lib/achievements'

/**
 * Sticky announcements for newly unlocked abilities, stacked at the top of the
 * page and dismissible.
 *
 * These stay put instead of auto-dismissing like the achievement toasts do,
 * because each one is an *instruction* ("draw a circle", "type gravity") that
 * the visitor has to act on — a banner that vanishes after four seconds would
 * take the instructions with it. They are fired on lightbox CLOSE rather than
 * on open so they never cover the screenshots they are rewarding.
 */
export default function UnlockBanners() {
  const [banners, setBanners] = useState<Unlock[]>([])

  useEffect(() => {
    const onUnlock = (e: Event) => {
      const detail = (e as CustomEvent<Unlock>).detail
      setBanners((prev) => (prev.some((b) => b.id === detail.id) ? prev : [...prev, detail]))
    }
    // Once the instruction has been carried out, the banner closes itself —
    // the achievement toast is the confirmation, so leaving the "now do this"
    // banner up alongside it just tells the visitor to do what they just did.
    const onAchievement = (e: Event) => {
      const { id } = (e as CustomEvent<AchievementToast>).detail
      setBanners((prev) => prev.filter((b) => b.completedBy !== id))
    }
    window.addEventListener(UNLOCK_EVENT, onUnlock)
    window.addEventListener(ACHIEVEMENT_EVENT, onAchievement)
    return () => {
      window.removeEventListener(UNLOCK_EVENT, onUnlock)
      window.removeEventListener(ACHIEVEMENT_EVENT, onAchievement)
    }
  }, [])

  const dismiss = (id: string) => setBanners((prev) => prev.filter((b) => b.id !== id))

  return (
    // pointer-events-none on the column so the page stays fully usable between
    // banners; each banner turns them back on for its own box and close button.
    <div className="fixed top-[5.5rem] left-1/2 -translate-x-1/2 z-[9990] w-[min(92vw,34rem)] flex flex-col items-stretch gap-2 pointer-events-none">
      <AnimatePresence initial={false}>
        {banners.map((b) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96, transition: { duration: 0.18 } }}
            transition={{ type: 'tween', duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="sticker rounded-2xl bg-surface-2 px-4 py-3 pointer-events-auto flex items-start gap-3"
          >
            <span className="text-2xl leading-none mt-0.5">{b.emoji}</span>
            <div className="flex-1">
              <div className="font-display font-bold text-sm text-text-1 leading-tight">{b.title}</div>
              <div className="font-mono text-[0.7rem] text-text-2 mt-1 leading-snug">{b.body}</div>
            </div>
            <button
              type="button"
              onClick={() => dismiss(b.id)}
              aria-label={`Dismiss ${b.title}`}
              className="shrink-0 w-6 h-6 rounded-full border-2 border-text-1 bg-surface font-mono text-xs font-bold text-text-1 leading-none flex items-center justify-center hover:bg-green transition-colors"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
