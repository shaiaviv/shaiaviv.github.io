import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Project } from '../data/projects'
import ProjectDescription from './ProjectDescription'
import ScreenshotLightbox from './ScreenshotLightbox'
import { dragBounce, dragWhile } from '../lib/dragProps'
import { useDragSuppressClick } from '../hooks/useDragSuppressClick'

const languageColors: Record<string, string> = {
  JavaScript: '#ffc23c',
  TypeScript: '#6c5ce7',
  Swift: '#ff6b57',
  Python: '#06d6a0',
  Java: '#8a8172',
  Dart: '#06d6a0',
}

export default function FeaturedCard({ project }: { project: Project }) {
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const hasScreenshots = !!project.screenshots?.length
  const dragSuppress = useDragSuppressClick()

  return (
    <>
    {/*
      Hover trigger stays on this outer div, which never rotates or moves —
      a stable hit-box. The rotate/lift lives on the inner div instead: if
      the same element both triggered hover and moved itself out from under
      a stationary cursor, Chrome/Firefox re-hit-test on the layout change
      and drop :hover with no pointer movement needed, snapping the card
      back and re-triggering hover in a self-cancelling flicker loop —
      worst right at the edges the rotate shifts the most. Splitting
      trigger from visual transform makes that structurally impossible.
    */}
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
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
      className={`h-full ${project.repo ? 'cursor-pointer' : ''}`}
    >
    <motion.div
      animate={hovered ? { rotate: 0, y: -8 } : { rotate: -0.8, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="sticker bg-surface rounded-[28px] relative h-full flex flex-col"
    >
      <div className="relative z-10 rounded-[25px] overflow-hidden flex-1 flex flex-col">
        {/* Image — the star of the card */}
        {hasScreenshots && (
          <motion.button
            whileHover={{ scale: 1.015 }}
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(0); setLightboxOpen(true) }}
            className="relative w-full bg-surface-2 border-b-[3px] border-text-1 flex items-center justify-center p-5 md:p-8 group/shot"
            aria-label={`View ${project.name} screenshots`}
          >
            <img
              src={project.screenshots![0].src}
              alt={`${project.name} screenshot`}
              loading="lazy"
              className="keep-color max-h-[22rem] w-auto max-w-full object-contain rounded-xl border-[3px] border-text-1 shadow-pop-sm"
            />
            <div className="absolute inset-0 bg-text-1/0 group-hover/shot:bg-text-1/40 transition-colors duration-200 flex items-center justify-center">
              <span className="opacity-0 group-hover/shot:opacity-100 transition-opacity duration-200 font-mono text-xs text-white font-bold bg-accent px-3 py-1.5 rounded-full">
                View {project.screenshots!.length} screenshots
              </span>
            </div>

            {/* Badges overlaid on the image panel */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="chip flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-full">
                <span className="w-2.5 h-2.5 rounded-full border border-text-1" style={{ backgroundColor: languageColors[project.language] ?? '#8a8172' }} />
                <span className="font-mono text-[0.65rem] text-text-1 font-bold">{project.language}</span>
              </span>
              {project.live && (
                <span className="chip font-mono text-[0.65rem] text-text-1 bg-green px-2.5 py-1 rounded-full font-bold">
                  Live
                </span>
              )}
            </div>
          </motion.button>
        )}

        {/* Content */}
        <div className="p-8 md:p-10 flex-1 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <motion.span
                drag
                dragSnapToOrigin
                dragElastic={0.15}
                dragTransition={dragBounce}
                whileDrag={dragWhile}
                {...dragSuppress}
                style={{ touchAction: 'none' }}
                className="font-mono text-xs text-accent tracking-widest uppercase font-bold inline-block cursor-grab active:cursor-grabbing select-none"
              >
                ★ Featured Project
              </motion.span>
              {!hasScreenshots && (
                <motion.span
                  drag
                  dragSnapToOrigin
                  dragElastic={0.15}
                  dragTransition={dragBounce}
                  whileDrag={dragWhile}
                  {...dragSuppress}
                  style={{ touchAction: 'none' }}
                  className="chip flex items-center gap-1.5 bg-surface-2 px-2.5 py-1 rounded-full ml-1 cursor-grab active:cursor-grabbing select-none"
                >
                  <span className="w-2 h-2 rounded-full border border-text-1" style={{ backgroundColor: languageColors[project.language] ?? '#8a8172' }} />
                  <span className="font-mono text-[0.65rem] text-text-1 font-bold">{project.language}</span>
                </motion.span>
              )}
            </div>

            <h3 className="text-3xl font-display font-bold text-text-1 tracking-tight mb-3">
              {project.name}
            </h3>

            <ProjectDescription
              project={project}
              className="text-text-2 leading-relaxed mb-6 max-w-lg text-base font-medium"
            />

            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, i) => (
                <motion.span
                  key={tag}
                  drag
                  dragSnapToOrigin
                  dragElastic={0.15}
                  dragTransition={dragBounce}
                  whileDrag={dragWhile}
                  whileHover={{ rotate: 0, y: -2 }}
                  {...dragSuppress}
                  style={{ rotate: i % 2 === 0 ? -2 : 2, touchAction: 'none' }}
                  className="chip font-mono text-xs text-text-1 bg-surface-2 px-3 py-1 rounded-lg inline-block cursor-grab active:cursor-grabbing select-none"
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 mt-auto">
            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 text-sm font-bold text-text-2 hover:text-accent transition-colors duration-200"
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
                onClick={(e) => e.stopPropagation()}
                className="sticker-btn inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-full text-sm font-bold"
              >
                Live Demo
                <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
    </motion.div>
    {hasScreenshots && (
      <ScreenshotLightbox
        screenshots={project.screenshots!}
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
