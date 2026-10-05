// *palabras* en sections[].text = marcador lima.
// Archivos con hash del contenido en el nombre (nombre.hash.ext): al sustituir uno,
// renómbralo con su nuevo hash para que ninguna caché mezcle versiones.
// El poster de un vídeo es SU PRIMER FOTOGRAMA (ffmpeg -frames:v 1): si no, al
// empezar a reproducirse la imagen salta del poster al fotograma 0.
// Imágenes en /public/projects/ (vertical, ~4:5). `video` opcional (usa `image` como poster).
export const projects = [
  {
    slug: 'beside',
    title: 'Beside',
    year: 2026, // confirmar
    status: 'MVP', // confirmar
    tags: 'macOS App · Product Design · AI',
    image: '/projects/beside-poster.86d4f9a3.jpg',
    video: '/projects/beside.e7d541b9.mp4',
    // Sin dominio todavía: la fila Web no sale.
    role: 'Product design, development',
    tools: ['Swift', 'SwiftUI', 'Claude API', 'Supabase', 'Figma'], // confirmar
    intro:
      'A macOS app that keeps everything you are working on organised in modes, with an AI that knows each one inside out.',
    sections: [
      {
        heading: 'One mode for each thing',
        text: 'A personal project, a round of *sending out CVs* with the files you need at hand, a *subject you are studying*. Each lives in its own mode, so every one stays organised *independently* of the rest.',
      },
      {
        heading: 'An AI with the whole context',
        text: 'The assistant knows *everything inside the mode* you are in, so it can *answer, create, edit or delete* content for you, without you explaining it all again.',
      },
      {
        heading: 'Specialised agents',
        text: 'Behind it, *agents built for specific tasks* help you go deeper on exactly what you want to focus on.',
      },
    ],
  },
  {
    slug: 'mockp',
    title: 'Mockp',
    year: 2026, // CV: Jul 2026 – presente
    status: 'In development', // confirmar
    tags: 'Web Platform · Product Design · Front-end',
    image: '/projects/mockp.4838e38a.jpg',
    url: 'https://mockp.com',
    role: 'Product design, full-stack development (personal project)',
    tools: ['React', 'TypeScript', 'Vite', 'Supabase', 'Stripe'],
    intro: 'A Pinterest of mockups: anyone can browse, design and download their own high-quality mockups. Free, for everyone.',
    sections: [
      {
        heading: 'A catalogue, not a template pack',
        text: 'The idea was a huge catalogue, big enough that every user can *define their own style* as precisely as they want, finding *the scene that fits their work* instead of settling for the one that is close enough.',
      },
      {
        heading: 'Browse, design, download',
        text: 'Discover mockups the way you browse a moodboard, open one, drop your design in and *download it at full quality*. *No paywall* in front of the work.',
      },
      {
        heading: 'Built on',
        text: 'A *React + Vite* front-end, *Supabase* as the backend and *Stripe* as the payment gateway.',
      },
    ],
  },
  {
    slug: 'dakubo',
    title: 'Dakubo',
    year: 2026, // confirmar
    status: 'Live', // confirmar
    tags: 'Agency Website · Branding · Motion',
    image: '/projects/dakubo-poster.6096a958.jpg',
    video: '/projects/dakubo.d8e2aa7d.mp4',
    url: 'https://dakubo.com',
    role: 'Logo, interface design, motion design, development',
    // tools: [...]: pendiente: la fila Stack sale cuando exista
    intro:
      'The website of Dakubo, a studio that designs and builds websites and apps: its work, what it does, and a built-in budget calculator.',
    sections: [
      {
        heading: 'A portfolio for the studio',
        text: 'The *projects* up front, the services explained without jargon, and a *built-in budget calculator* so a client can price their idea before writing a single email.',
      },
      {
        heading: 'One pair of hands',
        text: 'The *logo*, the *interface*, the *motion design* and the *code*. Designed, programmed and shipped by me, from the first sketch to production.',
      },
    ],
  },
]

export const site = {
  name: 'Adrián García',
  role: 'Front-end Developer & Designer',
  // *palabra* = subrayada con el marcador lima
  bio: 'Front-end developer with a background in *product design*. I build interfaces caring as much about the *technical implementation* as about the *experience* of the people who end up using them.',
  now: 'mockp', // "Now building …": slug del proyecto en curso
  city: 'Valencia',
  timeZone: 'Europe/Madrid',
  email: 'hello.adrian.gar@gmail.com',
  nav: [
    { label: 'Work', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: 'mailto:hello.adrian.gar@gmail.com' },
  ],
}
