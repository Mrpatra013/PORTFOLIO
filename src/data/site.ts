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

export interface ServiceGroup {
  heading: string
  items: string[]
  /** Muted styling — for "not included" style lists. */
  muted?: boolean
}

export interface Service {
  id: string
  title: string
  /** Short outcome label shown above the title, e.g. "Sell more". */
  tag: string
  blurb: string
  /** Everything below is revealed when the row is expanded. */
  details: {
    intro: string
    meta: { label: string; value: string }[]
    groups: ServiceGroup[]
    bestFor: string
    note?: string
  }
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
    title: 'Sales Leak Audit',
    tag: 'The way in',
    blurb: 'A recorded video review showing exactly where your website loses customers, and what to fix first.',
    details: {
      intro:
        'Every engagement starts here. I go through your website and the way you handle leads on a screen recording, so you can see exactly where customers slip away.',
      meta: [
        { label: 'Delivered in', value: '48 hours' },
        { label: 'Format', value: 'Video review' },
      ],
      groups: [
        {
          heading: 'What I review',
          items: [
            'Capture: does a visitor have a reason to leave their details?',
            'Respond: how fast does an enquiry get an answer?',
            'Follow up: what happens to people who don’t buy?',
            'Return: are past customers ever invited back?',
            'Speed and mobile: does the site load fast and work on a phone?',
          ],
        },
        {
          heading: 'What you get',
          items: [
            'A 10 to 15 minute screen-recorded walkthrough of your site',
            'Your biggest leaks, ranked by impact',
            'Three fixes you can make yourself this week',
            'A recommendation for which service fits, if any',
          ],
        },
      ],
      bestFor: 'Anyone who wants to know where their website is losing customers and time.',
      note: 'Send your website link by email or DM, or comment SYSTEM on any of my reels. No call needed.',
    },
  },
  {
    id: '02',
    title: 'Sales System Starter',
    tag: 'Get seen',
    blurb: 'A fast website that captures every lead, replies instantly and reminds the people who didn’t buy.',
    details: {
      intro:
        'A website that doesn’t just sit there. It catches every enquiry, answers it in seconds and follows up on its own. The fastest way to stop losing customers.',
      meta: [
        { label: 'Live in', value: '14 days' },
        { label: 'Support', value: '30 days' },
      ],
      groups: [
        {
          heading: 'What’s included',
          items: [
            'Website of up to 5 pages, mobile-first and fast',
            'Copy structure built around one clear offer',
            'Capture: enquiry or booking form, plus click-to-chat',
            'Respond: instant automated reply by email or WhatsApp',
            'Follow up: automatic reminder for leads who didn’t buy',
            'Every lead sent straight to your inbox or phone',
            'Basic analytics so you can see what’s working',
            'Walkthrough video and 30 days of support',
          ],
        },
        {
          heading: 'Not included',
          muted: true,
          items: [
            'The Return job (reorder and win-back flows)',
            'Online store or product catalogue',
            'Pages beyond five',
            'Custom apps or internal tools',
          ],
        },
      ],
      bestFor:
        'Cafes, local real estate agents, service businesses and new brands that need a site that works from day one.',
      note: 'Upgrade to the Full Sales System anytime. Nothing you’ve built is wasted.',
    },
  },
  {
    id: '03',
    title: 'Full Sales System',
    tag: 'Sell more',
    blurb: 'A website or store with all four jobs built in: capture, respond, follow up and bring buyers back.',
    details: {
      intro:
        'The complete system. Visitors become buyers, and buyers keep coming back, without you chasing every one of them by hand.',
      meta: [
        { label: 'Live in', value: '3 to 4 weeks' },
        { label: 'Support', value: '60 days' },
      ],
      groups: [
        {
          heading: 'The four jobs',
          items: [
            'Capture: lead magnets, first-order offers, smart forms, pop-ups and click-to-chat on every key page',
            'Respond: instant replies by email and WhatsApp, booking confirmations and answers to common questions',
            'Follow up: multi-step email sequences, abandoned enquiry and cart reminders, and check-ins that bring back the maybes',
            'Return: thank-you flows, review requests, reorder reminders and win-back offers for past customers',
          ],
        },
        {
          heading: 'Also included',
          items: [
            'Website or store of up to 10 pages',
            'A simple lead dashboard or CRM setup',
            'Analytics and conversion tracking',
            'Walkthrough videos for you and your team',
            '60 days of support after launch',
            'First month of Growth Care included',
          ],
        },
      ],
      bestFor:
        'Online product brands, real estate teams and businesses ready to turn their site into a full sales engine.',
    },
  },
  {
    id: '04',
    title: 'Business Automation',
    tag: 'Work less',
    blurb: 'Custom tools and workflows that take the repetitive work off your team’s plate.',
    details: {
      intro:
        'Custom software that handles the repetitive work inside your business, built around how your team already works rather than forcing a new process on them.',
      meta: [
        { label: 'Timeline', value: '2 to 4 weeks' },
        { label: 'Built around', value: 'Your workflow' },
      ],
      groups: [
        {
          heading: 'What I build',
          items: [
            'Internal dashboards for your team',
            'Order and inventory tracking',
            'Automatic reports, delivered on schedule',
            'Client onboarding flows',
            'Lead routing to the right person, instantly',
          ],
        },
        {
          heading: 'Tools I connect',
          items: [
            'Forms and spreadsheets',
            'Your CRM',
            'Email and messaging',
            'Payments',
            'AI and workflow automation where it saves real hours',
          ],
        },
      ],
      bestFor:
        'Teams losing hours to manual work, spreadsheets and copy-paste. Agencies that want onboarding and proposals on autopilot.',
    },
  },
  {
    id: '05',
    title: 'Custom Web & Mobile Apps',
    tag: 'Build the product',
    blurb: 'Products, portals and platforms built from scratch, from a startup MVP to a customer portal.',
    details: {
      intro:
        'When a website isn’t enough. I design and build full products, scoped together on a discovery call so you know exactly what you’re getting before work begins.',
      meta: [
        { label: 'Timeline', value: '4 to 10 weeks' },
        { label: 'Stack', value: 'Next.js · React · Supabase' },
      ],
      groups: [
        {
          heading: 'What I build',
          items: [
            'MVPs for startups ready to launch',
            'Booking and ordering apps',
            'Client portals',
            'Membership platforms',
            'Admin panels and internal dashboards',
          ],
        },
        {
          heading: 'How it works',
          items: [
            'Discovery call to agree goals and scope',
            'Fixed scope and launch date in writing',
            'Progress update every few days',
            'Walkthrough video at launch',
            'You own the code, data and logins',
          ],
        },
      ],
      bestFor:
        'Startups that need a product shipped, and established businesses that need a portal or platform for their customers.',
    },
  },
  {
    id: '06',
    title: 'Growth Care',
    tag: 'Keep it working',
    blurb: 'Your site and systems looked after and improved every month, so they keep working while you run the business.',
    details: {
      intro:
        'Launch is the start, not the finish. Growth Care keeps everything running, monitored and getting better month after month.',
      meta: [
        { label: 'Billing', value: 'Monthly' },
        { label: 'Notice', value: '30 days to cancel' },
      ],
      groups: [
        {
          heading: 'Every month',
          items: [
            'Hosting, updates and security',
            'Monitoring every automation',
            'Monthly improvements and tests',
            'A short monthly report',
          ],
        },
      ],
      bestFor: 'Anyone who wants their site and systems running and improving without thinking about it.',
    },
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
