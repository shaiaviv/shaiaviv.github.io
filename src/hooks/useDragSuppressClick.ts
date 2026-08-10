import { useRef } from 'react'
import type { PanInfo } from 'framer-motion'
import { onDragUnlock } from '../lib/dragProps'

/**
 * The browser fires a native `click` after a drag's pointerup regardless of
 * how far the pointer moved, and that click still bubbles/navigates —
 * Framer Motion's own tap/drag distinction only governs its own onTap, not
 * that native event. Spread the returned handlers onto any draggable,
 * clickable element (a chip inside a clickable card, a link, a button) so a
 * real drag doesn't also fire a click, a parent's onClick, or an href
 * navigation, while a plain click/tap still works exactly as before.
 */
export function useDragSuppressClick(threshold = 4) {
  const dragged = useRef(false)

  return {
    onDragStart: () => { dragged.current = false; onDragUnlock() },
    onDrag: (_: unknown, info: PanInfo) => {
      if (Math.abs(info.offset.x) > threshold || Math.abs(info.offset.y) > threshold) {
        dragged.current = true
      }
    },
    onClick: (e: React.MouseEvent) => {
      if (dragged.current) {
        e.preventDefault()
        e.stopPropagation()
        dragged.current = false
      }
    },
  }
}
