import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ACHIEVEMENT_EVENT, type Achievement } from '../lib/achievements'

interface Toast extends Achievement {
  key: number
}

export default function AchievementToasts() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    let counter = 0
    const handle = (e: Event) => {
      const detail = (e as CustomEvent<Achievement>).detail
      const key = counter++
      setToasts((prev) => [...prev, { ...detail, key }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.key !== key))
      }, 4200)
    }
    window.addEventListener(ACHIEVEMENT_EVENT, handle)
    return () => window.removeEventListener(ACHIEVEMENT_EVENT, handle)
  }, [])

  return (
    <div className="fixed bottom-5 right-5 z-[9997] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.key}
            initial={{ opacity: 0, x: 60, rotate: 6, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, rotate: -2, scale: 1 }}
            exit={{ opacity: 0, x: 40, rotate: 8, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="sticker rounded-2xl px-4 py-3 max-w-[15rem] bg-surface-2 pointer-events-auto"
          >
            <div className="flex items-start gap-2.5">
              <span className="text-2xl leading-none">{t.emoji}</span>
              <div>
                <div className="font-display font-bold text-sm text-text-1 leading-tight">{t.title}</div>
                <div className="font-mono text-[0.68rem] text-text-2 mt-1 leading-snug">{t.message}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
