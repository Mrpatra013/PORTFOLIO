// ---------------------------------------------------------------------------
// All editable site content lives here. Swap placeholder media by dropping
// files into public/gallery/ and updating the `src` paths below.
// ---------------------------------------------------------------------------

export interface GalleryItem {
  id: string
  src: string // e.g. '/gallery/nova-commerce.gif' — empty string renders a placeholder
  alt: string
  label: string
  // Deck-card copy — placeholder wording, safe to rewrite.
  blurb: string
  views: string
  likes: string
}

export interface Project {
  id: string
  name: string
  tags: string[]
  year: string
  href: string // live project URL
  src: string // stock image for now — swap for real project shots
  alt: string
}

export interface Service {
  id: string
  title: string
  blurb: string
}

export interface Testimonial {
  text: string
  name: string
  role: string
}

export interface Social {
  label: string
  href: string
}

export const contactEmail = 'hello@thedesk.studio'

export const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Contact Us', href: '#contact' },
]

// Stock images for now — swap each src for '/gallery/<name>.gif' once real GIFs land.
export const galleryItems: GalleryItem[] = [
  { id: 'nova', src: 'https://picsum.photos/seed/g-nova/1280/720', alt: 'Nova Commerce storefront animation', label: 'Nova', blurb: "Headless storefront rebuilt for speed — checkout in three taps.", views: '32k', likes: '52' },
  { id: 'atlas', src: 'https://picsum.photos/seed/g-atlas/1280/720', alt: 'Atlas CRM dashboard walkthrough', label: 'Atlas', blurb: "Internal CRM shaped around how the sales team actually works.", views: '18k', likes: '41' },
  { id: 'forge', src: 'https://picsum.photos/seed/g-forge/1280/720', alt: 'Forge Studio brand site motion reel', label: 'Forge', blurb: "Brand system and motion reel for a studio that hates templates.", views: '27k', likes: '63' },
  { id: 'pulse', src: 'https://picsum.photos/seed/g-pulse/1280/720', alt: 'Pulse Analytics data views', label: 'Pulse', blurb: "Analytics dashboard that makes a week of data readable at once.", views: '21k', likes: '38' },
  { id: 'drift', src: 'https://picsum.photos/seed/g-drift/1280/720', alt: 'Driftware marketing site scroll', label: 'Drift', blurb: "Marketing site with scroll storytelling and sub-second loads.", views: '15k', likes: '29' },
  { id: 'rossi', src: 'https://picsum.photos/seed/g-rossi/1280/720', alt: 'Studio Rossi portfolio interactions', label: 'Rossi', blurb: "Portfolio with tactile interactions and an editorial backbone.", views: '24k', likes: '47' },
  { id: 'vanta', src: 'https://picsum.photos/seed/g-vanta/1280/720', alt: 'Vanta landing page motion design', label: 'Vanta', blurb: "Landing page built to convert — one idea, one call to action.", views: '19k', likes: '35' },
  { id: 'ember', src: 'https://picsum.photos/seed/g-ember/1280/720', alt: 'Ember booking flow walkthrough', label: 'Ember', blurb: "Booking flow rebuilt from scratch; drop-off cut by half.", views: '12k', likes: '26' },
  { id: 'halo', src: 'https://picsum.photos/seed/g-halo/1280/720', alt: 'Halo SaaS dashboard tour', label: 'Halo', blurb: "SaaS product tour that explains the whole thing in one scroll.", views: '29k', likes: '58' },
  { id: 'orbit', src: 'https://picsum.photos/seed/g-orbit/1280/720', alt: 'Orbit product site scroll animations', label: 'Orbit', blurb: "Product site where every scroll frame earns its place.", views: '16k', likes: '31' },
]

export const projects: Project[] = [
  {
    id: 'nova-commerce',
    name: 'Nova Commerce',
    tags: ['E-commerce', 'UI Design', 'Webflow'],
    year: '2025',
    href: '#',
    src: 'https://picsum.photos/seed/nova-commerce/900/1200',
    alt: 'Nova Commerce storefront',
  },
  {
    id: 'atlas-crm',
    name: 'Atlas CRM',
    tags: ['Custom CRM', 'React', 'Dashboard'],
    year: '2025',
    href: '#',
    src: 'https://picsum.photos/seed/atlas-crm/900/1200',
    alt: 'Atlas CRM dashboard',
  },
  {
    id: 'forge-studio',
    name: 'Forge Studio',
    tags: ['Branding', 'Website', 'Motion'],
    year: '2024',
    href: '#',
    src: 'https://picsum.photos/seed/forge-studio/900/1200',
    alt: 'Forge Studio brand site',
  },
  {
    id: 'pulse-analytics',
    name: 'Pulse Analytics',
    tags: ['SaaS', 'UI/UX', 'SEO'],
    year: '2024',
    href: '#',
    src: 'https://picsum.photos/seed/pulse-analytics/900/1200',
    alt: 'Pulse Analytics product site',
  },
]

export const services: Service[] = [
  {
    id: '01',
    title: 'Website Development',
    blurb: "Fast, responsive, pixel-perfect builds that don't flinch on any device.",
  },
  {
    id: '02',
    title: 'Modern UI Design',
    blurb: 'Interfaces with a point of view. Bold type, sharp motion, zero clutter.',
  },
  {
    id: '03',
    title: 'Customized CRM & Tools',
    blurb: 'Internal tools shaped around how your team actually works.',
  },
  {
    id: '04',
    title: 'SEO-Optimized Code',
    blurb: 'Clean, semantic, lighthouse-green code that search engines love.',
  },
  {
    id: '05',
    title: 'Performance & Speed',
    blurb: 'Sub-second loads and rankings that climb. Speed is a feature.',
  },
  {
    id: '06',
    title: 'Ongoing Support',
    blurb: "We don't ship and vanish. We iterate, maintain, and improve.",
  },
]

export const testimonials: Testimonial[] = [
  {
    text: 'They rebuilt our site in three weeks and doubled our conversion rate. Not average. Not even close.',
    name: 'Maya Chen',
    role: 'Founder, Novaline',
  },
  {
    text: 'The first agency that pushed back on our ideas — and was right every time.',
    name: 'Daniel Okafor',
    role: 'CEO, Forge Labs',
  },
  {
    text: 'Our CRM finally works the way we think. Custom-built, zero bloat.',
    name: 'Sara Lindqvist',
    role: 'Marketing Lead, Pulse',
  },
  {
    text: 'Fast, opinionated, and obsessed with detail. The site flies.',
    name: 'Arjun Mehta',
    role: 'Product Manager, Atlas',
  },
  {
    text: 'Bold design without the ego. They listen, then they level you up.',
    name: 'Elena Rossi',
    role: 'Founder, Studio Rossi',
  },
  {
    text: 'Clean code, real SEO gains, and a team that actually answers Slack.',
    name: 'Tom Becker',
    role: 'CTO, Driftware',
  },
]

// Die-cut sticker art in public/Stickers. `bbox` is each PNG's measured alpha
// bounding box (fractions of the file) and `aspect` the artwork's own ratio —
// the files carry a lot of transparent padding (7.png is only 3% ink), so the
// component crops to these to render every sticker at a comparable size.
// Re-measure if you replace a file; stale numbers crop the wrong region.
export interface Sticker {
  id: string
  src: string
  alt: string
  bbox: { x: number; y: number; w: number; h: number }
  aspect: number
}

export const stickers: Sticker[] = [
  {
    id: 'thinking',
    src: '/Stickers/1.png',
    alt: 'Thinking… speech-bubble sticker',
    bbox: { x: 0.084, y: 0.292, w: 0.832, h: 0.412 },
    aspect: 2.019,
  },
  {
    id: 'bang',
    src: '/Stickers/2.png',
    alt: 'Red exclamation mark sticker',
    bbox: { x: 0.398, y: 0.24, w: 0.204, h: 0.562 },
    aspect: 0.363,
  },
  {
    id: 'spark',
    src: '/Stickers/3.png',
    alt: 'Yellow sparkle burst sticker',
    bbox: { x: 0.286, y: 0.088, w: 0.602, h: 0.78 },
    aspect: 0.772,
  },
  {
    id: 'smiley',
    src: '/Stickers/4.png',
    alt: 'Pixel-art yellow smiley face sticker',
    bbox: { x: 0.1713, y: 0.1806, w: 0.6551, h: 0.6597 },
    aspect: 0.993,
  },
  {
    id: 'tentacle',
    src: '/Stickers/5.png',
    alt: 'Purple octopus tentacle sticker',
    bbox: { x: 0.1671, y: 0.0952, w: 0.6729, h: 0.9048 },
    aspect: 0.538,
  },
  {
    id: 'dude',
    src: '/Stickers/6.png',
    alt: '"Dude." speech-bubble patch sticker',
    bbox: { x: 0.236, y: 0.344, w: 0.53, h: 0.316 },
    aspect: 1.677,
  },
  {
    id: 'arrow',
    src: '/Stickers/7.png',
    alt: 'Yellow dashed curved arrow',
    bbox: { x: 0.2881, y: 0.1441, w: 0.411, h: 0.7415 },
    aspect: 0.554,
  },
  {
    id: 'haha',
    src: '/Stickers/8.png',
    alt: '"Haha" embroidered blue speech-bubble patch',
    bbox: { x: 0.016, y: 0.276, w: 0.966, h: 0.424 },
    aspect: 2.278,
  },
  {
    id: 'keepitup',
    src: '/Stickers/9.png',
    alt: '"Keep it up" yellow speech-box sticker',
    bbox: { x: 0.2126, y: 0.3829, w: 0.5512, h: 0.3422 },
    aspect: 1.667,
  },
  {
    id: 'cursor',
    src: '/Stickers/11.png',
    alt: 'Pixel-art cursor arrow sticker',
    bbox: { x: 0.356, y: 0.25, w: 0.29, h: 0.502 },
    aspect: 0.578,
  },
  {
    id: 'goodday',
    src: '/Stickers/12.png',
    alt: '"Have a good day" yellow ticket sticker',
    bbox: { x: 0.196, y: 0.266, w: 0.654, h: 0.446 },
    aspect: 1.466,
  },
]

export const socials: Social[] = [
  { label: 'Twitter / X', href: '#' },
  { label: 'Instagram', href: '#' },
  { label: 'LinkedIn', href: '#' },
  { label: 'Dribbble', href: '#' },
]
