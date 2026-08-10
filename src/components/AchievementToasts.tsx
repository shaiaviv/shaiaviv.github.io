import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ACHIEVEMENT_EVENT, TOTAL_ACHIEVEMENTS, type Achievement, type AchievementToast } from '../lib/achievements'

interface Toast extends AchievementToast {
  key: number
}

export default function AchievementToasts() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [found, setFound] = useState<Achievement[]>([])
  const [hovering, setHovering] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [justBumped, setJustBumped] = useState(false)

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
    }
    window.addEventListener(ACHIEVEMENT_EVENT, handle)
    return () => window.removeEventListener(ACHIEVEMENT_EVENT, handle)
  }, [])

  const count = found.length
  const complete = count >= TOTAL_ACHIEVEMENTS
  const expanded = hovering || pinned

  return (
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
  )
}
