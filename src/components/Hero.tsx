import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useScroll, useTransform, useAnimation } from 'framer-motion'
import { useTextScramble } from '../hooks/useTextScramble'
import { useTypewriter } from '../hooks/useTypewriter'
import { unlockAchievement, ACHIEVEMENTS } from '../lib/achievements'
import { burstConfetti } from '../lib/confetti'
import { dragBounce, dragWhile, onDragUnlock } from '../lib/dragProps'
import { useDragSuppressClick } from '../hooks/useDragSuppressClick'

const ROLES = [
  'Full-Stack Developer',
  'AI-Native Engineer',
  'Product-Minded Builder',
  'Perpetual Learner',
  'Idea → Production',
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

function MagneticButton({
  href, children, primary, target, onClick,
}: {
  href: string; children: React.ReactNode; primary?: boolean; target?: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const isDragging = useRef(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 18 })
  const springY = useSpring(y, { stiffness: 200, damping: 18 })
  const dragSuppress = useDragSuppressClick()

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) return
    const rect = ref.current!.getBoundingClientRect()
    x.set((e.clientX - rect.left - rect.width / 2) * 0.28)
    y.set((e.clientY - rect.top - rect.height / 2) * 0.28)
  }
  const handleMouseLeave = () => { if (!isDragging.current) { x.set(0); y.set(0) } }

  return (
    <motion.a
      ref={ref}
      href={href}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      style={{ x: springX, y: springY, touchAction: 'none' }}
      drag
      dragSnapToOrigin
      dragElastic={0.15}
      dragTransition={dragBounce}
      whileDrag={dragWhile}
      whileTap={{ scale: 0.94, translate: '2px 2px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onDragStart={() => { isDragging.current = true; dragSuppress.onDragStart() }}
      onDrag={dragSuppress.onDrag}
      onDragEnd={() => { isDragging.current = false }}
      onClick={(e) => {
        dragSuppress.onClick(e)
        if (!e.defaultPrevented) onClick?.(e)
      }}
      className={
        primary
          ? 'sticker-btn px-7 py-3.5 bg-accent hover:bg-accent-hover text-white rounded-2xl font-bold text-sm transition-colors duration-200 inline-block tracking-wide cursor-grab active:cursor-grabbing'
          : 'sticker-btn px-7 py-3.5 bg-surface text-text-1 hover:bg-surface-2 rounded-2xl font-bold text-sm transition-colors duration-200 inline-block tracking-wide cursor-grab active:cursor-grabbing'
      }
    >
      {children}
    </motion.a>
  )
}

/** A single letter you can grab and fling — springs back to its spot on release. */
function DraggableLetter({ char, gradient }: { char: string; gradient?: boolean }) {
  if (char === ' ') return <span className="inline-block w-[0.3em]" />

  return (
    <motion.span
      className={`inline-block cursor-grab active:cursor-grabbing select-none ${gradient ? 'text-gradient' : ''}`}
      drag
      dragSnapToOrigin
      dragElastic={0.15}
      dragTransition={{ bounceStiffness: 340, bounceDamping: 18 }}
      whileDrag={{ scale: 1.3, zIndex: 50 }}
      whileHover={{ y: -6, rotate: -4 }}
      onDragStart={onDragUnlock}
      style={{ touchAction: 'none' }}
    >
      {char}
    </motion.span>
  )
}

/** A small floating doodle you can also grab and toss — pure desk-toy delight. */
function DeskToy({
  children, top, left, right, bottom, duration, className = '',
}: {
  children: React.ReactNode
  top?: string; left?: string; right?: string; bottom?: string
  duration: number
  className?: string
}) {
  return (
    <motion.div
      className={`absolute pointer-events-auto cursor-grab active:cursor-grabbing select-none float-bob hidden sm:block ${className}`}
      style={{ top, left, right, bottom, touchAction: 'none', ['--bob-dur' as any]: `${duration}s` } as React.CSSProperties}
      drag
      dragSnapToOrigin
      dragElastic={0.2}
      whileDrag={{ scale: 1.25, zIndex: 50 }}
      whileHover={{ scale: 1.12 }}
      onDragStart={onDragUnlock}
    >
      {children}
    </motion.div>
  )
}

const StarDoodle = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <path d="M20 3l3.6 11.4L35 18l-11.4 3.6L20 33l-3.6-11.4L5 18l11.4-3.6L20 3z" fill="#ffc23c" stroke="#171310" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
)
const BoltDoodle = () => (
  <svg width="34" height="42" viewBox="0 0 34 42" fill="none">
    <path d="M20 2L4 24h11l-3 16 18-24H19l1-14z" fill="#ff6b57" stroke="#171310" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
)
const SquiggleDoodle = () => (
  <svg width="52" height="28" viewBox="0 0 52 28" fill="none">
    <path d="M3 20c5-14 10-14 15 0s10 14 15 0 10-14 15 0" stroke="#6c5ce7" strokeWidth="4" strokeLinecap="round" fill="none" />
  </svg>
)
const CircleScribbleDoodle = () => (
  <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
    <circle cx="19" cy="19" r="14" fill="#06d6a0" stroke="#171310" strokeWidth="2.5" />
  </svg>
)

export default function Hero() {
  const scrambledName = useTextScramble('Shai Aviv', 400)
  const { text: role } = useTypewriter(ROLES, { initialDelay: 1600 })
  const sectionRef = useRef<HTMLElement>(null)
  const danceControls = useAnimation()

  const handleDance = (e: React.MouseEvent<HTMLSpanElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 45)
    unlockAchievement(ACHIEVEMENTS.metaSentence)
    danceControls.start({
      rotate: [0, -6, 6, -8, 8, -5, 5, -2, 2, 0],
      y: [0, -10, 0, -8, 0, -5, 0, -2, 0],
      scale: [1, 1.06, 0.97, 1.05, 0.98, 1.03, 1],
      transition: { duration: 0.9, ease: 'easeInOut' },
    })
  }

  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 520], [1, 0])
  const heroScale   = useTransform(scrollY, [0, 600], [1, 0.97])

  return (
    <motion.section
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center px-6 pt-24 pb-12 relative"
      style={{ opacity: heroOpacity, scale: heroScale }}
    >
      <DeskToy top="18%" left="6%" duration={5.5}><StarDoodle /></DeskToy>
      <DeskToy top="12%" right="10%" duration={4.5} className="rotate-12"><BoltDoodle /></DeskToy>
      <DeskToy bottom="22%" left="10%" duration={6} className="-rotate-6"><SquiggleDoodle /></DeskToy>
      <DeskToy bottom="14%" right="8%" duration={5} ><CircleScribbleDoodle /></DeskToy>

      <motion.div
        className="max-w-5xl w-full relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-8">
          <motion.span
            drag
            dragSnapToOrigin
            dragElastic={0.15}
            dragTransition={dragBounce}
            whileDrag={dragWhile}
            onDragStart={onDragUnlock}
            whileHover={{ y: -3, rotate: -1.5 }}
            style={{ touchAction: 'none' }}
            className="chip inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-mono font-bold text-text-1 bg-surface cursor-grab active:cursor-grabbing select-none"
          >
            <span className="relative flex h-2 w-2">
              <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-cyan opacity-70" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan" />
            </span>
            Available for new opportunities
          </motion.span>
        </motion.div>

        {/* Name — every character is draggable */}
        <motion.div variants={itemVariants}>
          <h1
            className="font-display font-bold tracking-tight leading-none mb-3"
            style={{ fontSize: 'clamp(3rem, 9.5vw, 7rem)' }}
            aria-label="Shai Aviv"
          >
            {scrambledName.map((char, i) => (
              <DraggableLetter key={i} char={char} gradient />
            ))}
            <span className="text-accent">.</span>
          </h1>
        </motion.div>

        {/* Typewriter role */}
        <motion.div variants={itemVariants} className="mb-4 h-10 flex items-center">
          <span className="text-xl sm:text-2xl font-bold text-text-2 tracking-tight font-mono">
            {role || ' '}
            <span className={`ml-0.5 text-accent cursor-blink ${role ? '' : 'opacity-0'}`}>|</span>
          </span>
        </motion.div>

        {/* Bio */}
        <motion.p
          variants={itemVariants}
          className="text-text-2 text-lg max-w-lg mb-10 leading-relaxed font-medium"
        >
          <span className="text-text-1 font-bold">AI-native software engineer with a product mindset, driven to learn,
          build end-to-end, and ship.</span>
          <br />
          <br />
          <motion.span
            animate={danceControls}
            onClick={handleDance}
            whileHover={{ scale: 1.02 }}
            className="inline-block cursor-pointer select-none"
          >
            I believe my personal site should be as fun as I am, so go ahead and play around on the page to find all the hidden easter eggs.
          </motion.span>
        </motion.p>

        {/* Stats */}
        <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mb-10">
          {[
            { value: '87.5', label: 'University GPA', color: 'bg-accent-dim' },
            { value: 'BIU', label: 'Bar-Ilan University', color: 'bg-accent-dim' },
          ].map(({ value, label }) => (
            <motion.div
              key={label}
              drag
              dragSnapToOrigin
              dragElastic={0.15}
              dragTransition={dragBounce}
              whileDrag={dragWhile}
              onDragStart={onDragUnlock}
              whileHover={{ y: -3 }}
              style={{ touchAction: 'none' }}
              className="chip rounded-2xl px-4 py-2.5 bg-surface flex flex-col gap-0.5 cursor-grab active:cursor-grabbing select-none"
            >
              <span className="text-2xl font-display font-bold text-accent leading-none">{value}</span>
              <span className="text-[0.65rem] text-text-2 font-mono tracking-widest uppercase">{label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mb-16">
          <MagneticButton
            href="#projects"
            primary
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 40)
            }}
          >
            View my projects →
          </MagneticButton>
          <MagneticButton href="#contact">Get in touch</MagneticButton>
          <MagneticButton href="/resume.pdf" target="_blank">View Resume</MagneticButton>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div variants={itemVariants} className="flex items-center gap-3">
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2v13M3 9l6 6 6-6" stroke="#ff6b57" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
          <span className="font-mono text-xs text-text-2 tracking-[0.2em] uppercase font-bold">Scroll (or drag stuff)</span>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}
