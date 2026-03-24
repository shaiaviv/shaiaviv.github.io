import { motion } from 'framer-motion'

const skills = [
  { name: 'JavaScript', icon: '⚡' },
  { name: 'React.js', icon: '⚛️' },
  { name: 'Node.js', icon: '🟢' },
  { name: 'Python', icon: '🐍' },
  { name: 'Java', icon: '☕' },
  { name: 'Flutter / Dart', icon: '🎯' },
  { name: 'Socket.io', icon: '🔌' },
  { name: 'MongoDB', icon: '🍃' },
  { name: 'Firebase', icon: '🔥' },
  { name: 'REST APIs', icon: '🔗' },
  { name: 'Git & GitHub', icon: '🌿' },
  { name: 'Vercel / Railway', icon: '🚀' },
  { name: 'HTML & CSS', icon: '🎨' },
  { name: 'Linux', icon: '🐧' },
  { name: 'TensorFlow.js', icon: '🧠' },
  { name: 'Claude Code', icon: '🤖' },
]

export default function Skills() {
  return (
    <section id="skills" className="py-28 px-6 relative">
      {/* Subtle section background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.015] to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14"
        >
          <div className="section-label mb-4">03. Skills</div>
          <h3 className="text-3xl sm:text-4xl font-bold text-[#f0f0f0] tracking-tight">
            Technologies I work with
          </h3>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {skills.map((skill, i) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              whileHover={{
                scale: 1.04,
                y: -2,
                borderColor: 'rgba(108, 99, 255, 0.5)',
                boxShadow: '0 4px 20px rgba(108, 99, 255, 0.18)',
              }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="bg-surface/70 backdrop-blur-sm border border-white/5 rounded-xl px-4 py-3.5
                flex items-center gap-3 cursor-default transition-colors duration-200"
            >
              <span className="text-xl leading-none">{skill.icon}</span>
              <span className="text-sm font-medium text-[#d0d0e0] tracking-tight">{skill.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
