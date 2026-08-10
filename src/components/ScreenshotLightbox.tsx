import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import type { Screenshot } from '../data/projects'

interface Props {
  screenshots: Screenshot[]
  projectName: string
  isOpen: boolean
  index: number
  onIndexChange: (index: number) => void
  onClose: () => void
}

export default function ScreenshotLightbox({ screenshots, projectName, isOpen, index, onIndexChange, onClose }: Props) {
  const total = screenshots.length
  const goPrev = useCallback(() => onIndexChange((index - 1 + total) % total), [index, total, onIndexChange])
  const goNext = useCallback(() => onIndexChange((index + 1) % total), [index, total, onIndexChange])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, goPrev, goNext, onClose])

  const current = screenshots[index]

  /*
   * Portalled to document.body, which also makes this immune to the konami
   * negative for free: this layer and that overlay are both z-[9999] in the
   * root stacking context, and #root is static so it isolates nothing — equal
   * z-index means tree order decides, and body's portal comes after #root. So
   * the lightbox paints ABOVE the inversion and needs no .keep-color opt-out;
   * adding one here would invert these screenshots rather than protect them.
   * Verified: the screenshot pixels are identical with the page inverted.
   */
  return createPortal(
    <AnimatePresence>
      {isOpen && (
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`${projectName} screenshots`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-10 bg-text-1/90 backdrop-blur-md"
        onClick={onClose}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 border-2 border-white/20 text-white/80 hover:text-white hover:border-accent transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Counter */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 font-mono text-xs text-white/60 tracking-widest font-bold">
          {index + 1} / {total}
        </div>

        {/* Prev / Next arrows */}
        {total > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev() }}
              aria-label="Previous screenshot"
              className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center bg-white/10 border-2 border-white/20 text-white/80 hover:text-accent hover:border-accent transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext() }}
              aria-label="Next screenshot"
              className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center bg-white/10 border-2 border-white/20 text-white/80 hover:text-accent hover:border-accent transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image + caption */}
        <motion.div
          key={current.src}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-4 max-w-full max-h-full"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={current.src}
            alt={current.caption ?? `${projectName} screenshot ${index + 1}`}
            className="max-h-[75vh] max-w-full rounded-xl border-2 border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.5)] object-contain"
          />
          {current.caption && (
            <p className="font-mono text-sm text-white/80 text-center font-bold">{current.caption}</p>
          )}

          {/* Thumbnail strip */}
          {total > 1 && (
            <div className="flex gap-2 max-w-full overflow-x-auto px-2 py-1">
              {screenshots.map((shot, i) => (
                <button
                  key={shot.src}
                  onClick={() => onIndexChange(i)}
                  aria-label={`Go to screenshot ${i + 1}`}
                  className={`shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-colors duration-200 ${
                    i === index ? 'border-accent' : 'border-white/20 opacity-50 hover:opacity-80'
                  }`}
                >
                  <img src={shot.src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
