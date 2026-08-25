import { useEffect } from 'react'
import Lenis from 'lenis'
import { MotionConfig } from 'framer-motion'
import Hero from './components/Hero'
import MenuCapsule from './components/MenuCapsule'
import PageLoader from './components/PageLoader'
import ProjectGallery from './components/ProjectGallery'
import Projects from './components/Projects'
import AboutServices from './components/AboutServices'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer'
import StickySection from './components/StickySection'
import { IntroReadyProvider } from './lib/introReady'
import { setLenisInstance } from './lib/scrollLock'

export default function App() {
  useEffect(() => {
    const lenis = new Lenis()
    setLenisInstance(lenis)

    let frameId = requestAnimationFrame(function raf(time) {
      lenis.raf(time)
      frameId = requestAnimationFrame(raf)
    })

    return () => {
      cancelAnimationFrame(frameId)
      lenis.destroy()
      setLenisInstance(null)
    }
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <IntroReadyProvider>
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
      </IntroReadyProvider>
    </MotionConfig>
  )
}
