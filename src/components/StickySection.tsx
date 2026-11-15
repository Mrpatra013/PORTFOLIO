import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * How long a pinned section holds, fully visible, before the next one starts
 * sliding over it — as a fraction of the viewport height of extra scrolling.
 */
export const HOLD_VH = 0.5

interface StickySectionProps {
  children: ReactNode
  zIndex: number
  /** The last section is never covered, so it doesn't need to pin. */
  pin?: boolean
}

/**
 * One layer of the stacked-scroll effect: the section scrolls normally until
 * its bottom edge meets the viewport bottom, then pins there while the next
 * section slides up over it.
 *
 * Sections are taller than the viewport, so `top: 0` would pin their heads and
 * clip everything below the fold. Offsetting by `viewportHeight - sectionHeight`
 * pins the tail instead, which lets the whole section be read on the way past.
 *
 * After each pinned section comes an empty spacer (HOLD_VH of the viewport).
 * The section stays stuck while the spacer scrolls past, so it holds on screen
 * for a beat before the next section arrives to cover it.
 */
export default function StickySection({ children, zIndex, pin = true }: StickySectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [top, setTop] = useState(0)

  useEffect(() => {
    if (!pin) return
    const el = ref.current
    if (!el) return

    const compute = () => {
      const height = el.offsetHeight
      const viewport = window.innerHeight
      setTop(height > viewport ? viewport - height : 0)
    }

    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    window.addEventListener('resize', compute)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', compute)
    }
  }, [pin])

  return (
    <>
      <div
        ref={ref}
        className={pin ? 'sticky' : 'relative'}
        style={{ top: pin ? top : undefined, zIndex }}
      >
        {children}
      </div>
      {pin && <div aria-hidden="true" style={{ height: `${HOLD_VH * 100}vh` }} />}
    </>
  )
}
