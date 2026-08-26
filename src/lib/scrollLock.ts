import type Lenis from 'lenis'

let lenisInstance: Lenis | null = null
let lockCount = 0

export function setLenisInstance(instance: Lenis | null) {
  lenisInstance = instance
}

export function getLenisInstance() {
  return lenisInstance
}

/** Matches the site's motion curve (framer's [0.22, 1, 0.36, 1]) closely enough. */
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** `#top`, `#`, and an empty hash all mean "back to the top of the page". */
const isTopTarget = (selector: string) =>
  selector === '#' || selector === '' || selector === '#top'

/**
 * Where a section really sits in the document.
 *
 * Every section is wrapped in a `position: sticky` layer, and while a section
 * is pinned both `getBoundingClientRect().top` and `offsetTop` report the
 * *pinned* position, not where the section actually lives in the document. A
 * pinned section reads as top 0, so Lenis would resolve the target to the
 * current scroll offset and do nothing at all.
 *
 * Neutralising every sticky ancestor for one synchronous read gives the real
 * layout position. The styles are restored before the browser paints, so
 * nothing jumps.
 */
function documentTopOf(section: HTMLElement) {
  const stuck: Array<[HTMLElement, string]> = []
  for (let el = section.parentElement; el; el = el.parentElement) {
    if (getComputedStyle(el).position !== 'sticky') continue
    stuck.push([el, el.style.position])
    el.style.position = 'static'
  }

  const top = section.getBoundingClientRect().top + window.scrollY

  for (const [el, previous] of stuck) {
    if (previous) el.style.position = previous
    else el.style.removeProperty('position')
  }

  return top
}

interface ScrollToSectionOptions {
  /** Seconds the travel takes. Ignored under `prefers-reduced-motion`. */
  duration?: number
  /** Pixels to land short of (negative) or past (positive) the section top. */
  offset?: number
  /** Reflect the destination in the address bar so the URL stays shareable. */
  updateHash?: boolean
}

/**
 * Smooth-scroll to a section by selector (`#about`, `#work`, `#top`, ...).
 *
 * This is what every nav link and in-page CTA goes through — a plain anchor
 * can't be used, because the browser's own hash scrolling reads the pinned
 * position described above and lands in the wrong place (and jumps there).
 *
 * Returns false when the target doesn't exist or Lenis isn't up yet, which
 * lets the caller fall back to the anchor's default behaviour.
 */
export function scrollToSection(selector: string, options: ScrollToSectionOptions = {}) {
  const { duration = 1.4, offset = 0, updateHash = true } = options
  const lenis = lenisInstance
  if (!lenis) return false

  const top = isTopTarget(selector)
  const section = top ? null : document.querySelector<HTMLElement>(selector)
  if (!top && !section) return false

  const target = section ? documentTopOf(section) + offset : 0

  lenis.scrollTo(target, {
    duration,
    easing: easeOutExpo,
    immediate: prefersReducedMotion(),
  })

  if (updateHash) {
    // replaceState, not `location.hash`: assigning the hash makes the browser
    // jump to it instantly, which is the exact thing this function exists to
    // avoid. Replacing (rather than pushing) keeps the back button pointing at
    // wherever the visitor came from instead of at every section they visited.
    const url = top ? window.location.pathname + window.location.search : selector
    window.history.replaceState(null, '', url)
  }

  return true
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
