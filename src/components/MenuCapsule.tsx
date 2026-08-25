import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useIntroReady } from '../lib/introReady'
import { scrollToSection, startScroll, stopScroll } from '../lib/scrollLock'
import { navLinks } from '../data/site'

export default function MenuCapsule() {
  const [open, setOpen] = useState(false)
  const [footerInView, setFooterInView] = useState(false)
  const { ready } = useIntroReady()

  useEffect(() => {
    if (!open) return
    stopScroll()
    return () => startScroll()
  }, [open])

  // Hide the capsule while the footer section occupies the viewport.
  useEffect(() => {
    const footer = document.querySelector('#contact')
    if (!footer) return
    const observer = new IntersectionObserver(
      ([entry]) => setFooterInView(entry.intersectionRatio > 0.25),
      { threshold: [0, 0.25, 0.5] }
    )
    observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  const hidden = footerInView && !open

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={ready ? (hidden ? { opacity: 0, y: -16 } : { opacity: 1, y: 0 }) : {}}
      transition={{ duration: 0.6, delay: hidden ? 0 : 0.15, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-4 right-5 z-50 md:top-[27px] md:right-10 ${hidden ? 'pointer-events-none' : ''}`}
    >
      <div
        className={`relative flex items-center overflow-hidden rounded-full bg-white transition-[width,height] duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
          open ? 'h-[71px] w-[300px] sm:w-[380px]' : 'h-[59px] w-[59px]'
        }`}
      >
        <nav
          id="menu-capsule-nav"
          aria-hidden={!open}
          className={`flex items-center gap-5 whitespace-nowrap py-0 pl-6 pr-[77px] transition-opacity duration-300 ${
            open ? 'opacity-100 delay-150' : 'opacity-0'
          }`}
        >
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              tabIndex={open ? 0 : -1}
              onClick={(e) => {
                e.preventDefault()
                setOpen(false)
                // Wait a frame so the close effect's cleanup restarts Lenis
                // (scrollTo is ignored while Lenis is stopped).
                requestAnimationFrame(() => {
                  scrollToSection(href)
                })
              }}
              className="cursor-pointer text-sm font-medium text-[#111111] no-underline transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:text-base"
            >
              {label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="menu-capsule-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
          className={`absolute flex h-[59px] w-[59px] shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-full border-0 bg-[#0B0B0B] transition-[top,right,transform] duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-105 ${
            open ? 'right-1.5 top-1.5' : 'right-0 top-0'
          }`}
        >
          <span
            aria-hidden="true"
            style={open ? { transform: 'rotate(45deg) translate(2px, 2px)' } : undefined}
            className="block h-[2px] w-6 bg-[#F4F1E8] transition-transform duration-300 ease-[ease]"
          />
          <span
            aria-hidden="true"
            style={open ? { transform: 'rotate(-45deg) translate(2px, -2px)' } : undefined}
            className="block h-[2px] w-6 bg-[#F4F1E8] transition-transform duration-300 ease-[ease]"
          />
        </button>
      </div>
    </motion.div>
  )
}
