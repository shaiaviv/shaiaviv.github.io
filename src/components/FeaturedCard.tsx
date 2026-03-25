import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion'
import type { Project } from '../data/projects'

const languageColors: Record<string, string> = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  Swift: '#f05138',
  Python: '#3776ab',
  Java: '#b07219',
  Dart: '#00b4ab',
}

export default function FeaturedCard({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  const spotX = useTransform(mouseX, [0, 1], [0, 100])
  const spotY = useTransform(mouseY, [0, 1], [0, 100])
  const spotlightBg = useMotionTemplate`radial-gradient(380px circle at ${spotX}% ${spotY}%, rgba(0,229,160,0.08), transparent 65%)`

  // 3D tilt — same physics as ProjectCard but gentler (larger card = subtler rotation)
  const rawRotateX = useTransform(mouseY, [0, 1], [3, -3])
  const rawRotateY = useTransform(mouseX, [0, 1], [-3, 3])
  const rotateX = useSpring(rawRotateX, { stiffness: 180, damping: 24 })
  const rotateY = useSpring(rawRotateY, { stiffness: 180, damping: 24 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width)
    mouseY.set((e.clientY - rect.top) / rect.height)
  }
  const handleMouseLeave = () => { mouseX.set(0.5); mouseY.set(0.5) }

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformPerspective: 900, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative glass-card rounded-2xl overflow-hidden group
        hover:border-accent/15 hover:shadow-[0_16px_60px_rgba(0,229,160,0.07)]
        transition-[border-color,box-shadow] duration-400"
    >
      {/* Spotlight */}
      <motion.div className="absolute inset-0 pointer-events-none rounded-2xl" style={{ background: spotlightBg }} />

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(90deg, transparent 0%, #00e5a0 50%, transparent 100%)' }}
      />

      <div className="relative z-10 flex flex-col md:flex-row gap-0">
        {/* Left: content */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
          <div>
            {/* Featured label */}
            <div className="flex items-center gap-2 mb-6">
              <span className="font-mono text-xs text-accent tracking-widest uppercase">Featured Project</span>
              <span className="flex-1 h-px bg-accent/20" />
            </div>

            <h3 className="text-3xl font-black text-text-1 tracking-tight mb-3 group-hover:text-accent transition-colors duration-200">
              {project.name}
            </h3>

            <p className="text-text-2 leading-relaxed mb-8 max-w-lg text-base">
              {project.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-xs text-accent/80 bg-accent/8 border border-accent/12 px-3 py-1 rounded-lg"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4">
            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-text-2 hover:text-accent transition-colors duration-200"
              >
                <svg style={{ width: 16, height: 16 }} fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub
              </a>
            )}
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-background rounded-lg text-sm font-bold transition-colors duration-200"
              >
                Live Demo
                <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Right: visual panel */}
        <div className="md:w-72 border-t md:border-t-0 md:border-l border-accent/[0.06] bg-accent/[0.02] flex flex-col items-center justify-center p-10 gap-6">
          {/* Language badge */}
          <div className="flex flex-col items-center gap-2">
            <span
              className="w-4 h-4 rounded-full"
              style={{
                backgroundColor: languageColors[project.language] ?? '#888',
                boxShadow: `0 0 16px ${languageColors[project.language] ?? '#888'}90`,
              }}
            />
            <span className="font-mono text-xs text-muted tracking-wide">{project.language}</span>
          </div>

          {/* Decorative grid of dots — fixed opacity pattern */}
          <div className="grid grid-cols-6 gap-2 opacity-20">
            {[1,0,1,1,0,1, 0,1,1,0,1,0, 1,1,0,1,0,1, 0,1,0,1,1,0, 1,0,1,0,1,1].map((on, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-accent" style={{ opacity: on ? 1 : 0.25 }} />
            ))}
          </div>

          <div className="text-center">
            <div className="font-mono text-[0.65rem] text-muted tracking-widest uppercase mb-1">Status</div>
            <div className="font-mono text-xs text-accent font-semibold">Live in Production</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
