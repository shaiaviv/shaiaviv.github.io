import { useState, useEffect } from 'react'

export function useTypewriter(
  words: string[],
  options?: {
    typingSpeed?: number
    deletingSpeed?: number
    pauseDuration?: number
    initialDelay?: number
  }
) {
  const {
    typingSpeed = 75,
    deletingSpeed = 40,
    pauseDuration = 2400,
    initialDelay = 1800,
  } = options ?? {}

  const [text, setText] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'typing' | 'pausing' | 'deleting'>('idle')

  // Start after initial delay
  useEffect(() => {
    const t = setTimeout(() => setPhase('typing'), initialDelay)
    return () => clearTimeout(t)
  }, [initialDelay])

  useEffect(() => {
    if (phase === 'idle') return
    const word = words[wordIdx]

    if (phase === 'typing') {
      if (text.length < word.length) {
        const t = setTimeout(() => setText(word.slice(0, text.length + 1)), typingSpeed)
        return () => clearTimeout(t)
      }
      const t = setTimeout(() => setPhase('pausing'), pauseDuration)
      return () => clearTimeout(t)
    }

    if (phase === 'pausing') {
      const t = setTimeout(() => setPhase('deleting'), 80)
      return () => clearTimeout(t)
    }

    if (phase === 'deleting') {
      if (text.length > 0) {
        const t = setTimeout(() => setText(text.slice(0, -1)), deletingSpeed)
        return () => clearTimeout(t)
      }
      setWordIdx(prev => (prev + 1) % words.length)
      setPhase('typing')
    }
  }, [text, phase, wordIdx, words, typingSpeed, deletingSpeed, pauseDuration])

  return { text, isTyping: phase === 'typing' }
}
