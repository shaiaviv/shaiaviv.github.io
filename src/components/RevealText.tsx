import { motion } from 'framer-motion'

interface Props {
  children: string
  delay?: number
  className?: string
}

/**
 * Splits text into words and reveals each one by sliding up from beneath
 * a hidden overflow container — the classic premium text entrance.
 */
export default function RevealText({ children, delay = 0, className = '' }: Props) {
  const words = children.split(' ')

  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden leading-tight">
          <motion.span
            className="inline-block"
            initial={{ y: '108%', opacity: 0 }}
            whileInView={{ y: '0%', opacity: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{
              duration: 0.7,
              delay: delay + i * 0.07,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && <span> </span>}
        </span>
      ))}
    </span>
  )
}
