// Adapted from 21st.dev "Testimonials Columns" by sshahaider (component id 1965),
// restyled to the TheDesk palette. The marquee runs as a CSS keyframe animation
// (see tailwind.config.js) so it can pause on hover via animation-play-state.
import { Fragment } from 'react'
import type { Testimonial } from '../../data/site'
import { cn } from '../../lib/utils'

interface TestimonialsColumnProps {
  testimonials: Testimonial[]
  duration?: number
  className?: string
  /** Offset of this column's slice within the full list, for avatar colours. */
  startIndex?: number
}

// Avatar colours. Each is dark enough to carry white initials at 14px
// (all ≥ 4.5:1), so the set can be assigned freely without checking contrast.
const AVATAR_COLORS = [
  '#E86100', // brand accent
  '#1D4ED8',
  '#047857',
  '#B91C1C',
  '#6D28D9',
  '#0E7490',
  '#A16207',
  '#BE185D',
]

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
}

// Card width tracks the viewport so three columns still clear the section
// padding at every breakpoint, but never gets narrower than a readable measure
// or wider than the 420px cap.
// `role` is intentionally not rendered — the cards show the name alone.
// `colorIndex` is the testimonial's position in the source list, which walks
// the palette so no two people share an avatar colour. Deliberately not
// Math.random: the marquee renders each testimonial twice and re-renders on
// hover, so a live random would make the copies disagree and reshuffle
// mid-scroll.
export function TestimonialCard({ text, name, colorIndex = 0 }: Testimonial & { colorIndex?: number }) {
  return (
    <figure className="w-[clamp(280px,30vw,420px)] max-w-full rounded-3xl bg-white p-8 shadow-[0_16px_40px_rgba(17,17,17,0.06)]">
      <blockquote className="text-[15px] leading-relaxed text-[#111] lg:text-base">{text}</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span
          aria-hidden="true"
          style={{ backgroundColor: AVATAR_COLORS[colorIndex % AVATAR_COLORS.length] }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
        >
          {initials(name)}
        </span>
        <span className="text-sm font-bold tracking-tight text-[#111]">{name}</span>
      </figcaption>
    </figure>
  )
}

/** Infinite upward marquee of testimonial cards; pauses on hover. */
export default function TestimonialsColumn({
  testimonials,
  duration = 14,
  className,
  startIndex = 0,
}: TestimonialsColumnProps) {
  return (
    <div className={cn('group/column', className)}>
      <div
        className="flex animate-marquee-y flex-col gap-6 pb-6 will-change-transform group-hover/column:[animation-play-state:paused]"
        style={{ animationDuration: `${duration}s` }}
      >
        {[0, 1].map((copy) => (
          <Fragment key={copy}>
            {testimonials.map((testimonial, i) => (
              <div key={i} aria-hidden={copy === 1}>
                <TestimonialCard {...testimonial} colorIndex={startIndex + i} />
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
