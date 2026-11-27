// Edit this file to make the portfolio yours. Everything on the page comes from here.

export const profile = {
  name: 'Shuhari Alaihim Amoran',
  role: 'Full-Stack Developer',
  tagline: 'I build things that work on screens, in 3D, and in the real world.',
  bio: 'A student developer who likes taking an idea from database to pixels. I built an AR campus navigation app for my university and I am always looking for the next thing to break and rebuild better.',
  location: 'Koronadal City, Philippines',
  /** Short availability line shown in the hero with a green dot. Empty hides it. */
  status: 'Open to internships',
  /** A square photo in public/, e.g. 'me.webp'. Empty shows initials instead. */
  photo: '',
  /** Three proof points under the hero. */
  stats: [
    { n: '1', k: 'AR app shipped' },
    { n: '60', k: 'campus routes walked' },
    { n: '4', k: 'student-org roles' },
  ],
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

export type Project = {
  title: string
  kind: string
  blurb: string
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
    blurb:
      'An augmented-reality campus tour and navigation app for Notre Dame of Marbel University. Follow gold AR arrows along routes surveyed on foot, take a narrated campus tour, search a building directory, and point the camera at printed markers to see 3D models.',
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
      { label: 'Live site', href: 'https://explorendmu.github.io/' },
    ],
  },
  {
    title: 'Project Two',
    draft: true,
    kind: 'Web · Full-stack',
    blurb: 'Replace this with a web project: what it does, who it is for, and the one hard problem you solved.',
    tags: ['React', 'Node.js', 'PostgreSQL'],
    links: [
      { label: 'Live', href: '#' },
      { label: 'Code', href: '#' },
    ],
  },
  {
    title: 'Project Three',
    draft: true,
    kind: 'API · Backend',
    blurb: 'Another project. Keep it to two sentences and link to the live demo.',
    tags: ['TypeScript', 'Express', 'Docker'],
    links: [{ label: 'Code', href: '#' }],
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
  features: [
    { title: 'AR arrows on real routes', body: 'Arrows are placed on paths the team walked and recorded, not guessed from a map.' },
    { title: 'A voice for every turn', body: 'Turn left, turn right and you have arrived are spoken, so you can keep your eyes up.' },
    { title: 'Narrated campus tour', body: 'A guided walk from your gate through the main stops, with a pin and an introduction at each.' },
    { title: 'Building directory', body: '42 places with photos, schedules and services, each linked to its route.' },
    { title: 'AR marker models', body: 'Three campus statues appear as 3D models on printed markers.' },
    { title: 'Works with no signal', body: 'Routes, place cards and voice lines live on the phone. Nothing is downloaded mid-walk.' },
  ],
  how: [
    {
      title: 'Once, before the app ships',
      steps: [
        { t: 'Walk the real paths', d: 'The team walked the campus with NDMU Walker, a recorder app built for the project that logs GPS and the AR camera’s path.' },
        { t: 'Join the walks', d: 'A desktop tool joins the walks at marked doors and junctions, then finds the shortest way between any two places with Dijkstra’s algorithm.' },
        { t: 'Pack it in', d: 'Routes, place cards and voice lines are saved as files inside the app.' },
      ],
    },
    {
      title: 'Every walk, on the phone',
      steps: [
        { t: 'Find the start', d: 'GPS gives the starting point; the app averages several fixes and won’t start more than 20 m from the route.' },
        { t: 'Lead the way', d: 'Google ARCore tracks each step through the camera. Your position is matched to the route and arrows are placed on the walkway ahead.' },
        { t: 'Arrive', d: 'A gold pin marks the place, the voice says you have arrived, and the place card opens.' },
      ],
    },
  ],
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
