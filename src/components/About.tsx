import { useRef } from 'react'
import { motion } from 'framer-motion'
import RevealText from './RevealText'

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

  return (
    <section id="about" ref={sectionRef} className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.div variants={itemVariants} className="section-label mb-10">
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
                    className={`chip px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-text-1 ${h.color}`}
                  >
                    {h.label}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Polaroid photo */}
            <motion.div variants={itemVariants} className="flex-shrink-0 self-start">
              <motion.div
                className="relative bg-surface sticker p-3 pb-6 rounded-lg"
                initial={{ rotate: -4 }}
                whileHover={{ rotate: 0, scale: 1.03, y: -4 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                {/* Tape corner */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-green/60 border border-text-1/20 rotate-[-3deg]" />
                <img
                  src="https://avatars.githubusercontent.com/u/118115930?v=4"
                  alt="Shai Aviv"
                  className="relative w-48 h-48 md:w-56 md:h-56 object-cover"
                />
                <p className="text-center font-display text-sm font-bold text-text-1 mt-3">
                  <RevealText>build. ship. repeat.</RevealText>
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
