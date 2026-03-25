import { motion } from 'framer-motion'
import { projects } from '../data/projects'
import ProjectCard from './ProjectCard'
import FeaturedCard from './FeaturedCard'
import RevealText from './RevealText'

export default function Projects() {
  const [featured, ...rest] = projects

  return (
    <section id="projects" className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Heading with word-by-word reveal */}
        <div className="mb-14">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="section-label mb-6"
          >
            Projects
          </motion.div>
          <h3
            className="font-black text-text-1 tracking-tight leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}
          >
            <RevealText>Things I've built</RevealText>
          </h3>
        </div>

        {/* Featured project */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-5"
        >
          <FeaturedCard project={featured} />
        </motion.div>

        {/* 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {rest.map((project, i) => (
            <motion.div
              key={project.name}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.1, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProjectCard project={project} index={i + 1} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-12 text-center"
        >
          <a
            href="https://github.com/shaiaviv"
            target="_blank"
            rel="noopener noreferrer"
            className="animated-underline inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors duration-200 font-mono"
          >
            View more on GitHub
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
