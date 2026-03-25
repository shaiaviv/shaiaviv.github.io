import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useScroll, useTransform } from 'framer-motion'
import RevealText from './RevealText'

function MagneticLink({
  href, children, primary, external,
}: {
  href: string; children: React.ReactNode; primary?: boolean; external?: boolean
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 18 })
  const springY = useSpring(y, { stiffness: 200, damping: 18 })

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect()
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3)
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3)
  }
  const handleMouseLeave = () => { x.set(0); y.set(0) }

  return (
    <motion.a
      ref={ref}
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.96 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={
        primary
          ? 'px-8 py-4 bg-accent hover:bg-accent-hover text-background rounded-xl font-bold text-sm glow-accent transition-colors duration-200 inline-block tracking-wide'
          : 'p-3.5 rounded-xl glass-card border border-accent/[0.08] hover:border-accent/25 text-muted hover:text-accent transition-colors duration-200 inline-flex items-center justify-center'
      }
    >
      {children}
    </motion.a>
  )
}

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  // Watermark drifts upward, rotates, and scales as section scrolls —
  // three simultaneous transforms on one element create compelling motion depth
  // Contact is the last section — scrollYProgress tops out ~0.55 before the page ends,
  // so map the animation into the reachable [0, 0.6] range and use larger values
  const watermarkY      = useTransform(scrollYProgress, [0, 0.6], [100, -60])
  const watermarkRotate = useTransform(scrollYProgress, [0, 0.6], [-14, 8])
  const watermarkScale  = useTransform(scrollYProgress, [0, 0.3, 0.6], [0.72, 1.0, 1.18])

  return (
    <section id="contact" ref={sectionRef} className="py-36 px-6 relative overflow-hidden">
      {/* Watermark with parallax */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ y: watermarkY, rotate: watermarkRotate, scale: watermarkScale }}
        aria-hidden="true"
      >
        <span
          className="font-black tracking-tighter leading-none"
          style={{
            fontSize: 'clamp(6rem, 22vw, 18rem)',
            color: 'transparent',
            WebkitTextStroke: '2px rgba(0,229,160,0.18)',
          }}
        >
          HELLO
        </span>
      </motion.div>

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-xl mx-auto"
        >
          <div className="section-label justify-center mb-8">Contact</div>

          <h3
            className="font-black text-text-1 tracking-tight leading-tight mb-6"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 4.5rem)' }}
          >
            <RevealText>Let's build</RevealText>
            <br />
            <span className="text-gradient">
              <RevealText delay={0.15}>something great.</RevealText>
            </span>
          </h3>

          <p className="text-text-2 mb-12 leading-relaxed text-lg max-w-md mx-auto">
            Whether you have a project in mind, want to collaborate, or just want to say hi.
            my inbox is always open.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <MagneticLink href="mailto:shaiaviv99@gmail.com" primary>
              Say Hello →
            </MagneticLink>
          </div>

          <div className="flex justify-center gap-4">
            <MagneticLink href="https://github.com/shaiaviv" external>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </MagneticLink>
            <MagneticLink href="https://linkedin.com/in/shai-aviv" external>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </MagneticLink>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
