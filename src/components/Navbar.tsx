import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { dragBounce, dragWhile } from '../lib/dragProps'
import { useDragSuppressClick } from '../hooks/useDragSuppressClick'

const links = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const dragSuppress = useDragSuppressClick()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    document.querySelectorAll('section[id]').forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-4 left-0 right-0 z-50 px-4"
    >
      <div
        className={`max-w-3xl mx-auto flex items-center justify-between rounded-full px-3 py-2 transition-shadow duration-300 ${
          scrolled ? 'sticker bg-surface' : 'bg-surface/70 backdrop-blur-sm border-2 border-transparent'
        }`}
      >
        <motion.a
          href="#"
          drag
          dragSnapToOrigin
          dragElastic={0.15}
          dragTransition={dragBounce}
          whileDrag={dragWhile}
          whileHover={{ rotate: -6, scale: 1.05 }}
          {...dragSuppress}
          style={{ touchAction: 'none' }}
          className="font-display text-sm font-bold tracking-wide pl-2.5 pr-1 cursor-grab active:cursor-grabbing select-none"
        >
          <span className="text-accent">Shai</span>
          <span className="text-text-1">.dev</span>
        </motion.a>

        <ul className="hidden sm:flex items-center gap-1">
          {links.map((link) => {
            const isActive = activeSection === link.href.slice(1)
            return (
              <li key={link.href}>
                <motion.a
                  href={link.href}
                  drag
                  dragSnapToOrigin
                  dragElastic={0.15}
                  dragTransition={dragBounce}
                  whileDrag={dragWhile}
                  {...dragSuppress}
                  style={{ touchAction: 'none' }}
                  className={`relative text-sm px-3 py-1.5 rounded-full transition-colors duration-200 font-bold inline-block cursor-grab active:cursor-grabbing select-none ${
                    isActive ? 'text-white' : 'text-text-2 hover:text-text-1'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-full bg-accent -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {link.label}
                </motion.a>
              </li>
            )
          })}
          <li>
            <motion.a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              drag
              dragSnapToOrigin
              dragElastic={0.15}
              dragTransition={dragBounce}
              whileDrag={dragWhile}
              {...dragSuppress}
              style={{ touchAction: 'none' }}
              className="sticker-btn text-xs font-mono font-bold text-text-1 bg-green ml-1 px-3 py-1.5 rounded-full inline-block cursor-grab active:cursor-grabbing select-none"
            >
              Resume
            </motion.a>
          </li>
        </ul>

        {/* Compact mobile-only resume link — full link list is hidden below sm */}
        <motion.a
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          drag
          dragSnapToOrigin
          dragElastic={0.15}
          dragTransition={dragBounce}
          whileDrag={dragWhile}
          {...dragSuppress}
          style={{ touchAction: 'none' }}
          className="sticker-btn sm:hidden text-xs font-mono font-bold text-text-1 bg-green px-3 py-1.5 rounded-full inline-block cursor-grab active:cursor-grabbing select-none"
        >
          Resume
        </motion.a>
      </div>
    </motion.nav>
  )
}
