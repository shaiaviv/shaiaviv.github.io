import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Project } from '../data/projects'
import ScreenshotLightbox from './ScreenshotLightbox'
import ArkanoidWidget from './ArkanoidWidget'
import { dragBounce, dragWhile } from '../lib/dragProps'
import { useDragSuppressClick } from '../hooks/useDragSuppressClick'

interface Props {
  project: Project
  index: number
}

const languageColors: Record<string, string> = {
  JavaScript: '#ffc23c',
  TypeScript: '#6c5ce7',
  Swift: '#ff6b57',
  Python: '#06d6a0',
  HTML: '#ff6b57',
  Java: '#8a8172',
  Dart: '#06d6a0',
}

const REST_SHADOW = '6px 6px 0 0 #171310'
const HOVER_SHADOW = '10px 10px 0 0 #171310'

export default function ProjectCard({ project, index }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const baseRotate = index % 2 === 0 ? -1.5 : 1.5
  const isArkanoid = project.name === 'Arkanoid Game'
  const dragSuppress = useDragSuppressClick()

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 28, rotate: baseRotate, boxShadow: REST_SHADOW }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ rotate: 0, x: -3, y: -10, boxShadow: HOVER_SHADOW }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => { if (project.repo) window.open(project.repo, '_blank', 'noopener,noreferrer') }}
      role={project.repo ? 'link' : undefined}
      tabIndex={project.repo ? 0 : undefined}
      onKeyDown={(e) => {
        if (project.repo && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          window.open(project.repo, '_blank', 'noopener,noreferrer')
        }
      }}
      aria-label={project.repo ? `Open ${project.name} on GitHub` : undefined}
      className={`bg-surface border-[3px] border-text-1 rounded-[24px] p-6 flex flex-col relative h-full ${project.repo ? 'cursor-pointer' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <motion.div
          whileHover={{ rotate: 12, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          drag
          dragSnapToOrigin
          dragElastic={0.15}
          dragTransition={dragBounce}
          whileDrag={dragWhile}
          {...dragSuppress}
          style={{ touchAction: 'none' }}
          className="chip p-2.5 rounded-xl bg-accent-dim cursor-grab active:cursor-grabbing"
        >
          <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
          </svg>
        </motion.div>

        <div className="flex gap-2">
          {project.repo && (
            <a href={project.repo} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
              className="sticker-btn w-9 h-9 rounded-full flex items-center justify-center bg-surface text-text-1" aria-label="GitHub">
              <svg style={{ width: 18, height: 18 }} fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          )}
          {project.live && (
            <a href={project.live} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
              className="sticker-btn w-9 h-9 rounded-full flex items-center justify-center bg-green text-text-1" aria-label="Live demo">
              <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>

      <h3 className="font-display text-text-1 font-bold text-lg mb-2.5 tracking-tight">
        {project.name}
      </h3>
      <p className="text-text-2 text-sm leading-relaxed flex-1 mb-5 font-medium">
        {project.description}
      </p>

      {isArkanoid ? (
        <div className="mb-5">
          <ArkanoidWidget />
        </div>
      ) : project.screenshots && project.screenshots.length > 0 ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={(e) => { e.stopPropagation(); setLightboxIndex(0); setLightboxOpen(true) }}
          aria-label={`View ${project.name} screenshots`}
          className="relative w-full bg-surface-2 border-2 border-text-1 rounded-xl flex items-center justify-center p-3 mb-5 group/shot"
          style={{ height: 200 }}
        >
          <img
            src={project.screenshots[0].src}
            alt=""
            loading="lazy"
            className="max-h-full max-w-full object-contain rounded-lg border-2 border-text-1 shadow-pop-sm"
          />
          <div className="absolute inset-0 rounded-xl bg-text-1/0 group-hover/shot:bg-text-1/30 transition-colors duration-200 flex items-center justify-center">
            <span className="opacity-0 group-hover/shot:opacity-100 transition-opacity duration-200 font-mono text-xs text-white font-bold bg-accent px-3 py-1.5 rounded-full">
              View {project.screenshots.length} screenshots
            </span>
          </div>
          {project.screenshots.length > 1 && (
            <span className="absolute bottom-2.5 right-2.5 chip font-mono text-[0.65rem] text-text-1 bg-surface px-2 py-0.5 rounded-md font-bold">
              +{project.screenshots.length - 1} more
            </span>
          )}
        </motion.button>
      ) : null}

      <div className="flex items-center gap-3 mt-auto flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border border-text-1"
            style={{ backgroundColor: languageColors[project.language] ?? '#8a8172' }}
          />
          <span className="font-mono text-xs text-text-2 font-bold">{project.language}</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {project.tags.slice(0, 3).map((tag) => (
            <motion.span
              key={tag}
              drag
              dragSnapToOrigin
              dragElastic={0.15}
              dragTransition={dragBounce}
              whileDrag={dragWhile}
              whileHover={{ y: -2 }}
              {...dragSuppress}
              style={{ touchAction: 'none' }}
              className="chip font-mono text-xs text-text-1 bg-surface-2 px-2 py-0.5 rounded-md inline-block cursor-grab active:cursor-grabbing select-none"
            >
              {tag}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
    {project.screenshots && (
      <ScreenshotLightbox
        screenshots={project.screenshots}
        projectName={project.name}
        isOpen={lightboxOpen}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />
    )}
    </>
  )
}
