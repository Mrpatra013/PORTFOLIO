// A draggable 3D sticker, reimplemented from the Framer "StickerDrag" module.
//
// The original renders in WebGL to get a peel/wave deformation; this is a DOM
// version that keeps the parts you actually feel: tilt driven by *drag
// velocity* (not cursor position), a motion-gated sheen, and a shadow that
// grows as the sticker lifts. Its tuning constants are the original's.
import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

// --- Tuning, taken from the source module ---------------------------------
const TILT_SENSITIVITY = 3;
const MAX_TILT_DEG = 30;
const TILT_SMOOTHING = 0.05;
const SHEEN_STRENGTH = 0.6;
const HOLO_BUMP = 0.15;
const HOLO_DECAY = 0.88;
const PERSPECTIVE = 800;

let zCounter = 30;
const nextZ = () => (zCounter += 1);

/**
 * Die-cut white border. There's no CSS "outline the alpha channel", so this
 * rings the shape with hard-edged white drop-shadows — each one takes the
 * previous result as input, so eight directions fill into a continuous border
 * that follows the silhouette exactly, the way 1.png has one baked in.
 */
function dieCut(radius: number) {
  return Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return `drop-shadow(${(Math.cos(a) * radius).toFixed(2)}px ${(Math.sin(a) * radius).toFixed(2)}px 0 #fff)`;
  }).join(" ");
}

export interface AlphaBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface StickerDragProps {
  src: string;
  alt: string;
  /**
   * Alpha bounds of the artwork inside the PNG, as fractions of the file.
   * The sources carry a lot of transparent padding (one is only 4% ink), so
   * the image is scaled and offset to crop to this box — that way every
   * sticker renders at a comparable visual size.
   */
  bbox?: AlphaBox;
  /** Aspect ratio (w/h) of the visible artwork. */
  aspect?: number;
  /** Width of the visible artwork in px. */
  width?: number;
  /** Resting rotation so it sits at a jaunty angle. */
  rotate?: number;
  /** Width of the white die-cut border, in px. */
  outline?: number;
  /** Fired the first time this sticker is picked up. */
  onGrab?: () => void;
  className?: string;
}

const FULL: AlphaBox = { x: 0, y: 0, w: 1, h: 1 };

export default function StickerDrag({
  src,
  alt,
  bbox = FULL,
  aspect = 1,
  width = 150,
  rotate = -9,
  outline = 4,
  onGrab,
  className = "",
}: StickerDragProps) {
  // A sticker whose PNG is missing should disappear, not leave alt text
  // floating over the layout.
  const [missing, setMissing] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const s = useRef({
    held: false,
    x: 0,
    y: 0,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    tiltX: 0,
    tiltY: 0,
    targetTiltX: 0,
    targetTiltY: 0,
    prevTiltX: 0,
    prevTiltY: 0,
    holo: 0,
    lastX: 0,
    lastY: 0,
    lastT: 0,
    reduced: false,
    lastLift: -1,
  });

  // Per-frame work is deliberately transform-and-opacity only. The die-cut
  // border is a chain of nine drop-shadows — sequential raster passes — so
  // rewriting `filter` each frame would invalidate that cached layer and
  // re-rasterise the whole chain every frame, for every sticker on screen.
  // The border lives on a child that is never rewritten, and the elevation
  // shadow on a wrapper that is only rewritten when the sticker is picked up
  // or dropped.
  const paint = useCallback(() => {
    const inner = innerRef.current;
    const sheen = sheenRef.current;
    if (!inner) return;
    const st = s.current;
    const lift = st.held ? 1 : 0;

    inner.style.transform =
      `translate3d(${st.x}px, ${st.y}px, 0) rotate(${rotate}deg) ` +
      `rotateX(${st.tiltX}deg) rotateY(${st.tiltY}deg) scale(${1 + lift * 0.06})`;

    if (lift !== st.lastLift) {
      st.lastLift = lift;
      const shadow = shadowRef.current;
      if (shadow) {
        shadow.style.filter = `drop-shadow(0 ${6 + lift * 16}px ${10 + lift * 18}px rgba(17,17,17,${0.22 + lift * 0.14}))`;
      }
    }

    if (sheen) {
      sheen.style.opacity = String(st.holo * SHEEN_STRENGTH);
      sheen.style.transform = `translateX(${st.tiltY * 1.6}%) translateY(${-st.tiltX * 1.6}%)`;
    }
  }, [rotate]);

  // Runs only while there's something to settle, then parks itself.
  const tick = useCallback(() => {
    const st = s.current;
    st.tiltX += (st.targetTiltX - st.tiltX) * TILT_SMOOTHING;
    st.tiltY += (st.targetTiltY - st.tiltY) * TILT_SMOOTHING;

    const delta =
      Math.abs(st.tiltX - st.prevTiltX) + Math.abs(st.tiltY - st.prevTiltY);
    st.holo = Math.min(1, st.holo + delta * HOLO_BUMP);
    if (!st.held) st.holo *= HOLO_DECAY;
    st.prevTiltX = st.tiltX;
    st.prevTiltY = st.tiltY;

    paint();

    const settled =
      !st.held &&
      Math.abs(st.tiltX) < 0.05 &&
      Math.abs(st.tiltY) < 0.05 &&
      st.holo < 0.01;
    if (settled) {
      st.tiltX = 0;
      st.tiltY = 0;
      st.holo = 0;
      paint();
      rafRef.current = null;
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [paint]);

  const wake = useCallback(() => {
    if (rafRef.current === null) rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => {
    s.current.reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    paint();
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [paint]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const st = s.current;
    const root = rootRef.current;
    if (!root) return;
    root.setPointerCapture(e.pointerId);
    root.style.zIndex = String(nextZ());
    onGrab?.();
    st.held = true;
    st.startX = e.clientX;
    st.startY = e.clientY;
    st.origX = st.x;
    st.origY = st.y;
    st.lastX = e.clientX;
    st.lastY = e.clientY;
    st.lastT = performance.now();
    wake();
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const st = s.current;
    if (!st.held) return;

    // Keep it inside its section — that section clips overflow, so an
    // unbounded drag would push the sticker out of sight for good.
    // Measured against the section's own rect rather than `offsetParent`, so a
    // sticker anchored to some small element (the CTA, say) still roams the
    // whole section instead of being trapped in its anchor's box. The root is
    // never transformed — the drag offset lives on the inner layer — so its
    // rect is the untranslated origin.
    const root = rootRef.current;
    const bounds = root?.closest("section");
    let x = st.origX + (e.clientX - st.startX);
    let y = st.origY + (e.clientY - st.startY);
    if (root && bounds) {
      const r = root.getBoundingClientRect();
      const b = bounds.getBoundingClientRect();
      x = Math.max(b.left - r.left, Math.min(x, b.right - r.right));
      y = Math.max(b.top - r.top, Math.min(y, b.bottom - r.bottom));
    }
    st.x = x;
    st.y = y;

    if (!st.reduced) {
      const now = performance.now();
      const dt = Math.max(1, now - st.lastT);
      // Normalised to ~60fps, exactly as the source module does.
      const velX = ((e.clientX - st.lastX) / dt) * 16;
      const velY = ((e.clientY - st.lastY) / dt) * 16;
      const clamp = (v: number) =>
        Math.max(-MAX_TILT_DEG, Math.min(MAX_TILT_DEG, v));
      st.targetTiltY = clamp(velX * TILT_SENSITIVITY);
      st.targetTiltX = clamp(-velY * TILT_SENSITIVITY);
      st.lastX = e.clientX;
      st.lastY = e.clientY;
      st.lastT = now;
    }
    wake();
  };

  const release = () => {
    const st = s.current;
    if (!st.held) return;
    st.held = false;
    st.targetTiltX = 0;
    st.targetTiltY = 0;
    wake();
  };

  if (missing) return null;

  // Scale the file up so its alpha box exactly fills the element, then offset
  // the artwork's origin to the element's corner.
  const height = width / aspect;
  const imgW = width / bbox.w;
  const imgH = height / bbox.h;
  const offsetX = -bbox.x * imgW;
  const offsetY = -bbox.y * imgH;

  return (
    <div
      ref={rootRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={release}
      onPointerCancel={release}
      style={{ perspective: PERSPECTIVE, width, height, touchAction: "none" }}
      className={`cursor-grab select-none active:cursor-grabbing ${className}`}
    >
      <div
        ref={innerRef}
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
        className="relative h-full w-full"
      >
        {/* Elevation shadow: rewritten only on press/release. */}
        <div ref={shadowRef} className="relative h-full w-full">
          {/* Die-cut border: written once at mount and never touched again, so the
          browser keeps the rasterised result cached across frames. */}
          <div
            style={{ filter: dieCut(outline) }}
            className="relative h-full w-full"
          >
            {/* No frame: the PNG's own die-cut silhouette is the sticker, and the
            drop-shadow on the parent follows that alpha shape. */}
            <div className="relative h-full w-full overflow-hidden">
              <img
                src={src}
                alt={alt}
                draggable={false}
                loading="lazy"
                decoding="async"
                onError={() => setMissing(true)}
                style={{
                  width: imgW,
                  height: imgH,
                  left: offsetX,
                  top: offsetY,
                }}
                className="pointer-events-none absolute max-w-none"
              />
              {/* Masked with the same artwork so the sheen hugs the silhouette
              instead of showing up as a rectangle. */}
              <div
                ref={sheenRef}
                aria-hidden="true"
                style={{
                  opacity: 0,
                  WebkitMaskImage: `url(${src})`,
                  maskImage: `url(${src})`,
                  WebkitMaskSize: `${imgW}px ${imgH}px`,
                  maskSize: `${imgW}px ${imgH}px`,
                  WebkitMaskPosition: `${offsetX}px ${offsetY}px`,
                  maskPosition: `${offsetX}px ${offsetY}px`,
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                }}
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.85)_44%,rgba(255,255,255,0.3)_56%,transparent_72%)]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
