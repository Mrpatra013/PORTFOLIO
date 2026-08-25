import { useReducedMotion } from 'framer-motion'
import SectionHeading from './SectionHeading'
import TestimonialsColumn, { TestimonialCard } from './ui/TestimonialsColumn'
import { testimonials } from '../data/site'

/**
 * Section 4 — marquee testimonial columns; static grid under reduced motion.
 *
 * Locked to one viewport: the heading takes its natural height and the marquee
 * claims whatever is left (`flex-1 min-h-0`), so the columns shrink on short
 * screens instead of pushing the section past 100vh.
 */
export default function Testimonials() {
  const reducedMotion = useReducedMotion()

  const firstColumn = testimonials.slice(0, 2)
  const secondColumn = testimonials.slice(2, 4)
  const thirdColumn = testimonials.slice(4, 6)

  return (
    <section
      aria-label="Testimonials"
      className="relative flex h-svh min-h-[600px] flex-col overflow-hidden rounded-t-[2.5rem] bg-[#F4F1E8] px-5 pt-16 shadow-[0_-32px_80px_rgba(0,0,0,0.45)] md:px-10 md:pt-20"
    >
      <SectionHeading
        eyebrow="Client words"
        title="Don't take"
        accent="Our word."
        dark={false}
        className="text-center"
        // Trimmed from the default 5.5vw so both lines plus the deck of cards
        // stay inside a single viewport.
        titleClassName="text-[11vw] sm:text-[7.5vw] lg:text-[4.6vw]"
      />

      {reducedMotion ? (
        <div className="mt-10 grid min-h-0 flex-1 grid-cols-1 justify-items-center gap-6 overflow-y-auto pb-10 sm:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <TestimonialCard key={testimonial.name} {...testimonial} colorIndex={i} />
          ))}
        </div>
      ) : (
        <div className="mt-10 flex min-h-0 flex-1 justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]">
          <TestimonialsColumn testimonials={firstColumn} duration={15} startIndex={0} />
          <TestimonialsColumn testimonials={secondColumn} duration={19} startIndex={2} className="hidden md:block" />
          <TestimonialsColumn testimonials={thirdColumn} duration={17} startIndex={4} className="hidden xl:block" />
        </div>
      )}
    </section>
  )
}
