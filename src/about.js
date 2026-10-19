// Contenido del About, sacado del CV. *palabras* = marcador lima.
export const about = {
  title: 'Front-end developer with a background in product design.',
  lead: 'I build interfaces caring as much about the *technical implementation* as about the *experience* of the people who end up using them.',
  facts: [
    { label: 'Based in', value: 'Manises, Valencia' },
    { label: 'Languages', value: 'Spanish (native), Valencian (C1), English (B2)' },
  ],
  skills: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'HTML', 'CSS', 'Java', 'Supabase', 'Git/GitHub', 'Figma', 'UX/UI design'],
  education: [
    {
      dates: '2026 – Now',
      place: 'Universitat Oberta de Catalunya',
      role: 'BSc Computer Engineering',
      note: 'Studying alongside professional work in product design.',
    },
    {
      dates: '2024 – 2026',
      place: 'IES Álvaro Falomir',
      role: 'Higher Diploma in Multiplatform App Development (DAM)',
    },
  ],
  certificates: [
    { place: 'Google', role: 'Google UX Design Certificate', note: 'In progress · 4 of 8 courses · 130 h' },
    { place: 'IBM', role: 'UX Design Fundamentals', note: '12 h' },
    { place: 'Anthropic', role: 'Claude 101', note: '3 h' },
  ],
  // Traducción (i18n.js): lo que no esté aquí sale en inglés.
  es: {
    title: 'Desarrollador front-end con formación en diseño de producto.',
    lead: 'Construyo interfaces cuidando tanto la *implementación técnica* como la *experiencia* de las personas que acaban usándolas.',
    facts: [
      { label: 'Vivo en' },
      { label: 'Idiomas', value: 'Español (nativo), valenciano (C1), inglés (B2)' },
    ],
    skills: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'HTML', 'CSS', 'Java', 'Supabase', 'Git/GitHub', 'Figma', 'Diseño UX/UI'],
    education: [
      {
        dates: '2026 – Actualidad',
        role: 'Grado en Ingeniería Informática',
        note: 'Lo compagino con mi trabajo profesional en diseño de producto.',
      },
      { role: 'CFGS en Desarrollo de Aplicaciones Multiplataforma (DAM)' },
    ],
    certificates: [
      { role: 'Certificado de Diseño UX de Google', note: 'En curso · 4 de 8 cursos · 130 h' },
      {},
      {},
    ],
  },
}
