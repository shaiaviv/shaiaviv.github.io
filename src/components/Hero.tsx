import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-5xl w-full">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="font-mono text-accent text-sm mb-4"
        >
          Hi, I'm
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-5xl sm:text-7xl font-bold text-[#f0f0f0] mb-3 tracking-tight"
        >
          Shai Aviv.
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-4xl sm:text-6xl font-bold text-muted tracking-tight mb-6"
        >
          I build full-stack apps with an AI-native mindset.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-muted text-lg max-w-xl mb-10 leading-relaxed"
        >
          CS graduate from Bar-Ilan University (GPA 87.5). I build real-time web apps,
          mobile apps, and AI-powered tools — and I ship them to production.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex gap-4"
        >
          <a
            href="#projects"
            className="px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-md font-medium text-sm transition-colors duration-200"
          >
            View my projects →
          </a>
          <a
            href="#contact"
            className="px-6 py-3 border border-border hover:border-accent/50 text-[#f0f0f0] rounded-md font-medium text-sm transition-colors duration-200"
          >
            Get in touch
          </a>
        </motion.div>
      </div>
    </section>
  )
}
