import { motion } from 'framer-motion'

const skillsRow1 = [
  { name: 'JavaScript', icon: '⚡' },
  { name: 'React.js', icon: '⚛️' },
  { name: 'Node.js', icon: '🟢' },
  { name: 'Python', icon: '🐍' },
  { name: 'Java', icon: '☕' },
  { name: 'TypeScript', icon: '📘' },
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
    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl glass-card border border-white/[0.05] flex-shrink-0 select-none">
      <span className="text-lg leading-none">{icon}</span>
      <span className="text-sm font-medium text-text-2 whitespace-nowrap">{name}</span>
    </div>
  )
}

export default function Skills() {
  const doubled1 = [...skillsRow1, ...skillsRow1]
  const doubled2 = [...skillsRow2, ...skillsRow2]

  return (
    <section id="skills" className="py-32 px-6 relative overflow-hidden">
      <div className="max-w-5xl mx-auto mb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="section-label mb-6">Skills</div>
          <h3 className="text-4xl sm:text-5xl font-black text-text-1 tracking-tight leading-tight">
            Technologies I work with
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
        className="space-y-3 -mx-6 px-0"
      >
        {/* Row 1 — scrolls left */}
        <div className="marquee-track">
          <div className="marquee-row marquee-row-left gap-3 px-6">
            {doubled1.map((skill, i) => (
              <SkillBadge key={`r1-${i}`} {...skill} />
            ))}
          </div>
        </div>

        {/* Row 2 — scrolls right */}
        <div className="marquee-track">
          <div className="marquee-row marquee-row-right gap-3 px-6">
            {doubled2.map((skill, i) => (
              <SkillBadge key={`r2-${i}`} {...skill} />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
