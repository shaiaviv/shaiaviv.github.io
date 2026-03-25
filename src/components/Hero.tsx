import { useRef, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useScroll, useTransform } from 'framer-motion'
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
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

function MagneticButton({
  href, children, primary,
}: {
  href: string; children: React.ReactNode; primary?: boolean
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
  const scrambledName = useTextScramble('Shai Aviv', 400)
  const { text: role } = useTypewriter(ROLES, { initialDelay: 1600 })
  const sectionRef = useRef<HTMLElement>(null)

  // Scroll-driven parallax — each layer moves at a different rate,
  // creating the illusion of depth as the user scrolls away
  const { scrollY } = useScroll()
  const badgeY    = useTransform(scrollY, [0, 600], [0, -18])
  const nameY     = useTransform(scrollY, [0, 600], [0, -75])
  const taglineY  = useTransform(scrollY, [0, 600], [0, -55])
  const bioY      = useTransform(scrollY, [0, 600], [0, -38])
  const ctaY      = useTransform(scrollY, [0, 600], [0, -22])
  const heroOpacity = useTransform(scrollY, [0, 520], [1, 0])
  const heroScale   = useTransform(scrollY, [0, 600], [1, 0.96])

  // Mouse-driven 2D parallax — three decorative depth planes.
  // Moving elements in OPPOSITE directions from the same mouse input
  // creates genuine stereoscopic depth that scroll-only parallax can't.
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothX = useSpring(mouseX, { stiffness: 60, damping: 20 })
  const smoothY = useSpring(mouseY, { stiffness: 60, damping: 20 })

  // Far plane: dot grid — moves opposite to near elements (depth illusion)
  const dotX = useTransform(smoothX, [-0.5, 0.5], [20, -20])
  const dotY = useTransform(smoothY, [-0.5, 0.5], [12, -12])
  // Mid plane: rotating dashed ring — moderate movement
  const ringX = useTransform(smoothX, [-0.5, 0.5], [-15, 15])
  const ringY = useTransform(smoothY, [-0.5, 0.5], [-10, 10])
  // Near plane: gradient orb — moves most (feels closest to camera)
  const orbX = useTransform(smoothX, [-0.5, 0.5], [-30, 30])
  const orbY = useTransform(smoothY, [-0.5, 0.5], [-20, 20])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5)
      mouseY.set(e.clientY / window.innerHeight - 0.5)
    }
    const handleLeave = () => {
      mouseX.set(0)
      mouseY.set(0)
    }

    window.addEventListener('mousemove', handleMove, { passive: true })
    section.addEventListener('mouseleave', handleLeave)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      section.removeEventListener('mouseleave', handleLeave)
    }
  }, [mouseX, mouseY])

  return (
    <motion.section
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={sectionRef as any}
      className="min-h-screen flex items-center justify-center px-6 pt-20 relative overflow-hidden"
      style={{ opacity: heroOpacity, scale: heroScale }}
    >
      {/* Gradient orb — near parallax plane (tracks mouse most aggressively) */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ right: '-5%', top: '0%', x: orbX, y: orbY }}
        aria-hidden="true"
      >
        <div style={{
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,229,160,0.13) 0%, rgba(0,184,212,0.06) 40%, transparent 65%)',
          filter: 'blur(90px)',
        }} />
      </motion.div>

      {/* Dashed rotating ring — mid parallax plane */}
      <motion.div
        className="absolute pointer-events-none hidden md:block"
        style={{ right: '8%', top: '15%', x: ringX, y: ringY }}
        animate={{ rotate: 360 }}
        transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
        aria-hidden="true"
      >
        <svg width="260" height="260" viewBox="0 0 260 260" fill="none">
          <circle cx="130" cy="130" r="129" stroke="rgba(0,229,160,0.07)" strokeWidth="1" strokeDasharray="3 9" />
          <circle cx="130" cy="130" r="86" stroke="rgba(0,184,212,0.05)" strokeWidth="1" strokeDasharray="2 13" />
        </svg>
      </motion.div>

      {/* Dot grid — far parallax plane (opposite direction = stereo depth) */}
      <motion.div
        className="absolute pointer-events-none hidden lg:block"
        style={{ right: '5%', top: '50%', marginTop: '-3.5rem', x: dotX, y: dotY }}
        aria-hidden="true"
      >
        <div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(7, 4px)', opacity: 0.065 }}>
          {Array.from({ length: 49 }).map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-accent" />
          ))}
        </div>
      </motion.div>

      <motion.div
        className="max-w-5xl w-full relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge — fastest parallax layer (closest) */}
        <motion.div variants={itemVariants} style={{ y: badgeY }} className="mb-8">
          <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-mono font-medium text-accent bg-accent/10 border border-accent/20">
            <span className="relative flex h-2 w-2">
              <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            Available for new opportunities
          </span>
        </motion.div>

        {/* Name — large, moves most (feels closest) */}
        <motion.div variants={itemVariants} style={{ y: nameY }}>
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
        <motion.div variants={itemVariants} style={{ y: taglineY }} className="mb-4 h-10 flex items-center">
          <span className="text-xl sm:text-2xl font-semibold text-text-2 tracking-tight font-mono">
            {role || '\u00A0'}
            <span className={`ml-0.5 text-accent cursor-blink ${role ? '' : 'opacity-0'}`}>|</span>
          </span>
        </motion.div>

        {/* Bio */}
        <motion.p
          variants={itemVariants}
          style={{ y: bioY }}
          className="text-muted text-lg max-w-lg mb-10 leading-relaxed"
        >
          AI-native engineer with a product mindset. I build real-time web apps,
          mobile apps, and AI-powered tools end-to-end — from idea to production.
        </motion.p>

        {/* Stats */}
        <motion.div variants={itemVariants} style={{ y: ctaY }} className="flex flex-wrap gap-8 mb-10">
          {[
            { value: '5+', label: 'Projects shipped' },
            { value: '87.5', label: 'University GPA' },
            { value: 'BIU', label: 'Bar-Ilan University' },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col gap-1">
              <span className="text-3xl font-black font-mono text-accent leading-none">{value}</span>
              <span className="text-xs text-muted font-mono tracking-widest uppercase">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div variants={itemVariants} style={{ y: ctaY }} className="flex flex-wrap gap-4 mb-16">
          <MagneticButton href="#projects" primary>View my projects →</MagneticButton>
          <MagneticButton href="#contact">Get in touch</MagneticButton>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div variants={itemVariants} style={{ y: ctaY }} className="flex items-center gap-3">
          <div className="w-px h-12 overflow-hidden">
            <div
              className="w-full h-full scroll-indicator-line"
              style={{ background: 'linear-gradient(to bottom, #00e5a0, #00b8d4)' }}
            />
          </div>
          <span className="font-mono text-xs text-muted tracking-[0.2em] uppercase">Scroll</span>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}
