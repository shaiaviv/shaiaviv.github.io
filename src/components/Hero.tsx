import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useTextScramble } from '../hooks/useTextScramble'
import { useTypewriter } from '../hooks/useTypewriter'

const ROLES = [
  'Full-Stack Developer',
  'AI-Native Builder',
  'Mobile App Creator',
  'CS Graduate (GPA 87.5)',
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

function MagneticButton({
  href,
  children,
  primary,
}: {
  href: string
  children: React.ReactNode
  primary?: boolean
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 18 })
  const springY = useSpring(y, { stiffness: 200, damping: 18 })

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect()
    x.set((e.clientX - rect.left - rect.width / 2) * 0.28)
    y.set((e.clientY - rect.top - rect.height / 2) * 0.28)
  }
  const handleMouseLeave = () => { x.set(0); y.set(0) }

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.96 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={
        primary
          ? 'px-7 py-3.5 bg-accent hover:bg-accent-hover text-background rounded-xl font-bold text-sm glow-accent-sm transition-colors duration-200 inline-block tracking-wide'
          : 'btn-outline-gradient px-7 py-3.5 text-text-2 hover:text-text-1 rounded-xl font-semibold text-sm transition-colors duration-200 inline-block'
      }
    >
      {children}
    </motion.a>
  )
}

export default function Hero() {
  // Scramble the name on load
  const scrambledName = useTextScramble('Shai Aviv', 400)
  // Typewriter for the role
  const { text: role, isTyping } = useTypewriter(ROLES, { initialDelay: 1600 })

  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-20">
      <motion.div
        className="max-w-5xl w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Availability badge */}
        <motion.div variants={itemVariants} className="mb-8">
          <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-mono font-medium text-accent bg-accent/10 border border-accent/20">
            <span className="relative flex h-2 w-2">
              <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            Available for new opportunities
          </span>
        </motion.div>

        {/* Scrambled name */}
        <motion.div variants={itemVariants}>
          <h1
            className="font-black tracking-tight leading-none mb-3 font-mono"
            style={{ fontSize: 'clamp(3rem, 9.5vw, 7rem)' }}
            aria-label="Shai Aviv"
          >
            {scrambledName.map((char, i) => (
              <span
                key={i}
                className="inline-block text-gradient"
                style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
            <span className="text-accent">.</span>
          </h1>
        </motion.div>

        {/* Typewriter role */}
        <motion.div variants={itemVariants} className="mb-4 h-10 flex items-center">
          <span className="text-xl sm:text-2xl font-semibold text-text-2 tracking-tight font-mono">
            {role || '\u00A0'}
            <span className={`ml-0.5 text-accent cursor-blink ${role ? '' : 'opacity-0'}`}>|</span>
          </span>
        </motion.div>

        {/* Bio */}
        <motion.p
          variants={itemVariants}
          className="text-muted text-lg max-w-lg mb-10 leading-relaxed"
        >
          I ship real-time web apps, mobile apps, and AI-powered tools — from idea to
          production. Bar-Ilan University CS grad.
        </motion.p>

        {/* Stats */}
        <motion.div variants={itemVariants} className="flex flex-wrap gap-8 mb-10">
          {[
            { value: '5+', label: 'Projects shipped' },
            { value: '87.5', label: 'University GPA' },
            { value: 'BIU', label: 'Bar-Ilan Univ.' },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col gap-1">
              <span className="text-3xl font-black font-mono text-accent leading-none">{value}</span>
              <span className="text-xs text-muted font-mono tracking-widest uppercase">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mb-16">
          <MagneticButton href="#projects" primary>
            View my projects →
          </MagneticButton>
          <MagneticButton href="#contact">
            Get in touch
          </MagneticButton>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div variants={itemVariants} className="flex items-center gap-3">
          <div className="w-px h-12 overflow-hidden">
            <div
              className="w-full h-full scroll-indicator-line"
              style={{ background: 'linear-gradient(to bottom, #00e5a0, #00b8d4)' }}
            />
          </div>
          <span className="font-mono text-xs text-muted tracking-[0.2em] uppercase">Scroll</span>
        </motion.div>
      </motion.div>
    </section>
  )
}
