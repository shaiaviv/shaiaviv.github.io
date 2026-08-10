import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ACHIEVEMENT_EVENT,
  TOTAL_ACHIEVEMENTS,
  COMPLETION_CODE,
  completionMailto,
  type Achievement,
  type AchievementToast,
} from '../lib/achievements'
import { burstConfetti } from '../lib/confetti'

interface Toast extends AchievementToast {
  key: number
}

export default function AchievementToasts() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [found, setFound] = useState<Achievement[]>([])
  const [hovering, setHovering] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [justBumped, setJustBumped] = useState(false)
  const [showFinale, setShowFinale] = useState(false)

  useEffect(() => {
    let counter = 0
    const handle = (e: Event) => {
      const detail = (e as CustomEvent<AchievementToast>).detail
      const key = counter++
      setToasts((prev) => [...prev, { ...detail, key }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.key !== key))
      }, 4600)

      setFound((prev) => (prev.some((f) => f.id === detail.id) ? prev : [detail, ...prev]))
      setJustBumped(true)
      setTimeout(() => setJustBumped(false), 600)

      // Cleared the board. Held back a beat so the last egg's own toast lands
      // first instead of being buried by the finale.
      if (detail.count >= detail.total) {
        setTimeout(() => {
          setShowFinale(true)
          burstConfetti(window.innerWidth / 2, window.innerHeight * 0.4, 200)
        }, 900)
      }
    }
    window.addEventListener(ACHIEVEMENT_EVENT, handle)
    return () => window.removeEventListener(ACHIEVEMENT_EVENT, handle)
  }, [])

  const count = found.length
  const complete = count >= TOTAL_ACHIEVEMENTS
  const expanded = hovering || pinned

  return (
    <>
      {/*
        The payoff for all ten. Anyone who gets here has spent real time on the
        site, so the reward is a one-click warm intro: the mailto is prefilled
        with a code only a completionist could have seen, and left trailing
        mid-sentence so they finish it with the actual role.
      */}
      <AnimatePresence>
        {showFinale && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] flex items-center justify-center p-5 bg-text-1/40 backdrop-blur-sm"
            onClick={() => setShowFinale(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30, rotate: -2 }}
              animate={{ scale: 1, y: 0, rotate: -1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="sticker rounded-3xl bg-surface px-7 py-7 max-w-[30rem] text-center"
            >
              <div className="text-5xl mb-3">🏆</div>
              <h3 className="font-display font-bold text-2xl text-text-1 leading-tight">
                All {TOTAL_ACHIEVEMENTS} easter eggs found
              </h3>
              <p className="font-mono text-[0.72rem] text-text-2 mt-3 leading-relaxed">
                Nobody gets here by accident. Your secret code is
                {' '}
                <span className="font-bold text-text-1 bg-green/60 px-1.5 py-0.5 rounded">{COMPLETION_CODE}</span>
                {' '}
                — send it over and tell me what you are hiring for. The email is already written.
              </p>
              <a
                href={completionMailto()}
                className="sticker-btn inline-flex items-center gap-2 mt-5 rounded-full bg-accent px-5 py-2.5 font-mono text-xs font-bold text-white"
              >
                ✉️ Claim it
              </a>
              <button
                type="button"
                onClick={() => setShowFinale(false)}
                className="block mx-auto mt-4 font-mono text-[0.66rem] text-text-2 underline decoration-dotted underline-offset-4"
              >
                maybe later
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    <div className="fixed bottom-5 right-5 z-[9997] flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const toastComplete = t.count >= t.total
          return (
            <motion.div
              key={t.key}
              initial={{ opacity: 0, x: 40, rotate: 3, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, rotate: -1, scale: 1 }}
              exit={{ opacity: 0, x: 30, rotate: 4, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="sticker rounded-2xl px-4 py-3 max-w-[15rem] bg-surface-2 pointer-events-auto"
            >
              <div className="flex items-start gap-2.5">
                <span className="text-2xl leading-none">{t.emoji}</span>
                <div>
                  <div className="font-display font-bold text-sm text-text-1 leading-tight">{t.title}</div>
                  <div className="font-mono text-[0.68rem] text-text-2 mt-1 leading-snug">{t.message}</div>
                  <div className="font-mono text-[0.62rem] text-accent mt-1.5 font-bold tracking-wide">
                    {toastComplete ? `🏆 all ${t.total} easter eggs found!` : `🥚 ${t.count} / ${t.total} easter eggs found`}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/*
        Persistent easter-egg hunt badge — hover (or tap) to see what you've found so far.
        This is a regular flex item in the SAME bottom-anchored column as the toasts above
        (not position:absolute), so a toast popping in pushes this whole group up cleanly
        instead of the panel floating over it — toasts always render on top of the stack.
      */}
      <div
        className="flex flex-col items-end gap-3 pointer-events-auto"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95, transition: { duration: 0.15 } }}
              transition={{ type: 'tween', duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="sticker rounded-2xl px-3 py-3 max-w-[17rem] bg-surface-2"
            >
              {found.length === 0 ? (
                <p className="font-mono text-[0.68rem] text-text-2 px-1 py-1 max-w-[13rem]">
                  No easter eggs found yet — start clicking and dragging things around.
                </p>
              ) : (
                <ul className="flex flex-col gap-2.5 max-h-[16rem] overflow-y-auto">
                  {found.map((f) => (
                    <li key={f.id} className="flex items-start gap-2.5 px-1">
                      <span className="text-lg leading-none">{f.emoji}</span>
                      <div>
                        <div className="font-mono text-xs text-text-1 font-bold leading-tight">{f.title}</div>
                        <div className="font-mono text-[0.62rem] text-text-2 mt-0.5 leading-snug">{f.message}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={() => setPinned((p) => !p)}
          animate={{ scale: justBumped ? [1, 1.15, 1] : 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          title={complete ? 'You found every easter egg on the site!' : 'Hidden easter eggs are scattered around the page — hover to see what you found'}
          className={`chip flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-xs font-bold select-none ${
            complete ? 'bg-green text-text-1' : 'bg-surface text-text-1'
          }`}
        >
          <span className="text-sm leading-none">{complete ? '🏆' : '🥚'}</span>
          <span>{count} / {TOTAL_ACHIEVEMENTS} easter eggs found</span>
        </motion.button>
      </div>
    </div>
    </>
  )
}
