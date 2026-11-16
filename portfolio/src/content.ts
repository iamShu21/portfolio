// Edit this file to make the portfolio yours. Everything on the page comes from here.

export const profile = {
  name: 'Your Name',
  role: 'Full-Stack Developer',
  tagline: 'I build things that work on screens, in 3D, and in the real world.',
  bio: 'A student developer who likes taking an idea from database to pixels. I built an AR campus navigation app for my university and I am always looking for the next thing to break and rebuild better.',
  location: 'Koronadal City, Philippines',
  email: 'you@example.com',
  github: 'https://github.com/your-username',
  linkedin: 'https://linkedin.com/in/your-username',
}

export type Project = {
  title: string
  kind: string
  blurb: string
  tags: string[]
  featured?: boolean
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
    links: [{ label: 'Source', href: 'https://github.com/your-username/ExploreNDMU' }],
  },
  {
    title: 'Project Two',
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
    kind: 'API · Backend',
    blurb: 'Another project. Keep it to two sentences and link to the live demo.',
    tags: ['TypeScript', 'Express', 'Docker'],
    links: [{ label: 'Code', href: '#' }],
  },
]

export const stack = [
  'React',
  'TypeScript',
  'Node.js',
  'PostgreSQL',
  'Three.js',
  'Unity',
  'C#',
  'Tailwind',
  'Git',
  'Docker',
  'REST',
  'Python',
]

export const facts = [
  { k: 'Focus', v: 'Full-stack web + 3D/AR' },
  { k: 'Status', v: 'Student, open to internships' },
  { k: 'Shipped', v: 'ExploreNDMU (Android AR app)' },
  { k: 'Currently', v: 'Learning React Three Fiber' },
]
