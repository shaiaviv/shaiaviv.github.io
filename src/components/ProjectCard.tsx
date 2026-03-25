import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion'
import type { Project } from '../data/projects'

interface Props {
  project: Project
  index: number
}

const languageColors: Record<string, string> = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  Swift: '#f05138',
  Python: '#3776ab',
  HTML: '#e34f26',
  Java: '#b07219',
  Dart: '#00b4ab',
}

export default function ProjectCard({ project, index }: Props) {
  const cardRef = useRef<HTMLAnchorElement>(null)

  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  // 3D tilt — spring-smoothed
  const rawRotateX = useTransform(mouseY, [0, 1], [6, -6])
  const rawRotateY = useTransform(mouseX, [0, 1], [-6, 6])
  const rotateX = useSpring(rawRotateX, { stiffness: 180, damping: 24 })
  const rotateY = useSpring(rawRotateY, { stiffness: 180, damping: 24 })

  // Spotlight position (in %)
  const spotX = useTransform(mouseX, [0, 1], [0, 100])
  const spotY = useTransform(mouseY, [0, 1], [0, 100])
  const spotlightBg = useMotionTemplate`radial-gradient(220px circle at ${spotX}% ${spotY}%, rgba(139, 92, 246, 0.13), transparent 70%)`

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width)
    mouseY.set((e.clientY - rect.top) / rect.height)
  }

  const handleMouseLeave = () => {
    mouseX.set(0.5)
    mouseY.set(0.5)
  }

  return (
    <motion.a
      ref={cardRef}
      href={project.repo}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 700,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="glass-card rounded-2xl p-6 flex flex-col relative overflow-hidden cursor-pointer group
        hover:border-accent/20 hover:shadow-[0_12px_40px_rgba(139,92,246,0.12),0_0_0_1px_rgba(139,92,246,0.08)]
        transition-[border-color,box-shadow] duration-300"
    >
      {/* Dynamic spotlight */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ background: spotlightBg }}
      />

      {/* Top accent line */}
      <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Header */}
      <div className="flex items-start justify-between mb-5 relative z-10">
        <motion.div
          whileHover={{ rotate: 8, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="p-2.5 rounded-xl bg-accent/10 border border-accent/15"
        >
          <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
          </svg>
        </motion.div>

        <div className="flex gap-3">
          <a
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-muted hover:text-text-1 transition-colors duration-200"
            aria-label="GitHub repository"
          >
            <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
              <path fillRule="evenodd" clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          </a>
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-muted hover:text-text-1 transition-colors duration-200"
              aria-label="Live demo"
            >
              <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-text-1 font-bold text-lg mb-2.5 group-hover:text-accent transition-colors duration-200 tracking-tight relative z-10">
        {project.name}
      </h3>
      <p className="text-text-2 text-sm leading-relaxed flex-1 mb-5 relative z-10">
        {project.description}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-3 mt-auto flex-wrap relative z-10">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{
              backgroundColor: languageColors[project.language] ?? '#888',
              boxShadow: `0 0 8px ${languageColors[project.language] ?? '#888'}80`,
            }}
          />
          <span className="font-mono text-xs text-muted">{project.language}</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="font-mono text-xs text-accent/70 bg-accent/8 border border-accent/12 px-2 py-0.5 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.a>
  )
}
