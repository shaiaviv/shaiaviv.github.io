import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { projects } from '../data/projects'
import ProjectCard from './ProjectCard'

export default function Projects() {
  const constraintsRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  return (
    <section id="projects" className="py-32">
      <div className="max-w-5xl mx-auto px-6 mb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="section-label mb-6">Projects</div>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h3
              className="font-black text-text-1 tracking-tight leading-tight"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}
            >
              Things I've built
            </h3>
            <span className="font-mono text-xs text-muted tracking-widest flex items-center gap-2 mb-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              drag to explore
            </span>
          </div>
        </motion.div>
      </div>

      {/* Draggable carousel */}
      <div ref={constraintsRef} className="overflow-hidden">
        <motion.div
          drag="x"
          dragConstraints={constraintsRef}
          dragElastic={0.06}
          dragTransition={{ bounceStiffness: 280, bounceDamping: 28 }}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setTimeout(() => setIsDragging(false), 80)}
          className="flex gap-5 cursor-grab active:cursor-grabbing pl-6 pr-6 select-none"
          style={{ width: 'max-content' }}
        >
          {projects.map((project, i) => (
            <div key={project.name} style={{ width: 340, flexShrink: 0 }}>
              <ProjectCard project={project} index={i} isDragging={isDragging} />
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-12 text-center px-6"
      >
        <a
          href="https://github.com/shaiaviv"
          target="_blank"
          rel="noopener noreferrer"
          className="animated-underline inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors duration-200 font-mono"
        >
          View more on GitHub
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </motion.div>
    </section>
  )
}
