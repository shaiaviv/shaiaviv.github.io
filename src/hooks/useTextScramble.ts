import { useState, useEffect } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ01!@#$%<>/\\|[]{}*+-='

/**
 * Returns an array of characters.
 * Non-space chars scramble through random symbols, then resolve
 * left-to-right after `delay` ms, staggered 70ms per char.
 */
export function useTextScramble(finalText: string, delay = 500): string[] {
  const chars = finalText.split('')

  const [display, setDisplay] = useState<string[]>(
    chars.map(c => (c === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)]))
  )

  useEffect(() => {
    // resolved[i] = true once that character should show its final value
    const resolved = chars.map(c => c === ' ')

    // Stagger each non-space character's resolution
    let nonSpaceIdx = 0
    const timeouts: ReturnType<typeof setTimeout>[] = []
    chars.forEach((char, i) => {
      if (char === ' ') return
      const t = setTimeout(() => { resolved[i] = true }, delay + nonSpaceIdx * 70)
      timeouts.push(t)
      nonSpaceIdx++
    })

    // Scramble loop — runs until all resolved
    let raf: number
    const startTimer = setTimeout(() => {
      const tick = () => {
        setDisplay(
          chars.map((char, i) =>
            resolved[i] ? char : CHARS[Math.floor(Math.random() * CHARS.length)]
          )
        )
        if (resolved.some(r => !r)) {
          raf = requestAnimationFrame(tick)
        } else {
          setDisplay([...chars])
        }
      }
      raf = requestAnimationFrame(tick)
    }, Math.max(0, delay - 60))

    return () => {
      clearTimeout(startTimer)
      timeouts.forEach(clearTimeout)
      cancelAnimationFrame(raf)
    }
  }, [finalText, delay]) // eslint-disable-line react-hooks/exhaustive-deps

  return display
}
