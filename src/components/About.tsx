import { motion } from 'framer-motion'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const highlights = [
  'React · Node.js · TypeScript',
  'WebSockets & REST APIs',
  'Flutter / Dart',
  'Firebase & MongoDB',
  'AI-Native Development',
  'Cyber & Networking (IDF)',
]

export default function About() {
  return (
    <section id="about" className="py-32 px-6">
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
              <p className="text-text-2 leading-relaxed text-[1.075rem]">
                Computer Science graduate (GPA: 87.5, Bar-Ilan University) with a passion for
                building full-stack applications and an AI-native development mindset.
              </p>
              <p className="text-text-2 leading-relaxed text-[1.075rem]">
                Experienced across the full stack — React, Node.js, WebSockets, REST APIs —
                with multiple deployed, real-world projects. I love leveraging AI tools to
                amplify engineering output and move fast without breaking things.
              </p>
              <p className="text-text-2 leading-relaxed text-[1.075rem]">
                Previously a Network Process Support Specialist in the Mamram Unit, where I
                specialized in computer networks and completed a Cyber Warfare course.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {highlights.map((h) => (
                  <span
                    key={h}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-accent bg-accent/8 border border-accent/15"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Image */}
            <motion.div variants={itemVariants} className="flex-shrink-0 self-start">
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <div className="absolute -inset-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'radial-gradient(circle, rgba(0,229,160,0.12) 0%, transparent 70%)', filter: 'blur(20px)' }}
                />
                <div className="absolute inset-0 rounded-2xl border border-accent/20 translate-x-3 translate-y-3 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-300" />
                <img
                  src="https://avatars.githubusercontent.com/u/118115930?v=4"
                  alt="Shai Aviv"
                  className="relative w-52 h-52 md:w-60 md:h-60 rounded-2xl object-cover border border-white/8 grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
