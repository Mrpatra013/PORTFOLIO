// Adapted from 21st.dev "Drag cards" by minhxthanh (component id 4311):
// free-drag cards with bring-to-front stacking, rewritten in strict TypeScript
// with pointer events and restyled to the TheDesk brand.
import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import gsap from 'gsap'
import CoverMedia from './CoverMedia'

export interface DragCardItem {
  id: string
  /** Poster still, shown until the clip decodes and if it never does. */
  src: string
  /** Web-encoded reel that plays on the card face. */
  video?: string
  alt: string
  title: string
  subtitle?: string
  href?: string // when set, the card shows a live-link arrow
}

interface CardLayout {
  x: number
  y: number
  rotation: number
  /** Which edge this card flies in from on the intro: -1 left, 1 right. */
  enterFrom: -1 | 1
}

interface DraggableCardProps {
  item: DragCardItem
  layout: CardLayout
  zIndex: number
  resetToken: number
  containerRef: React.RefObject<HTMLDivElement>
  onBringToFront: () => void
}

function DraggableCard({ item, layout, zIndex, resetToken, containerRef, onBringToFront }: DraggableCardProps) {
  const [position, setPosition] = useState({ x: layout.x, y: layout.y })
  const [dragging, setDragging] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const dragOffset = useRef({ x: 0, y: 0 })

  // Snap back whenever the layout is recomputed or the stage is reset.
  useEffect(() => setPosition({ x: layout.x, y: layout.y }), [layout, resetToken])

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    onBringToFront()
    setDragging(true)
    const rect = card.getBoundingClientRect()
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    card.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    const container = containerRef.current
    const card = cardRef.current
    if (!container || !card) return
    const containerRect = container.getBoundingClientRect()
    const cardRect = card.getBoundingClientRect()
    let x = e.clientX - containerRect.left - dragOffset.current.x
    let y = e.clientY - containerRect.top - dragOffset.current.y
    x = Math.max(0, Math.min(x, containerRect.width - cardRect.width))
    y = Math.max(0, Math.min(y, containerRect.height - cardRect.height))
    setPosition({ x, y })
  }

  const endDrag = () => setDragging(false)

  return (
    <div
      ref={cardRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      data-drag-card=""
      className={`absolute w-64 select-none rounded-2xl bg-white p-1.5 pb-2 md:w-80 ${
        dragging
          ? 'cursor-grabbing shadow-[0_30px_70px_rgba(0,0,0,0.5)]'
          : 'cursor-grab shadow-[0_18px_45px_rgba(0,0,0,0.38)] transition-[left,top,transform,box-shadow] duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex,
        touchAction: 'none',
        // `--enter-x` is owned by the GSAP intro (see the effect below) and
        // left at its 0px default afterwards. Keeping the entrance offset in a
        // custom property rather than in this string is what lets GSAP and
        // React write to the same element without overwriting each other:
        // React only ever rewrites the keys in this object.
        transform: `translate3d(var(--enter-x, 0px), 0, 0) rotate(${dragging ? 0 : layout.rotation}deg)`,
      }}
    >
      <CoverMedia
        video={item.video}
        poster={item.src}
        alt={item.alt}
        label={item.title}
        className="rounded-xl"
        labelClassName="text-3xl"
      />
      <div className="mt-1.5 flex items-center justify-between gap-2 px-1.5 pb-0.5">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-black uppercase leading-tight tracking-tight text-[#111] md:text-base">
            {item.title}
          </h3>
          {item.subtitle && <p className="mt-0.5 truncate text-[11px] font-medium text-[#4a4a4a]">{item.subtitle}</p>}
        </div>
        {item.href && (
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${item.title} live project`}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-accent transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </a>
        )}
      </div>
    </div>
  )
}

interface DragCardsProps {
  items: DragCardItem[]
  /** Rendered in the middle of the stage; clicking it resets the cards. */
  center?: ReactNode
  className?: string
}

/**
 * A full-height stage of scattered, overlapping draggable cards — half
 * clustered left, half right. Drag to shuffle; click the centre to reset.
 *
 * The stage deliberately has no border or overflow clip: the cards rest at a
 * slight rotation, so their corners would be cropped against the edges.
 */
export default function DragCards({ items, center, className = '' }: DragCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [layouts, setLayouts] = useState<CardLayout[]>([])
  const [zIndices, setZIndices] = useState<number[]>([])
  const [resetToken, setResetToken] = useState(0)

  const baseZIndices = useCallback(() => items.map((_, i) => 20 + i), [items])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const computeLayouts = () => {
      const w = container.offsetWidth
      const h = container.offsetHeight
      const compact = w < 768
      // Keep in sync with the card width classes above.
      const cardW = w >= 768 ? 320 : 256
      // media (16:9) + title row + padding
      const cardH = Math.round((cardW - 12) * (9 / 16)) + 62
      const rots = [-6, 4, -3, 5, -5, 6, -4, 3, -7, 5]
      const jitter = [0.03, 0.09, 0.0, 0.07, 0.02]

      const perSide = compact ? items.length : Math.ceil(items.length / 2)
      const span = Math.max(0, h - cardH - 24)
      const step = perSide > 1 ? span / (perSide - 1) : 0

      const next: CardLayout[] = items.map((_, i) => {
        const onLeft = compact ? true : i < perSide
        const row = onLeft ? i : i - perSide
        const rotation = rots[i % rots.length]
        // Desktop cards fly in from the side they settle on. The compact stack
        // is centred, so there is no settled side to match — alternate instead,
        // which reads as the same two-sided deal.
        const enterFrom: -1 | 1 = compact ? (i % 2 === 0 ? -1 : 1) : onLeft ? -1 : 1
        if (compact) {
          // one centred, heavily overlapped stack with a slight sway
          const sway = (i % 2 === 0 ? -1 : 1) * w * 0.03
          const x = Math.max(0, Math.min((w - cardW) / 2 + sway, w - cardW))
          return { x, y: 12 + row * step, rotation, enterFrom }
        }
        const j = w * jitter[row % jitter.length]
        return {
          x: onLeft ? j : Math.max(0, w - cardW - j),
          y: 12 + row * step,
          rotation,
          enterFrom,
        }
      })
      setLayouts(next)
    }

    computeLayouts()
    const ro = new ResizeObserver(computeLayouts)
    ro.observe(container)
    return () => ro.disconnect()
  }, [items])

  useEffect(() => {
    setZIndices(baseZIndices())
  }, [baseZIndices])

  // --- GSAP intro: the cards are dealt in from the two side edges ----------
  // Runs once, when the stage first scrolls into view. The offset lives in the
  // `--enter-x` custom property so it composes with the rotation React writes
  // into `transform` instead of fighting it.
  const introPlayed = useRef(false)
  useEffect(() => {
    const container = containerRef.current
    if (!container || introPlayed.current) return
    if (layouts.length !== items.length) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const cards = Array.from(container.querySelectorAll<HTMLElement>('[data-drag-card]'))
    if (cards.length !== layouts.length) return

    // Park them off-stage straight away, before the observer fires, so they are
    // never briefly visible in their final spots.
    cards.forEach((card, i) => {
      // The resting transition would interpolate the entrance offset too and
      // smear the tween; GSAP drives every frame here.
      card.style.transition = 'none'
      card.style.opacity = '0'
      card.style.setProperty('--enter-x', `${layouts[i].enterFrom * (container.offsetWidth * 0.6 + 360)}px`)
    })

    const settle = () => {
      cards.forEach((card) => {
        card.style.removeProperty('transition')
        card.style.removeProperty('--enter-x')
      })
    }

    let tween: gsap.core.Tween | null = null
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || introPlayed.current) return
        introPlayed.current = true
        observer.disconnect()
        tween = gsap.to(cards, {
          '--enter-x': '0px',
          opacity: 1,
          duration: 1.05,
          ease: 'power3.out',
          // Outermost pair first, working inwards, so the two streams read as
          // one gesture rather than ten separate cards.
          stagger: { each: 0.07, from: 'edges' },
          onComplete: settle,
        })
      },
      { threshold: 0.3 },
    )
    observer.observe(container)

    return () => {
      observer.disconnect()
      tween?.kill()
      settle()
    }
  }, [layouts, items.length])

  const bringToFront = (index: number) => {
    setZIndices((prev) => {
      const maxZ = Math.max(...prev)
      if (prev[index] === maxZ) return prev
      const next = [...prev]
      next[index] = maxZ + 1
      return next
    })
  }

  const resetStage = () => {
    setZIndices(baseZIndices())
    setResetToken((t) => t + 1)
  }

  // The centre sits *beneath* the cards (they start at z 20), so a card
  // dragged into the middle passes over the title rather than under it. The
  // trade-off is that the reset target is only clickable while the centre is
  // clear — putting it on top instead would swallow pointer-downs and trap any
  // card parked there.
  const CENTER_Z = 10

  return (
    <div
      ref={containerRef}
      // Clicking bare stage resets. `target === currentTarget` is what keeps
      // this from firing on the cards: a click that lands on a card (or on the
      // centre block) has a deeper target. Drags are safe too — the card takes
      // pointer capture on press, so the release is dispatched to the card even
      // when the cursor ends up over the background.
      onClick={(e) => {
        if (e.target === e.currentTarget) resetStage()
      }}
      className={`relative h-full w-full ${className}`}
    >
      {center && (
        <div
          style={{ zIndex: CENTER_Z }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 text-center"
        >
          <button
            type="button"
            onClick={resetStage}
            aria-label="Reset the cards to their starting position"
            className="absolute -inset-4 cursor-pointer rounded-3xl border-0 bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          />
          <div className="pointer-events-none relative">{center}</div>
        </div>
      )}
      {layouts.length === items.length &&
        items.map((item, i) => (
          <DraggableCard
            key={item.id}
            item={item}
            layout={layouts[i]}
            zIndex={zIndices[i] ?? 20 + i}
            resetToken={resetToken}
            containerRef={containerRef}
            onBringToFront={() => bringToFront(i)}
          />
        ))}
    </div>
  )
}
