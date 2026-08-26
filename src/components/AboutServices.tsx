import { motion } from 'framer-motion'
import SectionHeading from './SectionHeading'
import { revealProps } from '../lib/motion'
import { services } from '../data/site'

/** Section 3 — about + numbered service rows with hover interactions. */
export default function AboutServices() {
  return (
    <section id="about" aria-label="About and services" className="relative rounded-t-[2.5rem] bg-[#0a0a0a] px-5 py-24 shadow-[0_-32px_80px_rgba(0,0,0,0.45)] md:px-10 md:py-32">
      <SectionHeading eyebrow="What we do" title="Built to" accent="Perform." />
      <motion.p
        {...revealProps}
        transition={{ ...revealProps.transition, delay: 0.15 }}
        className="mt-6 max-w-xl text-base text-white/70 md:text-lg"
      >
        We build the systems that turn traffic into customers and leads into
        revenue — ecommerce sites with built-in CRM, digital catalogs, and
        ordering flows for brands across India and abroad.
      </motion.p>

      <ul className="mt-14 border-t border-white/10 md:mt-20">
        {services.map((service, i) => (
          <motion.li
            key={service.id}
            {...revealProps}
            transition={{ ...revealProps.transition, delay: i * 0.05 }}
            className="group border-b border-white/10"
          >
            <div className="flex flex-col gap-3 py-7 md:grid md:grid-cols-[auto_1fr_minmax(0,20rem)_auto] md:items-center md:gap-8 md:py-9">
              <span className="text-sm font-bold text-accent md:w-10">{service.id}</span>
              <h3 className="text-3xl font-black uppercase tracking-tight text-white transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:translate-x-2 md:text-5xl">
                {service.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/60 md:text-base">{service.blurb}</p>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#E86100"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block"
              >
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
