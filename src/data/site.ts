// ---------------------------------------------------------------------------
// All editable site content lives here. Swap placeholder media by dropping
// files into public/gallery/ and updating the `src` paths below.
// ---------------------------------------------------------------------------

export interface GalleryItem {
  id: string
  /** First-frame still: the video poster, and the fallback if playback fails. */
  src: string
  /** Full web-encoded clip — the drag-cards stage plays these end to end. */
  video: string
  /** First 15s of the same clip — the cover on the project deck's cards. */
  coverVideo: string
  alt: string
  label: string
  // Deck-card copy — placeholder wording, safe to rewrite.
  blurb: string
  views: string
  likes: string
  /** Full project name for the deck card; falls back to `label`. */
  name?: string
  year?: string
  /** GitHub repo URL. Omit → no Code pill on the card. */
  repo?: string
  /**
   * Path to the built demo under public/, e.g. '/demos/nova/'. Omit → the card
   * shows Code only. Declared here *and* verified at runtime against
   * public/demos/manifest.json, so a stale entry can't ship a dead link.
   * Add one with: node scripts/add-demo.mjs <id> <path-to-that-project>/dist
   */
  demo?: string
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

export const contactEmail = 'thedesk.studioo@gmail.com'

export const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Contact Us', href: '#contact' },
]

// The ten screen-recorded reels, web-encoded into public/Projects/web — see
// media-src/README.md for the sources and the ffmpeg recipe. `video` is the
// full clip the drag-cards stage plays; `coverVideo` is the same reel cut to
// its first 15s, which is what the project deck uses as a card cover.
//
// `repo` and `demo` are what make the deck cards in section 3 clickable: paste
// each project's GitHub URL into `repo`, and once you've copied that project's
// build in with scripts/add-demo.mjs, uncomment its `demo`. Both are optional —
// a card with neither just taps through to the gallery, as before.
export const galleryItems: GalleryItem[] = [
  {
    id: 'nova',
    src: '/Projects/web/1.jpg',
    video: '/Projects/web/1.mp4',
    coverVideo: '/Projects/web/1-cover.mp4',
    alt: 'Lumora studio site — scroll-revealed sections',
    label: 'Lumora',
    name: 'Lumora Studio',
    year: '2025',
    blurb: "Independent design and engineering studio — brands, products, and the systems that connect them.",
    views: '32k',
    likes: '52',
    repo: 'https://github.com/Mrpatra013/UI-1',
    demo: '/demos/nova/',
  },
  {
    id: 'atlas',
    src: '/Projects/web/2.jpg',
    video: '/Projects/web/2.mp4',
    coverVideo: '/Projects/web/2-cover.mp4',
    alt: 'SkyElite private jet charter site — parallax video hero',
    label: 'SkyElite',
    name: 'SkyElite',
    year: '2025',
    blurb: "Private jet charter sold on plain terms: fixed hourly rates, full fleet access, guaranteed aircraft in 8h.",
    views: '18k',
    likes: '41',
    repo: 'https://github.com/Mrpatra013/UI-2',
    demo: '/demos/atlas/',
  },
  {
    id: 'forge',
    src: '/Projects/web/3.jpg',
    video: '/Projects/web/3.mp4',
    coverVideo: '/Projects/web/3-cover.mp4',
    alt: 'Baseline tennis club site — programmes and facilities',
    label: 'Baseline',
    name: 'Baseline',
    year: '2024',
    blurb: "Members' tennis club and academy — programmes, facilities and coaching, with the pro-shop drops alongside.",
    views: '27k',
    likes: '63',
    repo: 'https://github.com/Mrpatra013/UI-3',
    demo: '/demos/forge/',
  },
  {
    id: 'pulse',
    src: '/Projects/web/4.jpg',
    video: '/Projects/web/4.mp4',
    coverVideo: '/Projects/web/4-cover.mp4',
    alt: 'AI platform landing page — WebGL field and bento grid',
    label: 'Reason',
    name: 'Built To Reason',
    year: '2024',
    blurb: "AI platform landing page: five composable layers, a bento capability grid, and a WebGL neural field behind the type.",
    views: '21k',
    likes: '38',
    repo: 'https://github.com/Mrpatra013/UI-12',
    demo: '/demos/pulse/',
  },
  {
    id: 'drift',
    src: '/Projects/web/5.jpg',
    video: '/Projects/web/5.mp4',
    coverVideo: '/Projects/web/5-cover.mp4',
    alt: 'Lumora Focus landing page — crossfading ambient films',
    label: 'Lumora Focus',
    name: 'Lumora Focus',
    blurb: "Focus-app landing where four ambient films crossfade behind the hero, and the type flips ink colour to stay legible.",
    views: '15k',
    likes: '29',
    repo: 'https://github.com/Mrpatra013/UI-5',
    demo: '/demos/drift/',
  },
  {
    id: 'rossi',
    src: '/Projects/web/6.jpg',
    video: '/Projects/web/6.mp4',
    coverVideo: '/Projects/web/6-cover.mp4',
    alt: 'prmpt archive collection — scroll-scrubbed video canvas',
    label: 'prmpt',
    name: 'prmpt',
    blurb: "Archive collection release — a scroll-scrubbed video canvas, custom cursor, and product type in blend-mode exclusion.",
    views: '24k',
    likes: '47',
    repo: 'https://github.com/Mrpatra013/UI-6',
    demo: '/demos/rossi/',
  },
  {
    id: 'vanta',
    src: '/Projects/web/7.jpg',
    video: '/Projects/web/7.mp4',
    coverVideo: '/Projects/web/7-cover.mp4',
    alt: 'securify data-privacy landing page — full-bleed video hero',
    label: 'securify',
    name: 'securify',
    blurb: "Data-privacy product landing: full-bleed video under three lines of display type, with usage stats floating over it.",
    views: '19k',
    likes: '35',
    repo: 'https://github.com/Mrpatra013/UI-7',
    demo: '/demos/vanta/',
  },
  {
    id: 'ember',
    src: '/Projects/web/8.jpg',
    video: '/Projects/web/8.mp4',
    coverVideo: '/Projects/web/8-cover.mp4',
    alt: 'Nora Kessler portfolio — cursor spotlight reveal',
    label: 'Nora Kessler',
    name: 'Nora Kessler',
    blurb: "Motion designer's portfolio — a splash intro, a cursor spotlight revealing a second hero, then work, about and journal.",
    views: '12k',
    likes: '26',
    repo: 'https://github.com/Mrpatra013/UI-8',
    demo: '/demos/ember/',
  },
  {
    id: 'halo',
    src: '/Projects/web/9.jpg',
    video: '/Projects/web/9.mp4',
    coverVideo: '/Projects/web/9-cover.mp4',
    alt: 'NeuralKinetics bionics site — dark sectioned scroll',
    label: 'NeuralKinetics',
    name: 'NeuralKinetics',
    blurb: "Neurotech landing page for advanced bionics and cognitive AI, pitched across a dark sectioned scroll.",
    views: '29k',
    likes: '58',
    repo: 'https://github.com/Mrpatra013/UI-9',
    demo: '/demos/halo/',
  },
  {
    id: 'orbit',
    src: '/Projects/web/10.jpg',
    video: '/Projects/web/10.mp4',
    coverVideo: '/Projects/web/10-cover.mp4',
    alt: 'LGPSM fashion storefront — wireframe globe and cart drawer',
    label: 'LGPSM',
    name: 'LGPSM',
    blurb: "Fashion editorial storefront with a wireframe globe, marquee dispatches and a working cart drawer at checkout.",
    views: '16k',
    likes: '31',
    repo: 'https://github.com/Mrpatra013/UI-10',
    demo: '/demos/orbit/',
  },
]

export const services: Service[] = [
  {
    id: '01',
    title: 'Ecommerce + Admin CRM',
    blurb: 'A storefront that sells around the clock, with one panel for orders, inventory and customers.',
  },
  {
    id: '02',
    title: 'Custom Websites',
    blurb: 'We can build custom websites in that way you dont really think of .Your personality shines through your website.',
  },
  {
    id: '03',
    title: 'Tech Solutions ',
    blurb: 'We love building softweare that solve specific problems and helpbusinesses work smarter.',
  },
  {
    id: '04',
    title: 'Modern UI/UX Design',
    blurb: 'Built around how people actually browse and buy — not just how it looks.',
  },
  {
    id: '05',
    title: 'Ratings & Reviews',
    blurb: 'Real reviews on every product, so the next buyer sees proof before they hesitate.',
  },
  {
    id: '06',
    title: 'High-Conversion UI',
    blurb: 'CTAs, layout and checkout tuned step by step until the drop-off stops.',
  },
  {
    id: '07',
    title: 'Customizable Tools',
    blurb: 'Booking systems, dashboards, calculators — shaped to your sales process, not a template.',
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
