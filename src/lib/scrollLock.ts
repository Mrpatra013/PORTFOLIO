import type Lenis from 'lenis'

let lenisInstance: Lenis | null = null
let lockCount = 0

export function setLenisInstance(instance: Lenis | null) {
  lenisInstance = instance
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
