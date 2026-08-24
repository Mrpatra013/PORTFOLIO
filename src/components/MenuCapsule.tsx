import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useIntroReady } from '../lib/introReady'
import { startScroll, stopScroll } from '../lib/scrollLock'

const NAV_LINKS = ['About', 'Work', 'Contact Us']

export default function MenuCapsule() {
  const [open, setOpen] = useState(false)
  const { ready } = useIntroReady()

  useEffect(() => {
    if (!open) return
    stopScroll()
    return () => startScroll()
  }, [open])

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={ready ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-4 right-5 z-10 md:top-[27px] md:right-10"
    >
      <div
        className={`relative flex items-center overflow-hidden rounded-full bg-white transition-[width,height] duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
          open ? 'h-[71px] w-[300px] sm:w-[380px]' : 'h-[59px] w-[59px]'
        }`}
      >
        <nav
          aria-hidden={!open}
          className={`flex items-center gap-5 whitespace-nowrap py-0 pl-6 pr-[77px] transition-opacity duration-300 ${
            open ? 'opacity-100 delay-150' : 'opacity-0'
          }`}
        >
          {NAV_LINKS.map((label) => (
            <a
              key={label}
              href="#"
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-[#111111] no-underline transition-opacity hover:opacity-60 md:text-base"
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
