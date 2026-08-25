import { useState } from 'react'
import { cn } from '../lib/utils'

interface MediaTileProps {
  src: string
  alt: string
  label?: string
  className?: string
}

/**
 * A media slot for gallery/project GIFs. While the file is missing (or the
 * `src` is empty) it renders a branded placeholder, so the layout looks
 * intentional before real assets are dropped into public/gallery/.
 */
export default function MediaTile({ src, alt, label, className }: MediaTileProps) {
  const [failed, setFailed] = useState(false)
  const showMedia = src !== '' && !failed

  return (
    <div className={cn('relative overflow-hidden rounded-2xl bg-[#141414]', className)}>
      {showMedia ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1c1c1c] via-[#242424] to-[#0f0f0f]"
        >
          <span
            aria-hidden="true"
            className="select-none text-5xl font-black uppercase tracking-tight text-white/10 md:text-7xl"
          >
            {label ?? 'GIF'}
          </span>
          <span
            aria-hidden="true"
            className="absolute bottom-4 right-4 h-2.5 w-2.5 rounded-full bg-accent"
          />
        </div>
      )}
    </div>
  )
}
