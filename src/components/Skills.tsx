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
    <section id="skills" className="py-24 px-6 bg-surface/50">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="font-mono text-accent text-sm mb-3">03. Skills</h2>
          <h3 className="text-3xl font-bold text-[#f0f0f0]">Technologies I work with</h3>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {skills.map((skill, i) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="bg-background border border-border rounded-lg px-4 py-3 flex items-center gap-3 hover:border-accent/40 transition-colors duration-200"
            >
              <span className="text-xl">{skill.icon}</span>
              <span className="text-sm font-medium text-[#f0f0f0]">{skill.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
