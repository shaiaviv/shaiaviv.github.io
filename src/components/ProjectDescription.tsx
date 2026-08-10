import type { Project } from '../data/projects'

/**
 * Splits a description after its first sentence, so a hint can sit in the middle
 * of the paragraph rather than tacked on the end — the point being that only
 * someone actually reading the copy will find it.
 *
 * If there's no sentence boundary the hint goes after the whole description, so
 * a hint can never be silently swallowed. Note the boundary is a period followed
 * by a space: the tech names in these descriptions ("Node.js,", "face-api.js")
 * have no space after the dot, so they don't trip it.
 */
function splitAfterFirstSentence(text: string): [string, string] {
  const at = text.indexOf('. ')
  if (at === -1) return [text, '']
  return [text.slice(0, at + 1), text.slice(at + 2)]
}

/**
 * A project's description, with its optional easter-egg hint woven in. Shared by
 * both card types so the split lives in exactly one place.
 */
export default function ProjectDescription({ project, className }: { project: Project; className?: string }) {
  if (!project.hint) {
    return <p className={className}>{project.description}</p>
  }

  // Deliberately unstyled: the hint has to be indistinguishable from the copy
  // around it, or it isn't hidden and "reading closely" earns nothing.
  const [opening, rest] = splitAfterFirstSentence(project.description)
  return (
    <p className={className}>
      {[opening, project.hint, rest].filter(Boolean).join(' ')}
    </p>
  )
}
