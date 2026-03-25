import { motion } from 'framer-motion'
import RevealText from './RevealText'

const skillsRow1 = [
  { name: 'JavaScript', icon: '⚡' },
  { name: 'React.js', icon: '⚛️' },
  { name: 'Node.js', icon: '🟢' },
  { name: 'Python', icon: '🐍' },
  { name: 'TypeScript', icon: '📘' },
  { name: 'Java', icon: '☕' },
  { name: 'REST APIs', icon: '🔗' },
  { name: 'Socket.io', icon: '🔌' },
]

const skillsRow2 = [
  { name: 'Flutter / Dart', icon: '🎯' },
  { name: 'MongoDB', icon: '🍃' },
  { name: 'Firebase', icon: '🔥' },
  { name: 'Git & GitHub', icon: '🌿' },
  { name: 'Vercel / Railway', icon: '🚀' },
  { name: 'HTML & CSS', icon: '🎨' },
  { name: 'Linux', icon: '🐧' },
  { name: 'Claude Code', icon: '🤖' },
]

function SkillBadge({ name, icon }: { name: string; icon: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl glass-card border border-accent/[0.07] flex-shrink-0 select-none mr-3">
      <span className="text-base leading-none">{icon}</span>
      <span className="text-sm font-medium text-text-2 whitespace-nowrap">{name}</span>
    </div>
  )
}

export default function Skills() {
  const doubled1 = [...skillsRow1, ...skillsRow1, ...skillsRow1, ...skillsRow1]
  const doubled2 = [...skillsRow2, ...skillsRow2, ...skillsRow2, ...skillsRow2]

  return (
    <section id="skills" className="py-32 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 mb-14">
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
            className="section-label mb-6"
          >
            Skills
          </motion.div>
          <h3
            className="font-black text-text-1 tracking-tight leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}
          >
            <RevealText>Technologies I work with</RevealText>
          </h3>
          <p className="text-muted text-lg mt-3 max-w-md">
            The stack I reach for when shipping products.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="space-y-3"
      >
        <div className="marquee-track">
          <div className="marquee-row marquee-row-left">
            {doubled1.map((skill, i) => <SkillBadge key={`r1-${i}`} {...skill} />)}
          </div>
        </div>
        <div className="marquee-track">
          <div className="marquee-row marquee-row-right">
            {doubled2.map((skill, i) => <SkillBadge key={`r2-${i}`} {...skill} />)}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
