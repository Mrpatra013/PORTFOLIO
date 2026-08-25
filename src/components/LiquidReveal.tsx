import { useEffect, useRef, useState } from 'react'

const ASSET_BASE = '/hero'
// baseSrc = always-visible base layer (the LCP image)
const BASE_SRC = `${ASSET_BASE}/before.jpg`
// revealSrc = revealed under the cursor brush
const REVEAL_SRC = `${ASSET_BASE}/after.jpg`

const BRUSH_RADIUS = 143 // CSS px
const DECAY = 0.016 // per frame
const FADE_FRAMES = 120
const IDLE_RAMP = 0.004
const IDLE_RAMP_CAP = 0.5
const GRADIENT_STOPS: [number, string][] = [
  [0, 'rgba(255,255,255,1)'],
  [0.55, 'rgba(255,255,255,0.82)'],
  [1, 'rgba(255,255,255,0)'],
]

interface Point {
  x: number
  y: number
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  if (!img.naturalWidth || !img.naturalHeight) return
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
  const dw = img.naturalWidth * scale
  const dh = img.naturalHeight * scale
  const dx = (w - dw) / 2
  const dy = (h - dh) / 2
  ctx.clearRect(0, 0, w, h)
  ctx.drawImage(img, dx, dy, dw, dh)
}

export default function LiquidReveal() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [reducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const radius = BRUSH_RADIUS * dpr
    const diam = Math.ceil(radius * 2)
    const c = radius

    const coverCanvas = document.createElement('canvas')
    const coverCtx = coverCanvas.getContext('2d')!
    const brushCanvas = document.createElement('canvas')
    brushCanvas.width = diam
    brushCanvas.height = diam
    const brushCtx = brushCanvas.getContext('2d')!

    let canvasW = 0
    let canvasH = 0
    let imgLoaded = false

    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      imgLoaded = true
      if (canvasW && canvasH) drawCover(coverCtx, img, canvasW, canvasH)
    }
    img.src = REVEAL_SRC

    const resize = () => {
      const rect = container.getBoundingClientRect()
      canvasW = Math.max(1, Math.round(rect.width * dpr))
      canvasH = Math.max(1, Math.round(rect.height * dpr))
      canvas.width = canvasW
      canvas.height = canvasH
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      coverCanvas.width = canvasW
      coverCanvas.height = canvasH
      if (imgLoaded) drawCover(coverCtx, img, canvasW, canvasH)
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(container)

    let points: Point[] = []
    let last: Point | null = null

    // The hero stays pinned under the gallery sheet, so once the page has
    // scrolled ~one viewport it is fully covered — stop all canvas work then.
    const isCovered = () => window.scrollY >= window.innerHeight * 0.98
    let wasCovered = false

    const onPointerMove = (e: PointerEvent) => {
      if (isCovered()) {
        last = null
        return
      }
      const rect = container.getBoundingClientRect()
      const x = (e.clientX - rect.left) * dpr
      const y = (e.clientY - rect.top) * dpr

      if (x < -radius || x > canvasW + radius || y < -radius || y > canvasH + radius) {
        last = null
        return
      }

      if (last) {
        const dx = x - last.x
        const dy = y - last.y
        const dist = Math.hypot(dx, dy)
        const step = Math.max(radius * 0.3, 1)
        const n = Math.min(Math.ceil(dist / step), 60)
        for (let i = 1; i <= n; i++) {
          const t = i / n
          points.push({ x: last.x + dx * t, y: last.y + dy * t })
        }
      } else {
        points.push({ x, y })
      }
      last = { x, y }
    }
    window.addEventListener('pointermove', onPointerMove)

    const stamp = (x: number, y: number) => {
      brushCtx.clearRect(0, 0, diam, diam)
      brushCtx.globalCompositeOperation = 'source-over'
      const gradient = brushCtx.createRadialGradient(diam / 2, diam / 2, 0, diam / 2, diam / 2, radius)
      for (const [offset, color] of GRADIENT_STOPS) gradient.addColorStop(offset, color)
      brushCtx.fillStyle = gradient
      brushCtx.fillRect(0, 0, diam, diam)

      brushCtx.globalCompositeOperation = 'source-in'
      brushCtx.drawImage(coverCanvas, x - c, y - c, diam, diam, 0, 0, diam, diam)

      ctx.globalCompositeOperation = 'source-over'
      ctx.drawImage(brushCanvas, x - c, y - c)
    }

    let idle = 0
    let rafId = 0

    const tick = () => {
      if (isCovered()) {
        if (!wasCovered) {
          wasCovered = true
          points = []
          last = null
          idle = FADE_FRAMES + 1
          ctx.clearRect(0, 0, canvasW, canvasH)
        }
        rafId = requestAnimationFrame(tick)
        return
      }
      wasCovered = false

      const drawing = points.length > 0
      if (drawing) {
        idle = 0
      } else {
        idle++
      }

      if (idle > FADE_FRAMES) {
        rafId = requestAnimationFrame(tick)
        return
      }

      const fade = drawing ? DECAY : Math.min(DECAY + idle * IDLE_RAMP, IDLE_RAMP_CAP)
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = `rgba(0,0,0,${fade})`
      ctx.fillRect(0, 0, canvasW, canvasH)

      if (drawing) {
        for (const p of points) stamp(p.x, p.y)
        points = []
      }

      if (idle === FADE_FRAMES) {
        ctx.clearRect(0, 0, canvasW, canvasH)
      }

      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('pointermove', onPointerMove)
      ro.disconnect()
    }
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden">
      <img
        src={BASE_SRC}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        decoding="async"
      />
      {!reducedMotion && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
      )}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(to bottom, rgba(255,255,255,.35), transparent, rgba(255,255,255,.35))',
        }}
      />
    </div>
  )
}
