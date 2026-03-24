import { motion } from 'framer-motion'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function About() {
  return (
    <section id="about" className="py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.div variants={itemVariants} className="section-label mb-6">
            01. About me
          </motion.div>

          <div className="flex flex-col md:flex-row gap-14 items-start">
            <motion.div variants={itemVariants} className="flex-1 space-y-5 text-[#a0a0b8] leading-relaxed text-[1.0625rem]">
              <p>
                Computer Science graduate (GPA: 87.5, Bar-Ilan University) with a passion for
                building full-stack applications and an AI-native development mindset.
              </p>
              <p>
                Experienced across the full stack — React, Node.js, WebSockets, REST APIs —
                with multiple deployed, real-world projects. I love leveraging AI tools to
                amplify engineering output and move fast without breaking things.
              </p>
              <p>
                Previously a Network Process Support Specialist in the Mamram Unit, where I
                specialized in computer networks and completed a Cyber Warfare course.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex-shrink-0">
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {/* Glow ring behind image */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent/30 to-[#38bdf8]/20 translate-x-3 translate-y-3 blur-md group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-300" />
                <div className="absolute inset-0 rounded-xl border border-accent/20 translate-x-3 translate-y-3 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-300" />
                <img
                  src="https://avatars.githubusercontent.com/u/118115930?v=4"
                  alt="Shai Aviv"
                  className="relative w-52 h-52 rounded-xl object-cover border border-white/10 grayscale hover:grayscale-0 transition-all duration-500"
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
