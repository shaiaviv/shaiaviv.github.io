import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Background from './components/Background'
import CursorGlow from './components/CursorGlow'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Contact from './components/Contact'
import AchievementToasts from './components/AchievementToasts'
import { unlockAchievement, ACHIEVEMENTS } from './lib/achievements'
import { burstConfetti } from './lib/confetti'

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

export default function App() {
  const [partyMode, setPartyMode] = useState(false)

  useEffect(() => {
    let progress: string[] = []
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      progress = [...progress, key].slice(-KONAMI.length)
      if (progress.join(',') === KONAMI.join(',')) {
        setPartyMode(true)
        burstConfetti(window.innerWidth / 2, window.innerHeight / 2, 140)
        unlockAchievement(ACHIEVEMENTS.konami)
        setTimeout(() => setPartyMode(false), 2400)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="min-h-screen bg-background relative">
      <Background />
      <CursorGlow />
      <AchievementToasts />
      <AnimatePresence>
        {partyMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9996] pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(108,92,231,0.12), rgba(255,107,87,0.12), rgba(255,194,60,0.12))',
            }}
          />
        )}
      </AnimatePresence>
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <About />
          <Projects />
          <Skills />
          <Contact />
        </main>
        <footer className="py-10 text-center font-mono text-xs text-text-2 border-t-[3px] border-text-1/10 tracking-widest uppercase font-bold">
          Designed &amp; built by Shai Aviv — psst, try the konami code
        </footer>
      </div>
    </div>
  )
}
