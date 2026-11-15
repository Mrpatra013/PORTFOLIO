import { motion } from 'framer-motion'
import AboutLanyardCard from './ui/AboutLanyardCard'
import { revealProps } from '../lib/motion'

/** 26 September 2005. Months are 0-based in JS dates, so 8 = September. */
const BIRTH = { year: 2005, month: 8, day: 26 }

/** Whole years since BIRTH, ticking over on the birthday itself. */
function ageOn(today: Date) {
  const hadBirthday =
    today.getMonth() > BIRTH.month ||
    (today.getMonth() === BIRTH.month && today.getDate() >= BIRTH.day)
  return today.getFullYear() - BIRTH.year - (hadBirthday ? 0 : 1)
}

const FACTS: [string, string][] = [
  ['Age', String(ageOn(new Date()))],
  ['Role', 'Website & System Strategist'],
  ['Based in', 'New Delhi'],
]

/**
 * Section 2 — the sheet that slides over the pinned hero: who Sahil is, with
 * the hanging ID card swinging on the right.
 */
export default function AboutMe() {
  return (
    <section
      id="about"
      aria-label="About me"
      className="relative flex min-h-svh flex-col justify-center overflow-hidden rounded-t-[2.5rem] bg-[#0a0a0a] px-5 py-20 shadow-[0_-32px_80px_rgba(0,0,0,0.45)] md:px-10 md:py-24"
    >
      <div className="relative z-10 lg:max-w-[52%]">
        <motion.div {...revealProps}>
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em] text-white/60">About me</p>
          <h2 className="whitespace-nowrap font-black uppercase leading-[0.9] tracking-tight text-white text-[11vw] sm:text-[8vw] lg:text-[4.8vw]">
            Hi, I'm <span className="text-accent">Sahil.</span>
          </h2>
        </motion.div>

        <motion.p
          {...revealProps}
          transition={{ ...revealProps.transition, delay: 0.15 }}
          className="mt-10 max-w-2xl text-base leading-relaxed text-white/80 md:mt-12 md:text-lg"
        >
          I help businesses turn their website into something that sells. Not just
          a page that looks good, but a system that captures visitors, answers
          them, follows up and brings them back.
        </motion.p>

        <motion.p
          {...revealProps}
          transition={{ ...revealProps.transition, delay: 0.2 }}
          className="mt-6 max-w-2xl text-base leading-relaxed text-white/60 md:text-lg"
        >
          And it won't look like everyone else's. I design every brand's site from
          a blank canvas, with{' '}
          <span className="font-semibold">
            bold type, scroll-driven motion, interactive 3D and details people
            stop to play with
          </span>
          , so your brand feels unforgettable the second someone lands on it, not
          like another template.
        </motion.p>

        <motion.dl
          {...revealProps}
          transition={{ ...revealProps.transition, delay: 0.25 }}
          className="mt-10 grid max-w-2xl grid-cols-[auto_minmax(0,1.6fr)_minmax(0,1fr)] divide-x divide-white/10 rounded-3xl border border-white/10 bg-white/[0.03]"
        >
          {FACTS.map(([label, value]) => (
            <div key={label} className="px-5 py-5 md:px-7 md:py-6">
              <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/40">{label}</dt>
              <dd className="mt-2 text-base font-bold leading-snug text-white md:text-lg">{value}</dd>
            </div>
          ))}
        </motion.dl>
      </div>

      {/* The badge hangs from the top edge of the section, right-hand side. */}
      <div aria-label="ID card" className="absolute inset-y-0 right-0 hidden w-[46%] lg:block">
        <AboutLanyardCard />
      </div>
    </section>
  )
}
