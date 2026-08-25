import type Lenis from 'lenis'

let lenisInstance: Lenis | null = null
let lockCount = 0

export function setLenisInstance(instance: Lenis | null) {
  lenisInstance = instance
}

export function getLenisInstance() {
  return lenisInstance
}

/**
 * Scroll to a section by selector.
 *
 * Passing the selector straight to `lenis.scrollTo` does not work here: every
 * section is wrapped in a `position: sticky` layer, and while a section is
 * pinned both `getBoundingClientRect().top` and `offsetTop` report the *pinned*
 * position, not where the section actually lives in the document. A pinned
 * section reads as top 0, so Lenis resolves the target to the current scroll
 * offset and does nothing at all.
 *
 * Neutralising the stickiness for one synchronous read gives the real layout
 * position. The style is restored before the browser paints, so nothing jumps.
 */
export function scrollToSection(selector: string, duration = 1.4) {
  const section = document.querySelector<HTMLElement>(selector)
  const lenis = lenisInstance
  if (!section || !lenis) return

  const wrapper = section.parentElement
  const sticky = wrapper && getComputedStyle(wrapper).position === 'sticky' ? wrapper : null

  const previous = sticky?.style.position ?? ''
  if (sticky) sticky.style.position = 'static'
  const target = section.getBoundingClientRect().top + window.scrollY
  if (sticky) sticky.style.position = previous

  lenis.scrollTo(target, { duration })
}

export function stopScroll() {
  lockCount++
  lenisInstance?.stop()
  document.documentElement.style.position = 'relative'
  document.documentElement.style.overflow = 'hidden'
  document.documentElement.style.height = '100%'
}

export function startScroll() {
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount > 0) return
  lenisInstance?.start()
  document.documentElement.style.removeProperty('position')
  document.documentElement.style.removeProperty('overflow')
  document.documentElement.style.removeProperty('height')
}
