import { motion } from 'framer-motion'
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
  return (
    <motion.a
      href={project.repo}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.01 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="card-glow bg-surface/80 backdrop-blur-sm border border-white/5 rounded-xl p-6 flex flex-col
        hover:border-accent/30 hover:shadow-[0_8px_32px_rgba(108,99,255,0.15),0_0_0_1px_rgba(108,99,255,0.1)]
        transition-all duration-300 group cursor-pointer relative overflow-hidden"
    >
      {/* Top gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-start justify-between mb-5">
        <motion.div
          whileHover={{ rotate: 5, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <svg className="w-8 h-8 text-accent/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
          </svg>
        </motion.div>
        <div className="flex gap-3">
          <a
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-[#f0f0f0] transition-colors"
            aria-label="GitHub repository"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
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
              className="text-muted hover:text-[#f0f0f0] transition-colors"
              aria-label="Live demo"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>

      <h3 className="text-[#f0f0f0] font-semibold text-lg mb-2 group-hover:text-accent transition-colors duration-200 tracking-tight">
        {project.name}
      </h3>
      <p className="text-[#888899] text-sm leading-relaxed flex-1 mb-5">
        {project.description}
      </p>

      <div className="flex items-center gap-4 mt-auto">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{
              backgroundColor: languageColors[project.language] ?? '#888',
              boxShadow: `0 0 6px ${languageColors[project.language] ?? '#888'}66`,
            }}
          />
          <span className="font-mono text-xs text-muted">{project.language}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {project.tags.map((tag) => (
            <span key={tag} className="font-mono text-xs text-accent/80 bg-accent/10 border border-accent/10 px-2 py-0.5 rounded-md">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.a>
  )
}
