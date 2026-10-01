// Imágenes en /public/projects/ (vertical, ~4:5). `video` opcional (usa `image` como poster).
export const projects = [
  {
    slug: 'beside',
    title: 'Beside',
    year: 2026, // confirmar
    tags: 'Mac App · Product Design · AI',
    image: '/projects/beside-poster.jpg',
    video: '/projects/beside.mp4',
    url: 'https://beside.app',
    role: 'Product design, front-end', // confirmar
    tools: ['Swift', 'SwiftUI', 'Claude API', 'Supabase', 'Figma'],
    intro:
      'A Mac app that keeps the files, notes and links of what you are working on at the edge of your screen — always at hand, never in the way.',
    sections: [
      {
        heading: 'The desktop is wide. The work is not.',
        text: 'The sides of a Mac screen sit empty. Beside puts your project there — files, notes and links at hand, and an assistant that knows them all.',
      },
      {
        heading: 'Built around the project',
        text: "A designer with a client's work in flight has it all a glance away: the brief, the assets, the last version, the things still to answer. Designed and built from the idea to the App Store — the interface, the panel, the AI with the project's context in hand, and the site that sells it.",
      },
    ],
  },
  {
    slug: 'mockp',
    title: 'Mockp',
    year: 2026, // CV: Jul 2026 – presente
    tags: 'Web Platform · Product Design · Front-end',
    image: '/projects/mockp.jpg',
    url: 'https://mockp.com',
    role: 'Product design, full-stack development (personal project)',
    tools: ['React', 'TypeScript', 'Vite', 'Supabase', 'Stripe'],
    intro: 'A Pinterest of mockups: anyone can browse, design and download their own high-quality mockups — free, for everyone.',
    sections: [
      {
        heading: 'A catalogue, not a template pack',
        text: 'The idea was a huge catalogue, big enough that every user can define their own style as precisely as they want — finding the scene that fits their work instead of settling for the one that is close enough.',
      },
      {
        heading: 'Browse, design, download',
        text: 'Discover mockups the way you browse a moodboard, open one, drop your design in and download it at full quality. No paywall in front of the work.',
      },
      {
        heading: 'Built on',
        text: 'A React + Vite front-end, Supabase as the backend and Stripe as the payment gateway.',
      },
    ],
  },
]

export const site = {
  name: 'Adrián García',
  role: 'Front-end Developer & Designer',
  // *palabra* = subrayada con el marcador lima
  bio: 'Front-end developer with a background in *product design*. I build interfaces caring as much about the *technical implementation* as about the *experience* of the people who end up using them.',
  now: 'mockp', // "Now — building …": slug del proyecto en curso
  city: 'Valencia',
  timeZone: 'Europe/Madrid',
  email: 'hello.adrian.gar@gmail.com',
  nav: [
    { label: 'Work', href: '/' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: 'mailto:hello.adrian.gar@gmail.com' },
  ],
}
