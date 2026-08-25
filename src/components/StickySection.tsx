import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

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
    <div
      ref={ref}
      className={pin ? 'sticky' : 'relative'}
      style={{ top: pin ? top : undefined, zIndex }}
    >
      {children}
    </div>
  )
}
