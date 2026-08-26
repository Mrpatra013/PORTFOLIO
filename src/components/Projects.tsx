import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import HoverDeck from './ui/HoverDeck'
import StickerDrag from './ui/StickerDrag'
import type { DeckItem } from './ui/HoverDeck'
import { EASE, revealProps } from '../lib/motion'
import { scrollToSection } from '../lib/scrollLock'
import { useAvailableDemos } from '../lib/useDemos'
import { galleryItems, stickers } from '../data/site'

const scrollToGallery = () => scrollToSection('#gallery')

// Hand-placed arrangement, transcribed from a 1456x803 reference layout and
// stored as percentages of the section so the composition survives any window
// size. Stickers sit above the headline and the card deck (z-30), which is
// what lets the smiley overlap "THE WORK." and the speech bubbles sit on the
// cards. Ordered back-to-front; later entries paint on top.
// Positions are render-time only — nothing is persisted, so a reload always
// rebuilds this exact arrangement. Below `md` only four show, dropped beneath
// the CTA, since the headline spans the full width there.
const STICKER_LAYOUT = [
  { id: 'spark', width: 90, rotate: -16, className: 'left-[250px] top-[300px] md:left-[70.7%] md:top-[2.2%]' },
  { id: 'smiley', width: 100, rotate: 11, className: 'hidden md:block md:left-[27.1%] md:top-[7.3%]' },
  { id: 'bang', width: 46, rotate: 15, className: 'left-[196px] top-[286px] md:left-[65.2%] md:top-[12.2%]' },
  { id: 'arrow', width: 70, rotate: -20, className: 'hidden md:block md:left-[31%] md:top-[22.7%]' },
  // Anchored to the CTA itself rather than to the section: the headline is
  // vw-sized, so the button rides higher on narrower screens and any fixed
  // offset would drift off it. `top-full` pins the sticker to the button's
  // bottom edge and the negative margin pulls it back up into an overlap.
  {
    id: 'cursor',
    width: 68,
    rotate: -10,
    anchor: 'cta',
    className: 'left-[110px] top-[318px] md:left-[calc(50%-5px)] md:top-full md:-mt-5',
  },
  { id: 'thinking', width: 170, rotate: -6, className: 'left-2 top-[292px] md:left-[6.7%] md:top-[46.7%]' },
  { id: 'goodday', width: 150, rotate: 7, className: 'hidden md:block md:left-[84.2%] md:top-[48.9%]' },
  { id: 'keepitup', width: 160, rotate: -8, className: 'hidden md:block md:left-[28.5%] md:top-[53.9%]' },
  { id: 'haha', width: 155, rotate: 9, className: 'hidden md:block md:left-[75.2%] md:top-[55.3%]' },
  { id: 'dude', width: 145, rotate: -12, className: 'hidden md:block md:left-[0.8%] md:top-[59.3%]' },
] as const

/**
 * Section 2 — "browse the library": centred title + CTA over a deck of
 * overlapping cards rising from the bottom edge. Hover a card to pull it up.
 */
export default function Projects() {
  // The hint teaches the interaction once, then retires as soon as the
  // visitor actually picks a sticker up.
  const [grabbed, setGrabbed] = useState(false)

  // A card only gets a demo link once the manifest confirms that build is
  // really in public/demos — a `demo` path in site.ts on its own is just a
  // declaration, and would otherwise open an empty page.
  const availableDemos = useAvailableDemos()
  const deckItems = useMemo<DeckItem[]>(
    () =>
      galleryItems.map((item) => ({
        id: item.id,
        src: item.src,
        video: item.coverVideo,
        alt: item.alt,
        title: item.name ?? item.label,
        blurb: item.blurb,
        views: item.views,
        likes: item.likes,
        year: item.year,
        repo: item.repo || undefined,
        demo: item.demo && availableDemos.has(item.id) ? item.demo : undefined,
        onSelect: scrollToGallery,
      })),
    [availableDemos],
  )

  return (
    <section
      id="work"
      aria-label="Projects"
      // `overflow-hidden` blocks user scrolling but leaves the section
      // programmatically scrollable: focusing a deck card that the bottom edge
      // clips makes the browser scroll it into view, permanently shifting the
      // whole deck. Pin the scroll box back to its origin.
      onScroll={(e) => {
        e.currentTarget.scrollTop = 0
        e.currentTarget.scrollLeft = 0
      }}
      className="relative h-svh min-h-[600px] overflow-hidden rounded-t-[2.5rem] bg-[#F4F1E8] shadow-[0_-32px_80px_rgba(0,0,0,0.45)]"
    >
      {/* Scattered across the top-right, clear of the fixed menu capsule
          above them and of the headline to their left. */}
      {STICKER_LAYOUT.filter((l) => !('anchor' in l)).map(({ id, width, rotate, className }) => {
        const sticker = stickers.find((s) => s.id === id)
        if (!sticker) return null
        return (
          <StickerDrag
            key={sticker.id}
            src={sticker.src}
            alt={sticker.alt}
            bbox={sticker.bbox}
            aspect={sticker.aspect}
            width={width}
            rotate={rotate}
            onGrab={() => setGrabbed(true)}
            className={`absolute z-30 ${className}`}
          />
        )
      })}

      <div className="flex flex-col items-center px-5 pt-16 text-center md:pt-20">
        <motion.p
          {...revealProps}
          className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#4a4a4a]"
        >
          Open the local build — or read the code
        </motion.p>
        <motion.h2
          {...revealProps}
          transition={{ ...revealProps.transition, delay: 0.1 }}
          className="mt-4 font-black uppercase leading-[0.9] tracking-tight text-[#111] text-[13vw] sm:text-[9vw] lg:text-[6.5vw]"
        >
          The Work.
        </motion.h2>
        {/* Kept mounted and faded rather than unmounted: it sits in normal
            flow, so removing it would shift the CTA up under the reader. */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          // Driven through whileInView, not `animate` — whileInView wins while
          // the element is on screen, so an `animate` fade would be ignored.
          whileInView={grabbed ? { opacity: 0, y: 0 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
          transition={{ duration: 0.5, ease: EASE, delay: grabbed ? 0 : 0.22 }}
          aria-hidden={grabbed}
          className="mt-5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#4a4a4a]"
        >
          Drag the stickers — make your own collage
        </motion.p>

        <motion.div
          {...revealProps}
          transition={{ ...revealProps.transition, delay: 0.28 }}
          className="relative z-30 inline-block"
        >
          <button
            type="button"
            onClick={scrollToGallery}
            className="mt-8 inline-flex min-h-[44px] cursor-pointer items-center gap-3 rounded-full border-0 bg-[#0B0B0B] px-7 py-4 text-base font-semibold text-white transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111]"
          >
            View gallery
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
          {STICKER_LAYOUT.filter((l) => 'anchor' in l).map(({ id, width, rotate, className }) => {
            const sticker = stickers.find((st) => st.id === id)
            if (!sticker) return null
            return (
              <StickerDrag
                key={sticker.id}
                src={sticker.src}
                alt={sticker.alt}
                bbox={sticker.bbox}
                aspect={sticker.aspect}
                width={width}
                rotate={rotate}
                onGrab={() => setGrabbed(true)}
                className={`absolute ${className}`}
              />
            )
          })}
        </motion.div>
      </div>

      <HoverDeck items={deckItems} />
    </section>
  )
}
