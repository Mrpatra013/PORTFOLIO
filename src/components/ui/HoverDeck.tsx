// The "library deck": overlapping cards rising from the section's bottom edge
// with a perspective tilt. Hovering (or keyboard-focusing) one card pulls it
// up to full visibility while every other card sinks to a sliver.
//
// Each card is two layers: the outer div runs the one-shot entrance
// (whileInView), the inner div runs the continuous hover pose (animate) —
// keeping them apart stops the two animation channels fighting over `y`.
//
// A card has two destinations: the project's local build under /demos/<id>/
// (only when it's actually been copied in) and its source on GitHub. The first
// is a link stretched across the whole card; the second is the Code pill.
import { useState } from 'react'
import { motion } from 'framer-motion'
import CoverMedia from './CoverMedia'
import { EASE } from '../../lib/motion'

export interface DeckItem {
  id: string
  /** Poster still, shown until the cover clip decodes and if it never does. */
  src: string
  /** The reel's first 15s — this card's cover. */
  video?: string
  alt: string
  title: string
  blurb?: string
  views?: string
  likes?: string
  year?: string
  /** Path to the project's local build, e.g. '/demos/nova/'. Only ever set by
      the caller once the manifest confirms the build is really there. */
  demo?: string
  /** GitHub repo URL, opened by the card's secondary "Code" pill. */
  repo?: string
  /** Last resort when the card has neither a demo nor a repo. */
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

function GithubMark() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5 shrink-0">
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
      />
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
        const cardW = 'clamp(170px, 26vw, 460px)'

        // One primary destination per card, best first: the local build if it's
        // there, else the source on GitHub, else back to the gallery. Only the
        // last case is a fake link that has to swallow its own click.
        const primary = item.demo
          ? { href: item.demo, label: `Open the ${item.title} demo` }
          : item.repo
            ? { href: item.repo, label: `View the ${item.title} source on GitHub` }
            : { href: '#gallery', label: `${item.title} — see it in the gallery` }
        const isNavigation = Boolean(item.demo || item.repo)

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
            {/* The shell is a div, not an anchor: the card now carries two
                destinations (the demo and the repo), and an <a> inside an <a>
                is invalid and collapses the keyboard order. The primary link is
                stretched over the card instead, with the Code pill as its
                sibling. Focus handlers live here because React's onFocus/onBlur
                bubble up from whichever of the two links is focused. */}
            <motion.div
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
              className="pointer-events-auto relative block cursor-pointer rounded-2xl bg-white p-1.5 shadow-[0_18px_50px_rgba(17,17,17,0.28)]"
            >
              {/* Stretched over the whole card so the cover and the title stay
                  one big click target. Empty by design — the visible copy below
                  is the label, and `aria-label` names the real destination. */}
              <a
                href={primary.href}
                target={isNavigation ? '_blank' : undefined}
                rel={isNavigation ? 'noopener noreferrer' : undefined}
                aria-label={primary.label}
                onClick={(e) => {
                  if (!isNavigation) {
                    e.preventDefault()
                    item.onSelect?.()
                  }
                }}
                className="absolute inset-0 z-10 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111]"
              />

              <CoverMedia
                video={item.video}
                poster={item.src}
                alt={item.alt}
                label={item.title}
                className="rounded-lg"
                labelClassName="text-xl"
              />
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

                {/* Stacked above the stretched link so the Code pill can take
                    its own clicks — but the row itself stays inert, or the
                    stats and the Live chip would punch a dead strip across the
                    bottom of an otherwise clickable card. */}
                <span className="relative z-20 mt-3 flex items-center justify-between gap-2">
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
                  <span className="flex shrink-0 items-center gap-1.5">
                    {/* Status, not a control: when the build is present the
                        stretched link above already points at it, and when it
                        isn't there is nothing to click. Dimmed says "not built
                        yet" rather than handing over a dead link. */}
                    <span
                      className={`flex items-center gap-1.5 rounded-full bg-[#F4F1E8] px-3 py-1.5 text-[11px] font-semibold text-[#111] ${
                        item.demo ? '' : 'opacity-40'
                      }`}
                    >
                      {item.demo && (
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#12B76A]" />
                      )}
                      Live
                    </span>

                    {item.repo && (
                      <a
                        href={item.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View the ${item.title} source on GitHub`}
                        className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-[#F4F1E8] px-3 py-1.5 text-[11px] font-semibold text-[#111] transition-colors hover:bg-[#E7E2D3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
                      >
                        <GithubMark />
                        Code
                      </a>
                    )}
                  </span>
                </span>
              </div>
            </motion.div>
          </motion.div>
        )
      })}
    </div>
  )
}
