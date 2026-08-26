import { useEffect } from 'react'
import { useIntroReady } from './introReady'
import { scrollToSection } from './scrollLock'

/**
 * Makes every in-page anchor scroll smoothly, site-wide.
 *
 * Components that need to do something else on click first (MenuCapsule has to
 * close itself and release the scroll lock) still call `scrollToSection`
 * themselves and `preventDefault`; this listener sees `defaultPrevented` and
 * stays out of the way. Everything else — links in copy, anything added later —
 * gets the behaviour for free just by being an `href="#..."` anchor.
 */
export default function useSmoothAnchors() {
  const { ready } = useIntroReady()

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      // Leave modified clicks alone: they open tabs/windows, not scroll.
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const anchor = (event.target as Element | null)?.closest?.('a')
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return

      const href = anchor.getAttribute('href')
      if (!href || !href.startsWith('#')) return

      if (scrollToSection(href)) event.preventDefault()
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  // Honour a hash in the URL (`/#work`) on first load. The browser's own
  // attempt is doomed — it resolves the target against the sticky layout and
  // lands in the wrong place — and it would fire mid-intro, while the loader
  // holds the scroll lock and Lenis ignores scrollTo outright. So wait for the
  // intro to hand scrolling back, then glide there like a nav click would.
  useEffect(() => {
    if (!ready) return
    const hash = window.location.hash
    if (hash.length < 2) return
    const id = requestAnimationFrame(() => scrollToSection(hash))
    return () => cancelAnimationFrame(id)
  }, [ready])
}
