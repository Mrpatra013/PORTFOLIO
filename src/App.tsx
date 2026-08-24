import { useEffect } from 'react'
import Lenis from 'lenis'
import Hero from './components/Hero'
import MenuCapsule from './components/MenuCapsule'
import PageLoader from './components/PageLoader'
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
    <IntroReadyProvider>
      <PageLoader />
      <main>
        <MenuCapsule />
        <Hero />
      </main>
    </IntroReadyProvider>
  )
}
