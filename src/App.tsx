import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionConfig } from 'framer-motion'
import Hero from './components/Hero'
import MenuCapsule from './components/MenuCapsule'
import PageLoader from './components/PageLoader'
import ProjectGallery from './components/ProjectGallery'
import Projects from './components/Projects'
import AboutServices from './components/AboutServices'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer'
import MobileGate, { useMobileGate } from './components/MobileGate'
import StickySection from './components/StickySection'
import { IntroReadyProvider } from './lib/introReady'
import { setLenisInstance } from './lib/scrollLock'
import useSmoothAnchors from './lib/useSmoothAnchors'

/** Inside the provider, so the anchor handler can wait out the intro. */
function Page() {
  useSmoothAnchors()

  return (
    <>
      <PageLoader />
      {/* Each section pins, then the next one scrolls over it. Rising
          z-index keeps later sections on top; MenuCapsule sits above at 50. */}
      <main>
        <MenuCapsule />
        <StickySection zIndex={0}>
          <div className="h-svh">
            <Hero />
          </div>
        </StickySection>
        <StickySection zIndex={1}>
          <ProjectGallery />
        </StickySection>
        <StickySection zIndex={2}>
          <Projects />
        </StickySection>
        <StickySection zIndex={3}>
          <AboutServices />
        </StickySection>
        <StickySection zIndex={4}>
          <Testimonials />
        </StickySection>
        <StickySection zIndex={5} pin={false}>
          <Footer />
        </StickySection>
      </main>
    </>
  )
}

export default function App() {
  // Below the desktop breakpoint the site is replaced by a notice rather than
  // rendered underneath one: none of the scroll machinery below (Lenis,
  // ScrollTrigger, the three.js hero) should spin up for a visitor who isn't
  // going to see it.
  const { blocked, dismiss } = useMobileGate()

  useEffect(() => {
    if (blocked) return
    const lenis = new Lenis()
    setLenisInstance(lenis)

    // Lenis drives scrolling itself, so ScrollTrigger has to be updated from
    // its ticks rather than trailing native scroll events by a frame.
    gsap.registerPlugin(ScrollTrigger)
    lenis.on('scroll', ScrollTrigger.update)

    let frameId = requestAnimationFrame(function raf(time) {
      lenis.raf(time)
      frameId = requestAnimationFrame(raf)
    })

    return () => {
      cancelAnimationFrame(frameId)
      lenis.destroy()
      setLenisInstance(null)
    }
  }, [blocked])

  if (blocked) {
    return (
      <MotionConfig reducedMotion="user">
        <MobileGate onContinue={dismiss} />
      </MotionConfig>
    )
  }

  return (
    <MotionConfig reducedMotion="user">
      <IntroReadyProvider>
        <Page />
      </IntroReadyProvider>
    </MotionConfig>
  )
}
