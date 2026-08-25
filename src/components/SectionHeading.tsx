import { motion } from 'framer-motion'
import { revealProps } from '../lib/motion'
import { cn } from '../lib/utils'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  accent?: string
  dark?: boolean
  className?: string
  /** Override the default display size, e.g. to free up vertical room. */
  titleClassName?: string
  /** Colour of the second line; defaults to the orange brand accent. */
  accentClassName?: string
}

/** Hero-scale section heading: eyebrow + stacked font-black uppercase title. */
export default function SectionHeading({
  eyebrow,
  title,
  accent,
  dark = true,
  className,
  titleClassName,
  accentClassName = 'text-accent',
}: SectionHeadingProps) {
  return (
    <motion.div {...revealProps} className={className}>
      {eyebrow && (
        <p
          className={cn(
            'mb-4 text-[11px] font-bold uppercase tracking-[0.1em]',
            dark ? 'text-white/60' : 'text-[#4a4a4a]',
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          'font-black uppercase leading-[0.9] tracking-tight',
          'text-[13vw] sm:text-[9vw] lg:text-[5.5vw]',
          dark ? 'text-white' : 'text-[#111]',
          titleClassName,
        )}
      >
        <span className="block">{title}</span>
        {accent && <span className={cn('block', accentClassName)}>{accent}</span>}
      </h2>
    </motion.div>
  )
}
