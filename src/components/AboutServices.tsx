import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SectionHeading from './SectionHeading'
import { EASE, revealProps } from '../lib/motion'
import { cn } from '../lib/utils'
import { services } from '../data/site'
import type { Service } from '../data/site'

/** Section 4 — numbered service rows that expand into full details. */
export default function AboutServices() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <section id="services" aria-label="Services" className="relative rounded-t-[2.5rem] bg-[#0a0a0a] px-5 py-24 shadow-[0_-32px_80px_rgba(0,0,0,0.45)] md:px-10 md:py-32">
      <SectionHeading eyebrow="What I do" title="Built to" accent="Sell." />
      <motion.p
        {...revealProps}
        transition={{ ...revealProps.transition, delay: 0.15 }}
        className="mt-6 max-w-2xl text-base text-white/70 md:text-lg"
      >
        Websites with a sales system built in. Every system does four jobs:
        capture, respond, follow up and return. Start with the full thing, or
        with the part where you're losing the most.
      </motion.p>

      <ul className="mt-14 border-t border-white/10 md:mt-20">
        {services.map((service, i) => (
          <motion.li
            key={service.id}
            {...revealProps}
            transition={{ ...revealProps.transition, delay: i * 0.05 }}
            className="border-b border-white/10"
          >
            <ServiceRow
              service={service}
              open={openId === service.id}
              onToggle={() => setOpenId((cur) => (cur === service.id ? null : service.id))}
            />
          </motion.li>
        ))}
      </ul>
    </section>
  )
}

function ServiceRow({ service, open, onToggle }: { service: Service; open: boolean; onToggle: () => void }) {
  const panelId = `service-panel-${service.id}`
  const buttonId = `service-button-${service.id}`
  const { details } = service

  return (
    <div className="group">
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full flex-col gap-3 py-7 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/60 md:grid md:grid-cols-[auto_1fr_minmax(0,20rem)_auto] md:items-center md:gap-8 md:py-9"
        >
          <span className="text-sm font-bold text-accent md:w-10">{service.id}</span>
          <span className="flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/40">{service.tag}</span>
            <span
              className={cn(
                'text-3xl font-black uppercase tracking-tight text-white transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:translate-x-2 md:text-5xl',
                open && 'translate-x-2 text-accent',
              )}
            >
              {service.title}
            </span>
          </span>
          <span className="flex items-start justify-between gap-4 md:block">
            <span className="text-sm leading-relaxed text-white/60 md:text-base">{service.blurb}</span>
            <PlusIcon open={open} className="mt-0.5 md:hidden" />
          </span>
          <PlusIcon open={open} className="hidden md:flex" />
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="pb-10 md:pb-14 md:pl-[4.5rem]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-10">
                <div className="flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between md:gap-12">
                  <p className="max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">{details.intro}</p>
                  <dl className="flex shrink-0 gap-8">
                    {details.meta.map((m) => (
                      <div key={m.label}>
                        <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/40">{m.label}</dt>
                        <dd className="mt-1 text-base font-bold text-white md:text-lg">{m.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className={cn('mt-8 grid gap-10', details.groups.length > 1 && 'md:grid-cols-2')}>
                  {details.groups.map((group) => (
                    <div key={group.heading}>
                      <h4 className="text-lg font-black uppercase tracking-tight text-white">{group.heading}</h4>
                      <ul className="mt-4">
                        {group.items.map((item) => (
                          <li
                            key={item}
                            className="flex gap-3 border-b border-white/[0.07] py-3 text-sm leading-relaxed last:border-b-0 md:text-[15px]"
                          >
                            <span
                              aria-hidden="true"
                              className={cn(
                                'mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full',
                                group.muted ? 'bg-white/25' : 'bg-accent',
                              )}
                            />
                            <ItemText text={item} muted={group.muted} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className={cn('mt-8 grid gap-4', details.note && 'md:grid-cols-2')}>
                  <div className="rounded-2xl bg-accent/10 p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-accent">Perfect for</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/80 md:text-[15px]">{details.bestFor}</p>
                  </div>
                  {details.note && (
                    <div className="rounded-2xl border border-white/10 p-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/50">Good to know</p>
                      <p className="mt-2 text-sm leading-relaxed text-white/80 md:text-[15px]">{details.note}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Bolds a leading "Label:" so the four jobs (Capture, Respond…) scan quickly. */
function ItemText({ text, muted }: { text: string; muted?: boolean }) {
  const match = text.match(/^([A-Z][\w\s]{0,20}):\s(.+)$/)
  const tone = muted ? 'text-white/45' : 'text-white/70'
  if (!match) return <span className={tone}>{text}</span>
  return (
    <span className={tone}>
      <strong className="font-bold text-white">{match[1]}:</strong> {match[2]}
    </span>
  )
}

function PlusIcon({ open, className }: { open: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-300',
        open ? 'border-accent bg-accent text-black' : 'border-white/20 text-white group-hover:border-accent group-hover:text-accent',
        className,
      )}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className={cn('transition-transform duration-300', open && 'rotate-45')}
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </span>
  )
}
