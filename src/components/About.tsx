import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import RevealText from './RevealText'
import { dragBounce, dragWhile, onDragUnlock } from '../lib/dragProps'
import { useDragSuppressClick } from '../hooks/useDragSuppressClick'
import { unlockAchievement, ACHIEVEMENTS } from '../lib/achievements'
// Imported rather than referenced from public/: Vite rewrites this URL with the
// deploy target's base, which is '/' on Vercel but '/portfolio/' on GH Pages, so
// a hardcoded root-relative path would 404 on one of the two.
import portrait from '../assets/shai-aviv.jpg'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
}

const highlights = [
  { label: 'React · Node.js · TypeScript', color: 'bg-accent-dim' },
  { label: 'WebSockets & REST APIs', color: 'bg-cyan/15' },
  { label: 'Flutter / Dart', color: 'bg-pink/15' },
  { label: 'Firebase & MongoDB', color: 'bg-green/25' },
  { label: 'AI-Native Development', color: 'bg-accent-dim' },
  { label: 'Cyber & Networking (IDF)', color: 'bg-cyan/15' },
]

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const [photoHovered, setPhotoHovered] = useState(false)
  const [flipped, setFlipped] = useState(false)
  // A drag across the photo must not also flip it — the browser fires a click
  // on mouseup regardless of how far the pointer travelled.
  const flipSuppress = useDragSuppressClick()

  return (
    <section id="about" ref={sectionRef} className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.div
            variants={itemVariants}
            drag
            dragSnapToOrigin
            dragElastic={0.15}
            dragTransition={dragBounce}
            whileDrag={dragWhile}
            onDragStart={onDragUnlock}
            style={{ touchAction: 'none' }}
            className="section-label mb-10 inline-flex cursor-grab active:cursor-grabbing select-none"
          >
            About me
          </motion.div>

          <div className="flex flex-col md:flex-row gap-16 items-start">
            {/* Text */}
            <motion.div variants={itemVariants} className="flex-1 space-y-5">
              <p className="text-text-2 leading-relaxed text-[1.1rem] font-medium">
                AI-native software engineer with a product mindset and a B.Sc. in Computer
                Science from Bar-Ilan University (GPA: 87.5).
              </p>
              <p className="text-text-2 leading-relaxed text-[1.1rem] font-medium">
                Driven by an eagerness to learn new technologies, patterns, and systems,
                with a desire to build products end-to-end.
              </p>
              <p className="text-text-2 leading-relaxed text-[1.1rem] font-medium">
                Sees AI as a core part of engineering, not a layer on top: embedded in
                the workflow, the tooling, and the products themselves.
              </p>

              <div className="flex flex-wrap gap-2.5 pt-3">
                {highlights.map((h, i) => (
                  <motion.span
                    key={h.label}
                    initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: i % 2 === 0 ? -2 : 2 }}
                    whileHover={{ rotate: 0, y: -3, scale: 1.05 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    drag
                    dragSnapToOrigin
                    dragElastic={0.15}
                    dragTransition={dragBounce}
                    whileDrag={dragWhile}
                    onDragStart={onDragUnlock}
                    style={{ touchAction: 'none' }}
                    className={`chip px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-text-1 cursor-grab active:cursor-grabbing select-none ${h.color}`}
                  >
                    {h.label}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/*
              Polaroid photo — the hover trigger is this outer wrapper, which
              only ever animates once (its whileInView entrance) and is
              otherwise static, so its hit-box is stable. The rotate/lift
              lives on the inner div's `animate` instead of a same-element
              whileHover: rotating the photo on the same element that
              triggers hover shifts hit-testing near the corners, and
              Chrome/Firefox drop :hover the instant the element moves out
              from under a stationary cursor (no pointer movement needed),
              which snaps it back and re-enters hover forever — a
              self-cancelling flicker. Drag stays on the inner element since
              drag uses pointer capture, not hover hit-testing, so it isn't
              susceptible to the same loop.
            */}
            <motion.div
              variants={itemVariants}
              className="flex-shrink-0 self-start"
              onHoverStart={() => setPhotoHovered(true)}
              onHoverEnd={() => setPhotoHovered(false)}
            >
              {/*
                Click the photo and it turns over to a handwritten riddle whose
                answer — "the console" — is where the next egg is waiting.
                rotateY rides on the same element as the hover tilt and the drag,
                which Framer composes into one transform; preserve-3d plus
                backface-visibility on each face is what makes it read as a
                physical object rather than a crossfade.
              */}
              <motion.div
                className="relative bg-surface sticker p-3 pb-6 rounded-lg cursor-grab active:cursor-grabbing select-none"
                animate={
                  photoHovered && !flipped
                    ? { rotate: 0, scale: 1.03, y: -4, rotateY: 0 }
                    : { rotate: -4, scale: 1, y: 0, rotateY: flipped ? 180 : 0 }
                }
                transition={{ duration: flipped ? 0.7 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                drag
                dragSnapToOrigin
                dragElastic={0.15}
                dragTransition={dragBounce}
                whileDrag={dragWhile}
                onDragStart={() => { onDragUnlock(); flipSuppress.onDragStart() }}
                onDrag={flipSuppress.onDrag}
                onClick={(e) => {
                  flipSuppress.onClick(e)
                  if (e.defaultPrevented) return
                  setFlipped((f) => !f)
                  unlockAchievement(ACHIEVEMENTS.polaroidFlip)
                }}
                style={{ touchAction: 'none', transformStyle: 'preserve-3d' }}
              >
                <div style={{ backfaceVisibility: 'hidden' }}>
                  {/* Tape corner */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-green/60 border border-text-1/20 rotate-[-3deg]" />
                  <img
                    src={portrait}
                    alt="Shai Aviv"
                    width={891}
                    height={896}
                    draggable={false}
                    className="keep-color relative w-48 h-48 md:w-56 md:h-56 object-cover pointer-events-none"
                  />
                  <p className="text-center font-display text-sm font-bold text-text-1 mt-3">
                    <RevealText>build. ship. repeat.</RevealText>
                  </p>
                </div>

                {/* Back of the photo */}
                <div
                  className="absolute inset-0 rounded-lg bg-surface-2 px-4 py-4 flex flex-col justify-center"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <p className="font-hand italic text-text-1 text-[1.32rem] leading-[1.15] -rotate-1">
                    &ldquo;I sit quietly waiting for your command. I speak in logs and warnings.
                    Here you can find my favorite desserts, Cookies. What am I?&rdquo;
                  </p>
                  <p className="font-hand text-accent text-[1.05rem] leading-tight mt-2 -rotate-1">
                    The answer may lead to another treasure...
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
