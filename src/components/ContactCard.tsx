import { useLayoutEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { contactEmail, stickers } from '../data/site'
import StickerDrag from './ui/StickerDrag'

gsap.registerPlugin(ScrollTrigger)

/**
 * Where the form posts. FormSubmit relays the submission straight to
 * `contactEmail`, which keeps this a fully static site (no server of our own).
 * Override with VITE_CONTACT_ENDPOINT in .env to point at any endpoint that
 * accepts a JSON POST — e.g. a Formspree form or your own API.
 *
 * NOTE: FormSubmit sends a one-time activation email to `contactEmail` the
 * first time the form is submitted; the link in it has to be clicked once
 * before submissions start arriving.
 */
const formEndpoint =
  import.meta.env.VITE_CONTACT_ENDPOINT ?? `https://formsubmit.co/ajax/${contactEmail}`

// 5.png is reserved for this card — it is the one sticker the Projects
// collage never lays out, so it only ever appears here.
const cardSticker = stickers.find((s) => s.id === 'tentacle')

/**
 * Contact card anchored to the footer's top-right corner. A GSAP ScrollTrigger
 * slides it in from off the footer's right edge as the footer scrolls into
 * view; the footer's overflow-hidden hides it until it arrives, so it reads as
 * sliding out from the side of the page.
 */
export default function ContactCard() {
  const cardRef = useRef<HTMLElement>(null)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  useLayoutEffect(() => {
    const el = cardRef.current
    const footer = el?.closest('footer')
    if (!el || !footer) return

    // Reduced motion: no slide, just sit in place.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { xPercent: 100 },
        {
          xPercent: 0,
          duration: 1.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: footer,
            start: 'top 75%',
            // Replays if you scroll back up and return to the footer.
            toggleActions: 'play none none reverse',
          },
        }
      )
    }, el)

    return () => ctx.revert()
  }, [])

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === 'sending') return

    const form = e.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') ?? '')
    const email = String(data.get('email') ?? '')
    // Bots fill every field they find; a human never sees this one.
    if (data.get('_honey')) return

    setStatus('sending')
    try {
      const res = await fetch(formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name,
          email,
          // Replies from the inbox go straight back to whoever wrote in.
          _replyto: email,
          _subject: `New enquiry from ${name} — TheDesk`,
          _template: 'table',
          _captcha: 'false',
          message: `${name} (${email}) would like to talk about a project.`,
        }),
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      setStatus('sent')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  // Fallback for a failed send: opens the visitor's mail client, pre-filled.
  const mailtoHref = () => {
    const subject = encodeURIComponent('New enquiry — TheDesk')
    const body = encodeURIComponent("Hi, I'd like to talk about a project.")
    return `mailto:${contactEmail}?subject=${subject}&body=${body}`
  }

  return (
    // A <section>, not a div: StickerDrag bounds a drag to its nearest
    // section, which keeps the sticker on the card instead of letting it be
    // dragged into the footer's overflow-hidden and lost.
    <section
      ref={cardRef}
      aria-label="Contact form"
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

            {/* Honeypot — hidden from people, irresistible to bots. */}
            <input
              type="text"
              name="_honey"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />

            <button
              type="submit"
              disabled={status === 'sending'}
              className="mt-9 w-full cursor-pointer rounded-full border-0 bg-[#111111] py-4 text-base font-semibold text-white transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black disabled:cursor-wait disabled:opacity-70 disabled:hover:scale-100"
            >
              {status === 'sending' ? 'Sending…' : 'Let`s figure it out!'}
            </button>

            {/* aria-live so the outcome is announced, not just shown. */}
            <p aria-live="polite" className="mt-4 min-h-[1.5rem] text-sm font-medium text-[#161616]">
              {status === 'sent' && "Thanks — your message is on its way. We'll be in touch shortly."}
              {status === 'error' && (
                <>
                  Something went wrong sending that.{' '}
                  <a href={mailtoHref()} className="underline underline-offset-2">
                    Email us directly
                  </a>
                  .
                </>
              )}
            </p>
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
    </section>
  )
}
