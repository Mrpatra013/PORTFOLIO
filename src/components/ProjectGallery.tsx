import { motion } from 'framer-motion'
import DragCards from './ui/DragCards'
import { revealProps } from '../lib/motion'
import { galleryItems } from '../data/site'

/**
 * Section 1 — the sheet that slides over the pinned hero: a single-viewport
 * stage of draggable project previews with the section title at its centre.
 */
export default function ProjectGallery() {
  return (
    <section
      id="gallery"
      aria-label="Project gallery"
      className="relative flex h-svh min-h-[600px] flex-col rounded-t-[2.5rem] bg-[#0a0a0a] px-5 py-10 shadow-[0_-32px_80px_rgba(0,0,0,0.45)] md:px-10 md:py-12"
    >
      <DragCards
        items={galleryItems.map(({ id, src, video, alt, label }) => ({ id, src, video, alt, title: label }))}
        className="flex-1"
        center={
          <motion.div {...revealProps}>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-white/50">
              Selected work in motion
            </p>
            <h2 className="font-black uppercase leading-[0.9] tracking-tight text-white text-[11vw] sm:text-[8vw] lg:text-[5vw]">
              <span className="block">Work that</span>
              <span className="block">Moves.</span>
            </h2>
            <p className="mt-4 text-xs font-medium text-white/40 md:text-sm">Click the background to reset</p>
          </motion.div>
        }
      />
    </section>
  )
}
