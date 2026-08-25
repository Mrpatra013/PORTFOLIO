// The "library deck": overlapping cards rising from the section's bottom edge
// with a perspective tilt. Hovering (or keyboard-focusing) one card pulls it
// up to full visibility while every other card sinks to a sliver.
//
// Each card is two layers: the outer div runs the one-shot entrance
// (whileInView), the inner anchor runs the continuous hover pose (animate) —
// keeping them apart stops the two animation channels fighting over `y`.
import { useState } from 'react'
import { motion } from 'framer-motion'
import { EASE } from '../../lib/motion'

export interface DeckItem {
  id: string
  src: string
  alt: string
  title: string
  blurb?: string
  views?: string
  likes?: string
  year?: string
  href?: string // external live link; absent/'#' → onSelect fires instead
  onSelect?: () => void
}

function VerifiedBadge() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[#111]">
      <path
        fill="currentColor"
        d="M12 1.8l2.2 1.6 2.7-.3 1 2.5 2.4 1.3-.6 2.6.9 2.5-2.1 1.7-.6 2.7-2.7.3L12 22.2l-2.2-1.5-2.7-.3-.6-2.7-2.1-1.7.9-2.5-.6-2.6L7.1 5.6l1-2.5 2.7.3z"
      />
      <path fill="#fff" d="M10.9 15.3l-3-3 1.2-1.2 1.8 1.8 4-4L16.1 10z" />
    </svg>
  )
}

function StatIcon({ kind }: { kind: 'views' | 'likes' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0"
    >
      {kind === 'views' ? (
        <>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5 20a7 7 0 0 1 14 0" />
        </>
      ) : (
        <>
          <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
          <circle cx="12" cy="12" r="3.4" />
        </>
      )}
    </svg>
  )
}

interface HoverDeckProps {
  items: DeckItem[]
}

const SPRING = { type: 'spring', stiffness: 170, damping: 22 } as const

// Cards sit this much higher than their natural rest pose — each rises by 60%
// of the distance it would otherwise be sunk below the clip edge.
const UPLIFT = 0.6

// Hand-tuned lean per card so the deck reads as a tossed pile rather than a
// neat arc: directions alternate irregularly and the angles are uneven, the
// same trick the drag-cards stage uses. Affects rotation only — never layout.
const TILTS = [-8, 6, -3, 9, -6, 4, -9, 3, -7, 7]

function DeckImage({ item }: { item: DeckItem }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className="pointer-events-none relative aspect-video overflow-hidden rounded-lg bg-[#141414]">
      {!failed ? (
        <img
          src={item.src}
          alt={item.alt}
          draggable={false}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1c1c1c] via-[#242424] to-[#0f0f0f]">
          <span className="text-xl font-black uppercase tracking-tight text-white/10">
            {item.title.split(' ')[0]}
          </span>
        </div>
      )}
    </div>
  )
}

export default function HoverDeck({ items }: HoverDeckProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const n = items.length
  const mid = (n - 1) / 2

  return (
    <div
      aria-label="Project library"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[46svh] min-h-[300px]"
      style={{ perspective: 1200, perspectiveOrigin: '50% 0%' }}
    >
      {items.map((item, i) => {
        // 0 at the centre card, 1 at the edges
        const edge = mid > 0 ? Math.abs(i - mid) / mid : 0
        // Bell-curve rest pose: centre peeks ~78% of its height, edges ~36%.
        const restShownFrac = 0.78 - (0.42 * (1 - Math.cos(edge * Math.PI))) / 2
        const scale = 1 - edge * 0.12
        const isHovered = hovered === i
        const someHover = hovered !== null

        // y is a % of the card's own height: rest hides the un-peeked part
        // below the clip edge; hover shows it all; the rest sink to a sliver.
        // The sink depth stays measured from the natural pose, so lifting the
        // rest pose doesn't flatten the hover contrast.
        const sunkY = (1 - restShownFrac) * 100
        const restY = sunkY * (1 - UPLIFT)
        const y = isHovered ? 0 : someHover ? sunkY + 26 : restY

        const tilt = TILTS[i % TILTS.length]
        const isLink = Boolean(item.href && item.href !== '#')
        const cardW = 'clamp(170px, 26vw, 460px)'

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -5% 0px' }}
            transition={{ duration: 0.7, delay: i * 0.05, ease: EASE }}
            style={{
              left: `calc(${n > 1 ? (i / (n - 1)) * 100 : 50}% - (${cardW} * ${n > 1 ? i / (n - 1) : 0.5}))`,
              width: cardW,
              // The raised card must clear the whole pile — neighbours share
              // its resting z, so DOM order alone would paint them over it.
              zIndex: isHovered ? 10 + n + 1 : 10 + Math.round((1 - edge) * n),
            }}
            className="absolute bottom-0"
          >
            <motion.a
              href={isLink ? item.href : '#gallery'}
              target={isLink ? '_blank' : undefined}
              rel={isLink ? 'noopener noreferrer' : undefined}
              aria-label={isLink ? `View ${item.title} live project` : `${item.title} — see it in the gallery`}
              onClick={(e) => {
                if (!isLink) {
                  e.preventDefault()
                  item.onSelect?.()
                }
              }}
              onPointerEnter={() => setHovered(i)}
              onPointerLeave={() => setHovered((h) => (h === i ? null : h))}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered((h) => (h === i ? null : h))}
              animate={{
                y: `${y}%`,
                rotate: isHovered ? 0 : tilt,
                rotateX: isHovered ? 0 : 8,
                scale: isHovered ? scale + 0.06 : scale,
              }}
              transition={SPRING}
              style={{ transformStyle: 'preserve-3d' }}
              className="pointer-events-auto block cursor-pointer rounded-2xl bg-white p-1.5 shadow-[0_18px_50px_rgba(17,17,17,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111]"
            >
              <DeckImage item={item} />
              {/* Profile-card body. It sits below the fold at rest and is
                  revealed as the card is pulled up. */}
              <div className="pointer-events-none px-2 pb-1.5 pt-2.5">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-[13px] font-bold tracking-tight text-[#111]">
                    {item.title}
                  </span>
                  <VerifiedBadge />
                </span>

                {item.blurb && (
                  <p className="mt-1.5 line-clamp-3 text-[11px] leading-snug text-[#5a5a5a]">{item.blurb}</p>
                )}

                <span className="mt-3 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-3 text-[#4a4a4a]">
                    {item.views && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold">
                        <StatIcon kind="views" />
                        {item.views}
                      </span>
                    )}
                    {item.likes && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold">
                        <StatIcon kind="likes" />
                        {item.likes}
                      </span>
                    )}
                  </span>
                  {/* A span, not a button — the whole card is already an <a>. */}
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#F4F1E8] px-3 py-1.5 text-[11px] font-semibold text-[#111]">
                    View
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      aria-hidden="true"
                      className="h-3 w-3"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </span>
                </span>
              </div>
            </motion.a>
          </motion.div>
        )
      })}
    </div>
  )
}
