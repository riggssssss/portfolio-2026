import { useSyncExternalStore } from 'react'

// English and Spanish. The content stays written in English; anything with an
// `es` beside it (a project, a version of it, About, the site) shows that in
// Spanish, field by field, and whatever has no translation keeps the English.
// English by default. Spanish when asked for: ?lang=es (links in a Spanish
// CV) or the visitor's last choice.
const KEY = 'lang'
const known = (l) => (l === 'en' || l === 'es' ? l : null)

const first = () => {
  const asked = known(new URLSearchParams(location.search).get('lang'))
  let saved = null
  try {
    if (asked) localStorage.setItem(KEY, asked)
    saved = known(localStorage.getItem(KEY))
  } catch {}
  return asked || saved || 'en'
}

let lang = first()
document.documentElement.lang = lang
const subs = new Set()

const set = (next) => {
  lang = next
  document.documentElement.lang = next
  try {
    localStorage.setItem(KEY, next)
  } catch {}
  subs.forEach((f) => f())
}

export const useLang = () =>
  useSyncExternalStore(
    (f) => (subs.add(f), () => subs.delete(f)),
    () => lang
  )

// The page's words fade out, change while unseen, and fade back (styles.css,
// html.lang-out). Reduced motion swaps them at once.
const OUT = 220 // ms, matches the fade
export function switchLang(next) {
  if (next === lang) return
  const root = document.documentElement
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return set(next)
  root.classList.add('lang-out')
  setTimeout(() => {
    set(next)
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('lang-out')))
  }, OUT)
}

// `es` over the English, field by field. Lists of entries (sections, notes,
// shots) merge entry by entry; any other value is replaced.
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
function merge(base, over) {
  if (over === undefined) return base
  if (Array.isArray(base) && Array.isArray(over) && base.every(isObj) && over.every(isObj))
    return over.map((o, i) => merge(base[i] ?? {}, o))
  if (isObj(base) && isObj(over)) {
    const out = { ...base }
    for (const k in over) out[k] = merge(base[k], over[k])
    return out
  }
  return over
}
export const localize = (o, l) => (l === 'es' && o?.es ? merge(o, o.es) : o)

// The interface's own words.
export const ui = {
  en: {
    by: 'by',
    nowBuilding: 'Now building',
    all: 'All',
    filter: 'Filter the work',
    main: 'Main',
    work: 'Work',
    language: 'Language',
    year: 'Year',
    status: 'Status',
    role: 'Role',
    stack: 'Stack',
    web: 'Web',
    next: 'Next project',
    back: 'Back to the work',
    about: 'About',
    email: 'Email',
    skills: 'Skills',
    education: 'Education',
    certificates: 'Certificates',
    sayHello: 'Say hello',
    nfTitle: 'Not found',
    nfHead: 'Nothing here.',
    nfLead: "doesn't exist. It may have moved, or never been.",
    nfBack: 'Back to the work',
    nfOr: 'Or straight to',
    or: 'or',
  },
  es: {
    by: 'por',
    nowBuilding: 'Ahora con',
    all: 'Todo',
    filter: 'Filtrar el trabajo',
    main: 'Principal',
    work: 'Proyectos',
    language: 'Idioma',
    year: 'Año',
    status: 'Estado',
    role: 'Rol',
    stack: 'Stack',
    web: 'Web',
    next: 'Siguiente proyecto',
    back: 'Volver al trabajo',
    about: 'Sobre mí',
    email: 'Email',
    skills: 'Habilidades',
    education: 'Formación',
    certificates: 'Certificados',
    sayHello: 'Escríbeme',
    nfTitle: 'No encontrado',
    nfHead: 'Aquí no hay nada.',
    nfLead: 'no existe. Puede que se haya movido, o que nunca haya existido.',
    nfBack: 'Volver al trabajo',
    nfOr: 'O directamente a',
    or: 'o',
  },
}

export const useT = () => ui[useLang()]
