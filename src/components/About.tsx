import { motion } from 'framer-motion'

export default function About() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-mono text-accent text-sm mb-3">01. About me</h2>
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="flex-1 space-y-4 text-muted leading-relaxed">
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
            </div>
            <div className="flex-shrink-0">
              <div className="relative group">
                <div className="absolute inset-0 rounded-lg bg-accent/20 translate-x-2 translate-y-2 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-200" />
                <img
                  src="https://avatars.githubusercontent.com/u/118115930?v=4"
                  alt="Shai Aviv"
                  className="relative w-48 h-48 rounded-lg object-cover border border-border grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
