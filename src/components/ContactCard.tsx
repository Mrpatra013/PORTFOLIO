import type { FormEvent } from 'react'
import { motion } from 'framer-motion'
import { contactEmail, stickers } from '../data/site'
import StickerDrag from './ui/StickerDrag'

// 5.png is reserved for this card — it is the one sticker the Projects
// collage never lays out, so it only ever appears here.
const cardSticker = stickers.find((s) => s.id === 'tentacle')

/**
 * Contact card anchored to the footer's top-right corner. It slides out
 * diagonally from the corner as the footer scrolls into view — the footer's
 * overflow-hidden + rounded corner crop it during the reveal, so it reads as
 * emerging from the corner itself.
 */
export default function ContactCard() {
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const name = String(data.get('name') ?? '')
    const email = String(data.get('email') ?? '')
    const subject = encodeURIComponent(`Just saying hello — ${name}`)
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nHi, I'd like to talk about a project.`)
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`
  }

  return (
    // A <section>, not a div: StickerDrag bounds a drag to its nearest
    // section, which keeps the sticker on the card instead of letting it be
    // dragged into the footer's overflow-hidden and lost.
    <motion.section
      aria-label="Contact form"
      initial={{ x: '68%', y: '-68%' }}
      whileInView={{ x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      // overflow-hidden crops the sticker to the card: it can overhang an edge
      // (or be dragged to one) without ever spilling onto the black footer.
      className="absolute right-0 top-0 z-20 w-[min(92vw,680px)] overflow-hidden rounded-bl-[2.5rem] bg-accent p-6 sm:p-8 md:p-10 lg:w-[min(46vw,680px)]"
    >
      <div className="flex items-stretch gap-6">
        <div className="min-w-0 flex-1">
          <h3 className="text-4xl font-semibold tracking-tight text-[#161616] md:text-5xl">Just Say, Hello!</h3>

          <form onSubmit={onSubmit} className="mt-8">
            <label className="block">
              <span className="text-xl font-semibold text-[#161616] md:text-2xl">Name*</span>
              <input
                type="text"
                name="name"
                required
                placeholder="Jane Smith"
                autoComplete="name"
                className="card-input mt-2 block w-full border-0 border-b border-black/25 bg-transparent pb-2 text-lg text-white caret-white outline-none placeholder:text-black/35 focus:border-white/70"
              />
            </label>

            <label className="mt-7 block">
              <span className="text-xl font-semibold text-[#161616] md:text-2xl">Best email to reach you*</span>
              <input
                type="email"
                name="email"
                required
                placeholder="jane@company.com"
                autoComplete="email"
                className="card-input mt-2 block w-full border-0 border-b border-black/25 bg-transparent pb-2 text-lg text-white caret-white outline-none placeholder:text-black/35 focus:border-white/70"
              />
            </label>

            <button
              type="submit"
              className="mt-9 w-full cursor-pointer rounded-full border-0 bg-[#111111] py-4 text-base font-semibold text-white transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
            >
              Let`s figure it out!
            </button>
          </form>
        </div>

        {cardSticker && (
          <StickerDrag
            src={cardSticker.src}
            alt={cardSticker.alt}
            bbox={cardSticker.bbox}
            aspect={cardSticker.aspect}
            width={150}
            rotate={7}
            // Cancels most of the card's bottom padding so the tentacle's base
            // sits on the card's bottom edge and rises from there. Stops 8px
            // short of the full p-10 because the 7deg tilt lengthens the box —
            // at -mb-10 the die-cut outline was clipped by the card's edge.
            className="hidden shrink-0 self-end xl:-mb-8 xl:block"
          />
        )}
      </div>
    </motion.section>
  )
}
