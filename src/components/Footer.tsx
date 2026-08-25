import { motion } from 'framer-motion'
import { revealProps } from '../lib/motion'
import ContactCard from './ContactCard'
import WalkingCrowd from './ui/WalkingCrowd'

/** Section 5 — big CTA headline over the walking-crowd animation. */
export default function Footer() {
  return (
    <footer id="contact" aria-label="Contact" className="relative h-svh overflow-hidden rounded-t-[2.5rem] bg-black px-5 pt-16 shadow-[0_-32px_80px_rgba(0,0,0,0.45)] md:px-10 md:pt-20">
      {/* On narrow screens the contact card overlays the top of the section,
          so the headline drops below it; from lg the card is slim enough to
          share the row. */}
      <div className="relative z-10 mt-[26rem] lg:mt-0">
      <motion.p {...revealProps} className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/60">
        Got a project?
      </motion.p>
      <motion.h2
        {...revealProps}
        transition={{ ...revealProps.transition, delay: 0.1 }}
        className="mt-4 font-black uppercase leading-[1] tracking-tight text-white text-[11vw] sm:text-[7.5vw] lg:text-[5.5vw]"
      >
        <span className="block">Don't settle</span>
        <span className="block">
          For <span className="text-accent">Average.</span>
        </span>
      </motion.h2>

      </div>

      {/* Walking crowd animation (Open Peeps), ported from adxy/minima. Anchored to
          the footer's bottom edge so the section stays exactly 100vh; content sits
          above it via z-index. Rendered in the sprite sheet's original colors
          (black line art + white fills, transparent background), same as the
          reference. */}
      <WalkingCrowd className="absolute inset-x-0 bottom-0 z-30 aspect-[2/1] w-full" />

      {/* Contact card sliding out of the top-right corner (cropped by it). */}
      <ContactCard />
    </footer>
  )
}
