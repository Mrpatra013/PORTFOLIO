// The card cover used by both the drag-cards stage and the project deck.
//
// Ten covers are on screen at once in each section, so nothing here is allowed
// to be eager: the clips carry `preload="metadata"` and only start decoding
// once an IntersectionObserver says the card is actually on screen. Scrolling
// past a section pauses its ten decoders again.
import { useEffect, useRef, useState } from 'react'

interface CoverMediaProps {
  /** Web-encoded mp4. Omit to render the still (or the placeholder) instead. */
  video?: string
  /** First-frame still. Doubles as the video's poster and the no-video image. */
  poster?: string
  alt: string
  /** Wordmark shown when neither the clip nor the still can load. */
  label: string
  /** Applied to the wrapper — each deck supplies its own corner radius. */
  className?: string
  /** Tailwind size classes for the fallback wordmark. */
  labelClassName?: string
}

export default function CoverMedia({
  video,
  poster,
  alt,
  label,
  className = '',
  labelClassName = 'text-xl',
}: CoverMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)

  // A failed load is otherwise sticky for the life of the component: the card
  // would keep showing the placeholder even after the clip it points at became
  // available. That is exactly what happens under HMR while the encodes are
  // still being written — the src arrives before the file does. Clearing the
  // flag whenever the source changes lets the next render try again.
  useEffect(() => setFailed(false), [video, poster])

  useEffect(() => {
    const el = videoRef.current
    if (!el || failed) return
    // React writes `muted` as a DOM property and not as an attribute, which
    // some browsers miss when they run the autoplay-policy check. Setting it
    // here too is what keeps unattended playback from being refused outright.
    el.muted = true
    // Reduced motion keeps the poster frame — the clips are ambient, so there
    // is nothing lost by holding them still.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Autoplay can still be refused (low-power mode, per-page video
          // limits); the poster stays up in that case, so swallow the reject.
          void el.play().catch(() => {})
        } else {
          el.pause()
        }
      },
      { threshold: 0.01 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [failed])

  return (
    <div className={`pointer-events-none relative aspect-video overflow-hidden bg-[#141414] ${className}`}>
      {failed || (!video && !poster) ? (
        <div
          role="img"
          aria-label={alt}
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1c1c1c] via-[#242424] to-[#0f0f0f]"
        >
          <span aria-hidden="true" className={`font-black uppercase tracking-tight text-white/10 ${labelClassName}`}>
            {label.split(' ')[0]}
          </span>
        </div>
      ) : video ? (
        <video
          ref={videoRef}
          src={video}
          poster={poster}
          aria-label={alt}
          muted
          loop
          playsInline
          preload="metadata"
          disableRemotePlayback
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <img
          src={poster}
          alt={alt}
          draggable={false}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  )
}
