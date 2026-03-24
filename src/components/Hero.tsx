import { motion } from 'framer-motion'

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        className="max-w-5xl w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.p
          variants={itemVariants}
          className="font-mono text-accent text-sm mb-5 flex items-center gap-2"
        >
          <span className="inline-block w-6 h-px bg-accent" />
          Hi, I'm
        </motion.p>

        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-7xl font-bold mb-4 tracking-tight"
        >
          <span className="text-gradient">Shai Aviv.</span>
        </motion.h1>

        <motion.h2
          variants={itemVariants}
          className="text-3xl sm:text-5xl font-semibold text-[#c8c8d8] tracking-tight mb-6 leading-tight"
        >
          I build full-stack apps
          <br />
          <span className="text-muted font-normal">with an AI-native mindset.</span>
        </motion.h2>

        <motion.p
          variants={itemVariants}
          className="text-muted text-lg max-w-xl mb-10 leading-relaxed"
        >
          CS graduate from Bar-Ilan University (GPA 87.5). I build real-time web apps,
          mobile apps, and AI-powered tools — and I ship them to production.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-wrap gap-4"
        >
          <motion.a
            href="#projects"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium text-sm transition-colors duration-200 glow-accent-sm"
          >
            View my projects →
          </motion.a>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-3 border border-border hover:border-accent/60 text-[#f0f0f0] rounded-lg font-medium text-sm transition-colors duration-200 hover:bg-accent/5"
          >
            Get in touch
          </motion.a>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-16 flex flex-col items-start"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-px h-10 bg-gradient-to-b from-accent/50 to-transparent"
          />
        </motion.div>

      </motion.div>
    </section>
  )
}
