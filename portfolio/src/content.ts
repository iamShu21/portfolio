// Edit this file to make the portfolio yours. Everything on the page comes from here.

export const profile = {
  name: 'Shuhari Alaihim Amoran',
  role: 'Aspiring Software Developer',
  tagline: 'I build things that work on screens, in 3D, and in the real world.',
  bio: 'IT student at Notre Dame of Marbel University. I build full-stack web apps and desktop systems, and with my capstone team I built an AR guide for our campus. I like owning a feature from the database to the last pixel.',
  /** Where you live. (School is in Koronadal City; that's on the education entry.) */
  location: 'Esperanza, Sultan Kudarat, Philippines',
  /** Short availability line shown in the hero with a green dot. Empty hides it. */
  status: 'Open to commissions',
  /** A square photo in public/ (me.webp is cropped from the CV). Empty shows initials instead. */
  photo: 'me.webp',
  // Leave email, linkedin or facebook empty ('') to hide them on the page.
  email: 'shuharidalandas@gmail.com',
  github: 'https://github.com/iamShu21',
  linkedin: 'https://www.linkedin.com/in/shuhari-alaihim-amoran-792918414/',
  facebook: 'https://www.facebook.com/shuhari.dalandas.9',
  /**
   * CV shown in a dialog, with a PDF to download. Files live in public/cv/. This copy leaves out
   * the phone number, birth date and home address. Set `cv: null` to hide the CV buttons.
   */
  cv: { image: 'cv/shuhari-amoran-cv.webp', pdf: 'cv/Shuhari-Amoran-CV.pdf', w: 1415, h: 1820 } as {
    image: string
    pdf: string
    w: number
    h: number
  } | null,
}

/** The About section. A draft from the CV and the repos: make it sound like you. */
export const about = {
  paragraphs: [
    "I'm Shuhari, an aspiring software developer from Esperanza, Sultan Kudarat, studying Information Technology at Notre Dame of Marbel University in Koronadal City. I like the whole path of an app: the database tables, the API in the middle, and the screen someone actually taps.",
    'So far that has meant a payment portal where students pay their school fees through GCash, Maya or card, a point-of-sale system for the desktop in Java, and, with my capstone team, an AR guide that walks people across our campus.',
    "Outside class I've held a student-org role every year since 2023: batch representative and auditor for PSITS, and representative for the Muslim Students Organization.",
    "I'm open to commissions: if you need a web app, a desktop system or a tool for your school, organisation or business, I'd like to hear about it.",
  ],
  facts: [
    { k: 'studying', v: 'BS Information Technology, NDMU, 2023 to now' },
    { k: 'lives in', v: 'Esperanza, Sultan Kudarat (UTC+8)' },
    { k: 'builds', v: 'Web apps, desktop systems, mobile and AR' },
    { k: 'open to', v: 'Commissions: web apps and desktop systems' },
  ],
}

export type Project = {
  title: string
  kind: string
  year: string
  blurb: string
  /** What you built, one line each. Concrete beats clever. */
  highlights?: string[]
  tags: string[]
  featured?: boolean
  /** Optional cover image in public/. */
  image?: { src: string; w: number; h: number; alt: string }
  /** Drafts stay in this file but aren't shown. Remove `draft` to publish a card. */
  draft?: boolean
  links: { label: string; href: string }[]
}

export const projects: Project[] = [
  {
    title: 'ExploreNDMU',
    kind: 'AR · Android · Capstone',
    year: '2026',
    blurb:
      'An augmented-reality campus tour and navigation app for Notre Dame of Marbel University. Gold AR arrows lead you along routes the team surveyed on foot, with a narrated tour, a building directory and 3D models on printed markers.',
    highlights: [
      'Full-stack developer in a team of three',
      '60 walks recorded on campus, joined into 1,194 routes with Dijkstra’s algorithm',
      'Works with no signal: routes, place cards and voice lines live on the phone',
    ],
    tags: ['Unity 6', 'C#', 'AR Foundation', 'ARCore', 'Android'],
    featured: true,
    image: {
      src: 'projects/explorendmu/follow-cam.webp',
      w: 960,
      h: 540,
      alt: 'A student walks under a covered campus walkway holding up a tablet that shows gold AR arrows on the path ahead',
    },
    links: [
      { label: 'Case study ↓', href: '#explorendmu' },
      { label: 'Showcase site', href: 'https://explorendmu.github.io/' },
    ],
  },
  {
    title: 'SSG Payment System',
    kind: 'Web · Full-stack · Class project',
    year: '2026',
    blurb:
      'A payment portal designed for NDMU’s Supreme Student Government. Moderators set up fees and officers, students pay online and track what they owe, and officers review payments and issue receipts.',
    highlights: [
      'Online checkout through PayMongo: GCash, Maya or card',
      'Three roles (moderator, officer, student) behind JWT login, each with its own dashboard',
      'Express REST API on MySQL with SQL migrations, audit logs, reports and yearly receipt numbers',
      'PDF receipts, payment history, notifications, and light and dark themes',
    ],
    tags: ['React', 'Tailwind', 'Express', 'MySQL', 'JWT', 'PayMongo'],
    image: {
      src: 'projects/ssg-payment/portal.webp',
      w: 1280,
      h: 668,
      alt: 'The SSG Payment Portal sign-in page: a login form beside cards for verified payments, role-based access and a step-by-step payment guide',
    },
    links: [{ label: 'Code', href: 'https://github.com/iamShu21/ssg-payment-system' }],
  },
  {
    title: 'Point-of-Sale System',
    kind: 'Desktop · Java',
    year: '2026',
    blurb:
      'A desktop point-of-sale app: ring up sales at the register and manage products, categories, inventory, suppliers and staff accounts, with reports and sales history, all on MySQL.',
    highlights: [
      'A register with a cart, running totals, automatic change and receipts',
      '11 screens, from the dashboard to reports, sales history and a login history',
      'A custom Swing UI kit: glass panels, gradient and neon buttons, rounded inputs',
      'Rebuilt from my first version with a redesigned interface and more modules',
    ],
    tags: ['Java', 'Swing', 'MySQL', 'JDBC', 'NetBeans'],
    links: [{ label: 'Code', href: 'https://github.com/iamShu21/final-pos-system' }],
  },
]

/* ---------- ExploreNDMU case study ---------- */
// Numbers and wording follow the project's showcase site (explorendmu.github.io), which takes them
// from the team's own route data. Images and clips live in public/projects/explorendmu/.

export type Shot = {
  /** File name without extension: `<file>.webp` is the poster, `<file>.mp4` the clip. */
  file: string
  title: string
  caption: string
  alt: string
  w: number
  h: number
}

export const explorendmu = {
  lead: 'An Android AR app that walks you across the Notre Dame of Marbel University campus. Gold arrows lie on the real walkway, a voice calls every turn, and each place has a card with its schedule and services.',
  role: 'Full-stack developer in a team of three',
  team: 'Capstone, BS Information Technology, 2026. With Ben Raffy Herradura (research, field mapping, 3D modelling) and Edward Villanueva (research, field mapping).',
  links: [
    { label: 'Showcase site', href: 'https://explorendmu.github.io/' },
    { label: 'Download APK', href: 'https://github.com/explorendmu/explorendmu.github.io/releases/latest/download/ExploreNDMU.apk' },
    { label: 'Site source', href: 'https://github.com/explorendmu/explorendmu.github.io' },
  ],
  stats: [
    { n: '37', k: 'places with AR routes' },
    { n: '60', k: 'routes walked on foot' },
    { n: '42', k: 'places in the directory' },
    { n: '3', k: 'statues to scan in 3D' },
  ],
  shots: [
    { file: 'follow-cam', title: 'Beside the walker', caption: 'Holding the screen up under the covered walkway, on the way to the Library.', alt: 'A person walks under a covered walkway holding a tablet; gold arrows show on its screen', w: 960, h: 540 },
    { file: 'follow-screen', title: 'Follow the arrows', caption: 'Gold chevrons placed on the walkway ahead, 66 m from the Library.', alt: 'App screen recording: gold chevrons on a covered walkway and the prompt Follow the arrows, about 66 m to go', w: 540, h: 864 },
    { file: 'arrive', title: 'You have arrived', caption: 'At the end of the route the place card opens in AR, with hours and services.', alt: 'App screen: You have arrived, with the University Library card floating in AR showing its schedule and services', w: 540, h: 864 },
    { file: 'directory', title: 'Building directory', caption: 'Every place has a card. Navigate here starts the route.', alt: 'App screen: the University Library place card with a photo, description and a Navigate here button', w: 540, h: 864 },
    { file: 'tour-stop', title: 'Narrated campus tour', caption: 'Stop 6 of 8. A gold pin marks each stop and the voice introduces it.', alt: 'App screen: a gold AR pin over the floor at the Business Office, stop 6 of 8 of the campus tour', w: 540, h: 864 },
    { file: 'scan-champagnat', title: 'AR marker models', caption: 'Point the camera at a printed marker and a 3D statue stands on it.', alt: 'App screen: a 3D statue of St. Marcellin Champagnat standing on a printed marker on a desk', w: 540, h: 864 },
  ] satisfies Shot[],
  notes: [
    { t: 'A start that waits for a good fix', d: 'GPS on campus drifts by metres, so accurate fixes are trusted more than poor ones.' },
    { t: 'Tested at a desk first', d: 'A simulated walker follows each route at walking pace with GPS noise, so the logic is checked before anyone steps outside.' },
    { t: '1,194 routes from 60 walks', d: 'Joining the recorded walks at 39 junctions turns 60 walks into 1,194 routes between places.' },
  ],
}

/** Skills, grouped (Stack section). Edit freely. */
export const skills = {
  frontend: {
    title: 'Frontend',
    blurb: 'Interfaces that feel fast and a little playful. This site: React, Tailwind and plain web APIs, no UI kit.',
    items: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Astro', 'HTML5', 'CSS3', 'Tailwind', 'Three.js'],
  },
  xr: {
    title: '3D, AR & mobile',
    blurb: 'Unity and AR Foundation on Android: GPS-surveyed routes, AR arrows and marker-tracked models. Mapping in QGIS, models in Blender.',
    items: ['Unity', 'C#', 'AR Foundation', 'ARCore', 'Android', 'Flutter', 'Blender', 'QGIS'],
    link: { label: 'See ExploreNDMU ↓', href: '#explorendmu' },
  },
  backend: {
    title: 'Backend & data',
    blurb: 'APIs and the databases behind the pixels.',
    items: ['Node.js', 'Express.js', 'Laravel', 'Java', 'C++', 'Python', 'REST', 'MySQL', 'PostgreSQL', 'SQLite', 'Oracle'],
  },
  shipping: {
    title: 'Shipping',
    blurb: 'Version control, reproducible builds and deploys.',
    items: ['Git', 'GitHub', 'GitHub Pages', 'Vercel', 'Docker'],
  },
  learning: {
    title: 'Currently learning',
    blurb: 'React Three Fiber: shaders, scissor views and keeping 3D at 60 fps on phones.',
  },
}

/* ---------- Journey (from the CV) ---------- */
// Years are school years: a role "2024 – 2025" runs from 2024 to 2025 on the timeline.

export type School = {
  title: string
  org: string
  from: number
  /** null = still studying. */
  to: number | null
  detail?: string
  /** Things worth knowing about this stretch, one line each. */
  notes?: string[]
}

export const education: School[] = [
  {
    title: 'BS Information Technology',
    org: 'Notre Dame of Marbel University',
    from: 2023,
    to: null,
    detail: 'Koronadal City',
    notes: ['Capstone: ExploreNDMU, an AR campus navigation app (2026)', 'Class project: SSG Payment System, a fee portal with online checkout (2026)'],
  },
  { title: 'Senior High School', org: 'Notre Dame of Esperanza Inc.', from: 2021, to: 2023, detail: 'STEM strand' },
]

/** Shown as one quiet line under Education. */
export const earlierSchooling = [
  { title: 'Junior high', org: 'Notre Dame of Esperanza Inc.', from: 2017, to: 2021 },
  { title: 'Primary', org: 'Esperanza Elementary School', from: 2010, to: 2017 },
]

export type Org = {
  /** Short name for the timeline lane. */
  short: string
  name: string
  where: string
  roles: { title: string; from: number; to: number }[]
}

/** Student organisations, roles oldest first. */
export const leadership: Org[] = [
  {
    short: 'PSITS',
    name: 'Philippine Society of Information Technology Students',
    where: 'NDMU',
    roles: [
      { title: 'Batch Representative', from: 2023, to: 2024 },
      { title: 'Auditor', from: 2024, to: 2025 },
      { title: 'Batch Representative', from: 2025, to: 2026 },
    ],
  },
  {
    short: 'MSO',
    name: 'Muslim Students Organization',
    where: 'NDMU',
    roles: [{ title: 'Representative', from: 2024, to: 2025 }],
  },
]

/* ---------- Now strip (hero) ---------- */

export const now = {
  timeZone: 'Asia/Manila',
  city: 'Esperanza',
  learning: 'React Three Fiber shaders',
  /** What you're probably doing, by local hour. Each entry starts at `from` (0–23). */
  moods: [
    { from: 0, text: 'probably asleep. or debugging.' },
    { from: 5, text: 'early start, coffee and docs' },
    { from: 9, text: 'in class or shipping something' },
    { from: 12, text: 'lunch break' },
    { from: 13, text: 'building and breaking things' },
    { from: 18, text: 'dinner, then back to the editor' },
    { from: 21, text: 'late-night coding session' },
  ],
}

/* ---------- "Where to?" wayfinder (⌘K) ---------- */

/** Canned answers. `keywords` help the search find them. Keep answers short and true. */
export const answers = [
  {
    q: 'Are you open to commissions?',
    keywords: 'hire freelance commission work project job available client',
    a: `Yes. I take commissions for web apps, desktop systems and similar projects. Tell me what you need and when you need it; email is the fastest way to reach me: ${profile.email}.`,
  },
  {
    q: 'Where are you based?',
    keywords: 'location city country timezone',
    a: 'I live in Esperanza, Sultan Kudarat, and study at Notre Dame of Marbel University in Koronadal City. Both are on Philippine time (UTC+8), the clock in the strip at the top of the page.',
  },
  {
    q: 'What have you built?',
    keywords: 'projects work portfolio apps',
    a: 'Three projects so far: SSG Payment System, a full-stack payment portal (React, Express, MySQL, PayMongo); a point-of-sale desktop app in Java with MySQL; and ExploreNDMU, our capstone AR campus guide for Android. All three are in the projects section.',
  },
  {
    q: 'What is ExploreNDMU?',
    keywords: 'ar app capstone campus navigation',
    a: explorendmu.lead,
  },
  {
    q: 'What did you do on ExploreNDMU?',
    keywords: 'role team capstone contribution',
    a: `${explorendmu.role}. ${explorendmu.team}`,
  },
  {
    q: 'What is your main stack?',
    keywords: 'skills tech languages frameworks',
    a: 'Web: TypeScript, React, Next.js, Node.js and Laravel with MySQL. Mobile and AR: Unity, C#, AR Foundation and ARCore on Android. The stack section has the full list.',
  },
  {
    q: 'How was this site built?',
    keywords: 'portfolio react tailwind vite source',
    a: 'React 19, Tailwind CSS 4 and Vite, with no UI kit and no animation library: native <dialog>, CSS scroll-driven animations and SVG. Press X (or pick x-ray here) to see how each part is built and what the page cost your browser.',
  },
]

/* ---------- AR walk ("Walk to NDMU") ---------- */

/** Where the AR arrows point. Coordinates from OpenStreetMap; the campus is about 400 m across. */
export const ar = {
  target: { lat: 6.4955421, lon: 124.8412859, name: 'Notre Dame of Marbel University', short: 'NDMU' },
  /** Closer than this counts as "You have arrived". */
  arriveKm: 0.3,
}

/* ---------- Hero stats (counted from the content above, so they stay true) ---------- */

const shown = projects.filter((p) => !p.draft)
const tools = new Set(Object.values(skills).flatMap((g) => ('items' in g ? g.items : [])))

export const heroStats = [
  { n: String(shown.length), k: 'apps built: web, desktop, AR' },
  { n: String(leadership.flatMap((o) => o.roles).length), k: 'student-org roles' },
  { n: `${tools.size}`, k: 'languages and tools' },
]
