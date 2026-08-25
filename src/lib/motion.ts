// House animation vocabulary — matches the hero's intro animations.
export const EASE = [0.22, 1, 0.36, 1] as const

// Spread onto a motion element for the standard scroll-in reveal.
// Stagger items with: transition={{ ...revealProps.transition, delay: i * 0.08 }}
export const revealProps = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-10% 0px -10% 0px' },
  transition: { duration: 0.7, ease: EASE },
} as const
