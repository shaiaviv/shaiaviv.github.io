import { useState } from 'react'
import { motion } from 'framer-motion'
import RevealText from './RevealText'
import { dragBounce, dragWhile, onDragUnlock } from '../lib/dragProps'

const skillsRow1 = [
  { name: 'JavaScript', icon: '⚡', color: 'bg-green/40' },
  { name: 'React.js', icon: '⚛️', color: 'bg-cyan/25' },
  { name: 'Node.js', icon: '🟢', color: 'bg-accent-dim' },
  { name: 'Python', icon: '🐍', color: 'bg-pink/20' },
  { name: 'TypeScript', icon: '📘', color: 'bg-cyan/25' },
  { name: 'Java', icon: '☕', color: 'bg-green/40' },
  { name: 'REST APIs', icon: '🔗', color: 'bg-accent-dim' },
  { name: 'Socket.io', icon: '🔌', color: 'bg-pink/20' },
]

const skillsRow2 = [
  { name: 'Flutter / Dart', icon: '🎯', color: 'bg-accent-dim' },
  { name: 'MongoDB', icon: '🍃', color: 'bg-green/40' },
  { name: 'Firebase', icon: '🔥', color: 'bg-pink/20' },
  { name: 'Git & GitHub', icon: '🌿', color: 'bg-cyan/25' },
  { name: 'Vercel / Railway', icon: '🚀', color: 'bg-accent-dim' },
  { name: 'HTML & CSS', icon: '🎨', color: 'bg-pink/20' },
  { name: 'Linux', icon: '🐧', color: 'bg-cyan/25' },
  { name: 'Claude Code', icon: '🤖', color: 'bg-green/40' },
]

function SkillBadge({
  name, icon, color, tilt, onDragStart, onDragEnd,
}: {
  name: string; icon: string; color: string; tilt: number
  onDragStart?: () => void; onDragEnd?: () => void
}) {
  return (
    <motion.div
      whileHover={{ rotate: 0, y: -4, scale: 1.06 }}
      drag
      dragSnapToOrigin
      dragElastic={0.15}
      dragTransition={dragBounce}
      whileDrag={dragWhile}
      onDragStart={() => { onDragUnlock(); onDragStart?.() }}
      onDragEnd={onDragEnd}
      style={{ rotate: tilt, touchAction: 'none' }}
      className={`chip flex items-center gap-2.5 px-4 py-2.5 rounded-2xl flex-shrink-0 select-none mr-3 bg-surface cursor-grab active:cursor-grabbing ${color}`}
    >
      <span className="text-base leading-none">{icon}</span>
      <span className="text-sm font-bold text-text-1 whitespace-nowrap">{name}</span>
    </motion.div>
  )
}

export default function Skills() {
  const doubled1 = [...skillsRow1, ...skillsRow1, ...skillsRow1, ...skillsRow1]
  const doubled2 = [...skillsRow2, ...skillsRow2, ...skillsRow2, ...skillsRow2]
  // .marquee-track clips overflow to fake the infinite-scroll illusion, which
  // also clips a badge the instant a drag carries it outside that thin row —
  // lift the clip on just the row being dragged, restore it once released.
  const [draggingRow1, setDraggingRow1] = useState(false)
  const [draggingRow2, setDraggingRow2] = useState(false)

  return (
    <section id="skills" className="py-32 overflow-hidden relative">
      <div className="max-w-5xl mx-auto px-6 mb-14 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            drag
            dragSnapToOrigin
            dragElastic={0.15}
            dragTransition={dragBounce}
            whileDrag={dragWhile}
            onDragStart={onDragUnlock}
            style={{ touchAction: 'none' }}
            className="section-label mb-6 inline-flex cursor-grab active:cursor-grabbing select-none"
          >
            Skills
          </motion.div>
          <h3
            className="font-display font-bold text-text-1 tracking-tight leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}
          >
            <RevealText>Technologies I work with</RevealText>
          </h3>
          <p className="text-text-2 text-lg mt-3 max-w-md font-medium">
            The stack I reach for when shipping products.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="space-y-4 relative z-10"
      >
        <div
          className="marquee-track py-3"
          style={draggingRow1 ? { overflow: 'visible', maskImage: 'none', WebkitMaskImage: 'none' } : undefined}
        >
          <div className="marquee-row marquee-row-left">
            {doubled1.map((skill, i) => (
              <SkillBadge
                key={`r1-${i}`} {...skill} tilt={i % 2 === 0 ? -3 : 3}
                onDragStart={() => setDraggingRow1(true)}
                onDragEnd={() => setDraggingRow1(false)}
              />
            ))}
          </div>
        </div>
        <div
          className="marquee-track py-3"
          style={draggingRow2 ? { overflow: 'visible', maskImage: 'none', WebkitMaskImage: 'none' } : undefined}
        >
          <div className="marquee-row marquee-row-right">
            {doubled2.map((skill, i) => (
              <SkillBadge
                key={`r2-${i}`} {...skill} tilt={i % 2 === 0 ? 3 : -3}
                onDragStart={() => setDraggingRow2(true)}
                onDragEnd={() => setDraggingRow2(false)}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
