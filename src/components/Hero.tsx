import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const name = 'Shai Aviv.'
const chars = name.split('')

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
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    x.set((e.clientX - cx) * 0.28)
    y.set((e.clientY - cy) * 0.28)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

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
          ? 'relative px-7 py-3.5 bg-accent hover:bg-accent-hover text-white rounded-xl font-semibold text-sm glow-accent-sm transition-colors duration-200 inline-block'
          : 'relative btn-outline-gradient px-7 py-3.5 text-text-2 hover:text-text-1 rounded-xl font-semibold text-sm transition-colors duration-200 inline-block'
      }
    >
      {children}
    </motion.a>
  )
}

export default function Hero() {
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
          <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-mono font-medium text-green bg-green/10 border border-green/20">
            <span className="relative flex h-2 w-2">
              <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green" />
            </span>
            Available for new opportunities
          </span>
        </motion.div>

        {/* Name — character-by-character */}
        <motion.h1
          variants={itemVariants}
          className="font-black mb-6 tracking-tight leading-none"
          style={{ fontSize: 'clamp(3.2rem, 9vw, 6.5rem)' }}
          aria-label={name}
        >
          {chars.map((char, i) => (
            <motion.span
              key={i}
              className={char === '.' ? 'text-accent' : 'text-gradient'}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.3 + i * 0.04,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.h1>

        {/* Tagline */}
        <motion.h2
          variants={itemVariants}
          className="text-2xl sm:text-3xl font-semibold tracking-tight mb-4 leading-snug"
        >
          <span className="text-text-1">Full-Stack Developer</span>
          <br />
          <span className="text-text-2 font-normal">&amp; AI-Native Builder.</span>
        </motion.h2>

        {/* Bio */}
        <motion.p
          variants={itemVariants}
          className="text-muted text-lg max-w-lg mb-10 leading-relaxed"
        >
          CS graduate from Bar-Ilan University (GPA 87.5). I ship real-time web apps,
          mobile apps, and AI-powered tools — from idea to production.
        </motion.p>

        {/* Stats row */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap gap-6 mb-10"
        >
          {[
            { value: '5+', label: 'Projects shipped' },
            { value: '87.5', label: 'GPA' },
            { value: '3+', label: 'Years coding' },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col">
              <span className="text-2xl font-black text-text-1 leading-none font-mono">{value}</span>
              <span className="text-xs text-muted mt-1 font-mono tracking-wide uppercase">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap gap-4 mb-16"
        >
          <MagneticButton href="#projects" primary>
            View my projects →
          </MagneticButton>
          <MagneticButton href="#contact">
            Get in touch
          </MagneticButton>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-3"
        >
          <div className="w-px h-12 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-b from-accent to-cyan scroll-indicator-line" />
          </div>
          <span className="font-mono text-xs text-muted tracking-widest uppercase">Scroll</span>
        </motion.div>
      </motion.div>
    </section>
  )
}
