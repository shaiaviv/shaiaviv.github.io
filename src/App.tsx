import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Background from './components/Background'
import CursorGlow from './components/CursorGlow'
import DoodleTrail from './components/DoodleTrail'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Contact from './components/Contact'
import AchievementToasts from './components/AchievementToasts'
import UnlockBanners from './components/UnlockBanners'
import { unlockAchievement, ACHIEVEMENTS } from './lib/achievements'
import { isUnlocked } from './lib/unlocks'
import { dropEverything } from './lib/gravity'
import { installConsoleEgg } from './lib/consoleEgg'
import { eggStorm } from './lib/eggstorm'
import { burstConfetti } from './lib/confetti'

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
const GRAVITY_WORD = 'gravity'

const SWEEP_SECONDS = 5

/**
 * One white circle in `mix-blend-mode: difference`, grown from nothing to
 * beyond the viewport's corners. White-difference is arithmetically the exact
 * photographic negative (255 − channel) of everything painted behind it.
 *
 * Deliberately NOT `filter: invert(1)` on a wrapper: a filter establishes a
 * containing block for every position:fixed descendant, so the navbar,
 * background, cursor swarm and toasts would all stop being viewport-fixed and
 * scroll with the page mid-effect.
 *
 * The blend reaches the page because nothing above it isolates: App's wrapper
 * is `relative` with no z-index, so it creates no stacking context. Adding
 * `isolation: isolate` anywhere above this would silently reduce the whole
 * effect to a plain white disc.
 */
function NegativeSweep({ reduceMotion, onDone }: { reduceMotion: boolean; onDone: () => void }) {
  return (
    <motion.div
      className="fixed left-1/2 top-1/2 z-[9999] pointer-events-none rounded-full"
      style={{
        width: '150vmax',   // ≥ any viewport's diagonal (√2 × vmax), so scale 1 always covers
        height: '150vmax',
        x: '-50%',
        y: '-50%',
        backgroundColor: '#ffffff',
        mixBlendMode: 'difference',
      }}
      initial={reduceMotion ? { opacity: 0, scale: 1 } : { scale: 0 }}
      animate={reduceMotion ? { opacity: 1, scale: 1 } : { scale: 1 }}
      // A near-linear curve on purpose: the site's usual [0.22, 1, 0.36, 1] is
      // 85% done in the first quarter of its duration, which turns the sweep
      // into a snap. A wipe wants a wavefront moving at a roughly steady speed
      // — and since a circle's area grows with r², constant radius growth
      // already feels like it eases out.
      transition={{ duration: reduceMotion ? 0.45 : SWEEP_SECONDS, ease: [0.4, 0.1, 0.5, 1] }}
      onAnimationComplete={onDone}
    />
  )
}

export default function App() {
  /**
   * Konami toggles the page into its photographic negative and back, and the
   * state is a count of sweeps rather than a boolean because the way back is
   * the same animation, not a rewind: difference-with-white is an involution
   * (255 − (255 − x) = x), so a SECOND circle growing over the first cancels it
   * exactly, restoring true colour inside its radius. Once that second sweep
   * lands, both layers drop in one frame — the page is already back to normal,
   * so removing them changes nothing on screen.
   */
  const [sweeps, setSweeps] = useState(0)
  // Guards against re-triggering mid-sweep, which would leave one circle
  // growing inside another and make the two passes fight over the same pixels.
  const sweeping = useRef(false)

  useEffect(() => {
    // Two buffers because the codes are different shapes: konami mixes arrow
    // names with letters, while "gravity" is plain typed text.
    let progress: string[] = []
    let typed = ''

    const onKey = (e: KeyboardEvent) => {
      // Never fight a real text field for the visitor's keystrokes.
      const el = e.target as HTMLElement | null
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key

      if (key.length === 1) {
        typed = (typed + key).slice(-GRAVITY_WORD.length)
        // Gated: the word does nothing until the visitor has seen every
        // screenshot of a project and been told about it.
        if (typed === GRAVITY_WORD && isUnlocked('gravity')) {
          dropEverything()
          unlockAchievement(ACHIEVEMENTS.gravity)
        }
      }

      progress = [...progress, key].slice(-KONAMI.length)
      if (progress.join(',') !== KONAMI.join(',')) return
      if (sweeping.current) return
      sweeping.current = true
      setSweeps((n) => n + 1)
      burstConfetti(window.innerWidth / 2, window.innerHeight / 2, 140)
      unlockAchievement(ACHIEVEMENTS.konami)
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // The riddle on the back of the polaroid answers "the console", so this is
  // what has to be waiting there when a visitor works it out.
  useEffect(() => {
    installConsoleEgg(() => {
      eggStorm()
      unlockAchievement(ACHIEVEMENTS.consoleHi)
    })
  }, [])

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // data-doodle-root marks where DoodleTrail's "is this the bare backdrop?"
  // walk stops — this wrapper paints the page background, so it must not
  // itself count as a painted surface.
  return (
    <div
      // page-negative drives the .keep-color opt-out in index.css. Only while a
      // single layer is live: with two, the page already reads true colour.
      className={`min-h-screen bg-background relative${sweeps === 1 ? ' page-negative' : ''}`}
      data-doodle-root
    >
      <Background />
      <CursorGlow />
      <DoodleTrail />
      <AchievementToasts />
      <UnlockBanners />
      {/*
        No AnimatePresence: the layers must vanish in a single frame when the
        pair cancels out. An exit animation would retract the first circle and
        visibly re-invert the page on the way out.

        Both sit below the confetti's own canvas (z-10000), so the confetti
        stays in true colour against the negative page.
      */}
      {/* Stays mounted through the second pass — it is the inversion the second
          circle cancels. Unmounting it here would snap the page back to true
          colour and leave the return sweep re-inverting it instead. */}
      {sweeps >= 1 && (
        <NegativeSweep
          key="invert"
          reduceMotion={reduceMotion}
          onDone={() => { sweeping.current = false }}
        />
      )}
      {sweeps === 2 && (
        <NegativeSweep
          key="restore"
          reduceMotion={reduceMotion}
          onDone={() => { setSweeps(0); sweeping.current = false }}
        />
      )}
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
          Designed &amp; built by Shai Aviv — psst, try the{' '}
          {/*
            Both labels sit in the SAME grid cell, so the box is always as wide
            as the wider of the two and the sentence never reflows on hover.
            Crossfading with an absolutely positioned overlay would collapse the
            box to zero width and shove the rest of the line around instead.

            The compact ↑↑↓↓←→←→BA form is 10 characters against the label's 11,
            so the reserved width is near identical and the centred footer
            doesn't sit visibly off-centre while idle.
          */}
          <span
            tabIndex={0}
            className="group relative inline-grid cursor-help underline decoration-dotted decoration-text-1/30 underline-offset-4 outline-none"
          >
            <span className="[grid-area:1/1] transition-opacity duration-300 group-hover:opacity-0 group-focus:opacity-0">
              konami code
            </span>
            {/* aria-hidden: screen readers get the phrase, which is the part
                that's actually searchable — the glyphs are a visual reveal. */}
            <span
              aria-hidden="true"
              className="[grid-area:1/1] text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus:opacity-100"
            >
              ↑↑↓↓←→←→BA
            </span>
          </span>
        </footer>
      </div>
    </div>
  )
}
