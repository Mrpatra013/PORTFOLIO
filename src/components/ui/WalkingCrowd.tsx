import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * Walking crowd of "Open Peeps" characters, ported from adxy/minima's crowd.js
 * (canvas + GSAP sprite-sheet animation). Peeps walk across the bottom edge
 * of the canvas in both directions at random speeds/depths.
 * Sprite sheet: public/open-peeps-sheet.avif (15 cols x 7 rows).
 */
const CONFIG = {
  src: '/open-peeps-sheet.avif',
  rows: 15,
  cols: 7,
}

const randomRange = (min: number, max: number) => min + Math.random() * (max - min)
const randomIndex = (array: unknown[]) => randomRange(0, array.length) | 0
const removeFromArray = <T,>(array: T[], i: number) => array.splice(i, 1)[0]
const removeItemFromArray = <T,>(array: T[], item: T) => removeFromArray(array, array.indexOf(item))
const removeRandomFromArray = <T,>(array: T[]) => removeFromArray(array, randomIndex(array))

type Stage = { width: number; height: number }

class Peep {
  image: HTMLImageElement
  rect: [number, number, number, number]
  width = 0
  height = 0
  drawArgs: [HTMLImageElement, number, number, number, number, number, number, number, number]
  x = 0
  y = 0
  anchorY = 0
  scaleX = 1
  walk: gsap.core.Timeline | null = null

  constructor(image: HTMLImageElement, rect: [number, number, number, number]) {
    this.image = image
    this.rect = rect
    this.width = rect[2]
    this.height = rect[3]
    this.drawArgs = [image, ...rect, 0, 0, this.width, this.height]
  }

  render(ctx: CanvasRenderingContext2D) {
    let scaleY = 1
    if (ctx.canvas.clientWidth < 768) scaleY = 0.5
    if (ctx.canvas.clientWidth < 480) scaleY = 0.35

    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.scale(this.scaleX, scaleY)
    ctx.drawImage(...this.drawArgs)
    ctx.restore()
  }
}

const resetPeep = (stage: Stage, peep: Peep) => {
  let offsetVarA = 100
  let offsetVarB = 250
  let scaleX = 1

  if (window.innerWidth < 768) {
    offsetVarA = 200
    offsetVarB = 150
    scaleX = 0.5
  }
  if (window.innerWidth < 480) {
    offsetVarA = 240
    offsetVarB = 100
    scaleX = 0.35
  }

  const direction = Math.random() > 0.5 ? 1 : -1
  // ease skews random toward lower values to help hide that peeps have no legs
  const offsetY = offsetVarA - offsetVarB * gsap.parseEase('power2.in')(Math.random())
  const startY = stage.height - peep.height + offsetY
  let startX: number
  let endX: number

  if (direction === 1) {
    startX = -peep.width
    endX = stage.width
    peep.scaleX = scaleX
  } else {
    startX = stage.width + peep.width
    endX = 0
    peep.scaleX = -1 * scaleX
  }

  peep.x = startX
  peep.y = startY
  peep.anchorY = startY

  return { startX, startY, endX }
}

const normalWalk = (peep: Peep, props: { startY: number; endX: number }) => {
  const { startY, endX } = props
  const xDuration = 10
  const yDuration = 0.25

  const tl = gsap.timeline()
  tl.timeScale(randomRange(0.5, 1.5))
  tl.to(peep, { duration: xDuration, x: endX, ease: 'none' }, 0)
  tl.to(peep, { duration: yDuration, repeat: xDuration / yDuration, yoyo: true, y: startY - 10 }, 0)

  return tl
}

export default function WalkingCrowd({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const stage: Stage = { width: 0, height: 0 }
    const allPeeps: Peep[] = []
    const availablePeeps: Peep[] = []
    const crowd: Peep[] = []
    let destroyed = false

    const img = document.createElement('img')

    const createPeeps = () => {
      const { rows, cols } = CONFIG
      const { naturalWidth: width, naturalHeight: height } = img
      const total = rows * cols
      const rectWidth = width / rows
      const rectHeight = height / cols

      for (let i = 0; i < total; i++) {
        allPeeps.push(
          new Peep(img, [
            (i % rows) * rectWidth,
            ((i / rows) | 0) * rectHeight,
            rectWidth,
            rectHeight,
          ])
        )
      }
    }

    const removePeepFromCrowd = (peep: Peep) => {
      removeItemFromArray(crowd, peep)
      availablePeeps.push(peep)
    }

    const addPeepToCrowd = () => {
      const peep = removeRandomFromArray(availablePeeps)
      const walk = normalWalk(peep, resetPeep(stage, peep)).eventCallback('onComplete', () => {
        removePeepFromCrowd(peep)
        addPeepToCrowd()
      })

      peep.walk = walk
      crowd.push(peep)
      crowd.sort((a, b) => a.anchorY - b.anchorY)

      return peep
    }

    const initCrowd = () => {
      // random tween progress spreads the peeps out across the stage
      while (availablePeeps.length) addPeepToCrowd().walk!.progress(Math.random())
    }

    const resize = () => {
      stage.width = canvas.clientWidth
      stage.height = canvas.clientHeight
      canvas.width = stage.width * devicePixelRatio
      canvas.height = stage.height * devicePixelRatio

      crowd.forEach((peep) => peep.walk?.kill())
      crowd.length = 0
      availablePeeps.length = 0
      availablePeeps.push(...allPeeps)

      initCrowd()
    }

    const render = () => {
      canvas.width = canvas.width // eslint-disable-line no-self-assign -- clears the canvas
      ctx.save()
      ctx.scale(devicePixelRatio, devicePixelRatio)
      crowd.forEach((peep) => peep.render(ctx))
      ctx.restore()
    }

    img.onload = () => {
      if (destroyed) return
      createPeeps()
      resize()
      gsap.ticker.add(render)
      window.addEventListener('resize', resize)
    }
    img.src = CONFIG.src

    return () => {
      destroyed = true
      img.onload = null
      gsap.ticker.remove(render)
      window.removeEventListener('resize', resize)
      crowd.forEach((peep) => peep.walk?.kill())
    }
  }, [])

  return (
    <div aria-hidden="true" className={`pointer-events-none ${className}`}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
