import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import About from './About.jsx'
import Carousel from './Carousel.jsx'
import Project from './Project.jsx'
import NotFound from './NotFound.jsx'
import { syncBarHeight } from './bar.js'
import { createHang } from './hang.js'
import { marked } from './marked.jsx'
import { categories, projects, site } from './projects.js'
import { localize, switchLang, useLang, useT } from './i18n.js'

const fromPath = () => {
  const slug = location.pathname.match(/^\/proyecto\/([^/]+)/)?.[1]
  const i = projects.findIndex((p) => p.slug === slug)
  return i < 0 ? null : i
}
const isAbout = () => location.pathname === '/about'
// Each project with its index in `projects`; the filter shows a subset of them.
const all = projects.map((p, i) => ({ ...p, i }))
const filters = [{ key: 'all' }, ...categories.filter((c) => all.some((p) => p.category?.includes(c.key)))]
// Anything that isn't the home, About or a project that exists.
const isMissing = () => !/^\/?$/.test(location.pathname) && !isAbout() && fromPath() == null
// The filter lives in the address (?as=product), on the home and on a project
// opened from it, so a reload, back and forward, or a shared link show the
// same version of the work.
const lensFromUrl = () => {
  const as = new URLSearchParams(location.search).get('as')
  return filters.some((f) => f.key === as) ? as : 'all'
}
const withLens = (path, f) => (f && f !== 'all' ? `${path}?as=${f}` : path)

// EN / ES, words like the filter: the current one pressed harder.
function Lang({ leaving }) {
  const lang = useLang()
  return (
    <span className={leaving ? 'lang is-leaving' : 'lang'} role="group" aria-label={useT().language}>
      {['en', 'es'].map((l) => (
        <button key={l} type="button" lang={l} aria-pressed={lang === l} onClick={() => switchLang(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </span>
  )
}

// The corner of the bar: the language.
function Corner({ leaving }) {
  return (
    <span className="corner">
      <Lang leaving={leaving} />
    </span>
  )
}

export default function App() {
  const [missing] = useState(isMissing)
  return missing ? <Missing /> : <Site />
}

// The bar as on About (menu up top, no bio), over the 404. Real links, see NotFound.
function Missing() {
  const s = localize(site, useLang())
  return (
    <>
      <NotFound />
      <header className="bar is-about">
        <nav className="nav" aria-label={useT().main}>
          {s.nav.map((l) => (
            <a key={l.label} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <Corner />
      </header>
    </>
  )
}

function Site() {
  const lang = useLang()
  const t = useT()
  const s = localize(site, lang)
  const [view, setView] = useState(() => {
    const i = fromPath()
    return i == null ? null : { index: i, from: null }
  })
  const [closing, setClosing] = useState(false)
  // About: `about` is where we're going, `aboutOn` keeps the page mounted while
  // it arrives or leaves. The home pieces fall and rise in hang.js.
  const [about, setAbout] = useState(() => view == null && isAbout())
  const [aboutOn, setAboutOn] = useState(about)
  const aboutRef = useRef(null)
  const pageRef = useRef(null)
  const aboutAfter = useRef(false) // About asked for from a project: once it has closed
  const [hang] = useState(() =>
    createHang((p, resting) => {
      aboutRef.current?.style.setProperty('--ap', p)
      // Fully away and still: the strip can't show a stray card on resize or re-layout.
      pageRef.current?.classList.toggle('is-hung', p === 1 && resting)
      // Only once home and still: going to About, p stays 0 while the pieces fall.
      if (p === 0 && resting) setAboutOn(false)
    })
  )
  const firstHang = useRef(true)
  useLayoutEffect(() => {
    if (about) setAboutOn(true)
    hang.to(about ? 1 : 0, firstHang.current)
    firstHang.current = false
  }, [about])
  useEffect(() => hang.stop, [])
  // The bio and the clock fade out, then leave the DOM while a project is open.
  const [bioGone, setBioGone] = useState(view != null || isAbout())
  const nowIndex = projects.findIndex((p) => p.slug === site.now)
  const [filter, setFilter] = useState(lensFromUrl)
  const lensRef = useRef(filter)
  lensRef.current = filter
  const pickFilter = (f) => {
    setFilter(f)
    history.replaceState(null, '', withLens(location.pathname, f))
  }
  const shown = useMemo(() => (filter === 'all' ? all : all.filter((p) => p.category?.includes(filter))), [filter])
  // "Next project" walks the filtered set, unless the open project isn't in it
  // (opened from "Now building"): then every project.
  const order = view && !shown.some((p) => p.i === view.index) ? all : shown
  // Landing on the home page plays the intro; landing on a project doesn't.
  const [intro] = useState(() => view == null && !about)
  // The intro's staggered entrances stay put until the first project opens:
  // dropping them earlier would restart the elements' own animations (a blink).
  useLayoutEffect(() => {
    if (intro && !view) document.documentElement.classList.add('intro')
  }, [])
  // Coming home from a project the header and the name settle back in the same
  // staggered way (`returning`); like the intro, it stays until the next open.
  // Going to a project or to About drops both, or they would outrank those
  // pages' own entrances and exits (the bio lingering over the menu).
  const was = useRef({ view, about })
  useLayoutEffect(() => {
    const root = document.documentElement
    if (view || about) root.classList.remove('intro', 'returning')
    else if (was.current.view) root.classList.add('returning')
    was.current = { view, about }
  }, [view, about])

  const open = useCallback((i) => {
    setView({ index: i, from: { type: 'card' } })
    history.pushState(null, '', withLens(`/proyecto/${projects[i].slug}`, lensRef.current))
  }, [])

  const close = useCallback((push = true) => {
    setClosing(true)
    if (push) history.pushState(null, '', withLens('/', lensRef.current))
  }, [])

  // Next project: the same page stays and recycles itself into the next one
  // (Project animates whenever its index changes).
  const next = () => {
    const i = order[(order.findIndex((p) => p.i === view.index) + 1) % order.length].i
    setView((v) => ({ ...v, index: i }))
    history.pushState(null, '', withLens(`/proyecto/${projects[i].slug}`, lensRef.current))
  }

  const onClosed = useCallback(() => {
    setView(null)
    setClosing(false)
    if (aboutAfter.current) (aboutAfter.current = false), setAbout(true)
  }, [])

  const goAbout = () => {
    if (about) return
    history.pushState(null, '', '/about')
    if (view) (aboutAfter.current = true), close(false)
    else setAbout(true)
  }
  const goHome = () => {
    if (view) return close()
    aboutAfter.current = false
    if (about) setAbout(false), history.pushState(null, '', withLens('/', lensRef.current))
  }

  // Browser back/forward replay the same transitions.
  useEffect(() => {
    const onPop = () => {
      if (!isAbout()) setFilter(lensFromUrl())
      const i = fromPath()
      if (i == null) {
        aboutAfter.current = isAbout()
        if (view) return close(false)
        return setAbout(isAbout())
      }
      setClosing(false)
      // From About the cards are away: the media just opens in place.
      setView({ index: i, from: view || about ? null : { type: 'card' } })
      setAbout(false)
    }
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (view && !closing) close()
      else if (about) setAbout(false), history.pushState(null, '', withLens('/', lensRef.current))
    }
    addEventListener('popstate', onPop)
    addEventListener('keydown', onKey)
    return () => {
      removeEventListener('popstate', onPop)
      removeEventListener('keydown', onKey)
    }
  }, [view, closing, close, about])

  // On About too: the bio is that page's lead, so it steps out of the bar.
  const bioAway = !!view || about
  useEffect(() => {
    if (!bioAway) return setBioGone(false)
    const id = setTimeout(() => setBioGone(true), 400)
    return () => clearTimeout(id)
  }, [bioAway])

  useLayoutEffect(() => {
    const ro = new ResizeObserver(syncBarHeight)
    ro.observe(document.querySelector('.bar'))
    return () => ro.disconnect()
  }, [])

  // Product design pages keep only the back arrow up top; the title takes the row.
  const flowPage = view && filter === 'product' && projects[view.index].category?.includes('product')
  const pageClass = ['page', view && 'is-away', view && !closing && 'cards-out'].filter(Boolean).join(' ')

  return (
    <>
      <main className={pageClass} ref={pageRef} inert={view || about ? true : undefined}>
        <section className="top">
          <h1 className="hero">
            <span className="by">{t.by}</span> <span className="signature">{site.name}</span>
          </h1>
          {/* Hidden until there are two categories to choose between. */}
          {filters.length > 2 && (
            <div className="filter" role="group" aria-label={t.filter}>
              {filters.map((f) => (
                <button key={f.key} type="button" aria-pressed={filter === f.key} onClick={() => pickFilter(f.key)}>
                  {f.key === 'all' ? t.all : localize(f, lang).label}
                </button>
              ))}
            </div>
          )}
          {nowIndex >= 0 && (
            <p className="now">
              {t.nowBuilding}{' '}
              <a href={`/proyecto/${site.now}`} onClick={(e) => (e.preventDefault(), open(nowIndex))}>
                <mark>{projects[nowIndex].title}</mark>
              </a>
            </p>
          )}
        </section>

        <section className="work" aria-label={t.work}>
          <Carousel items={shown} loop={filter === 'all'} onOpen={open} locked={!!view || about} intro={intro} />
        </section>
      </main>

      {aboutOn && <About active={about} rootRef={aboutRef} />}

      {/* Outside the page so it survives every view. */}
      <header className={view ? `bar is-project${flowPage ? ' is-flow' : ''}` : about ? 'bar is-about' : 'bar'}>
        {/* Not just hidden: gone while a project is open, so it can never linger. */}
        {!bioGone && <p className={bioAway ? 'role is-leaving' : 'role'}>{marked(s.bio)}</p>}
        <nav className="nav" aria-label={t.main}>
          {s.nav.map((l) => (
            <a
              key={l.label}
              href={l.href}
              // Work is the landing and every project page, so it's current on both.
              aria-current={(l.href === '/about') === about && l.href.startsWith('/') ? 'page' : undefined}
              onClick={(e) => {
                if (l.href === '/') e.preventDefault(), goHome()
                else if (l.href === '/about') e.preventDefault(), goAbout()
              }}
            >
              {l.label}
            </a>
          ))}
        </nav>
        {!(bioGone && view) && <Corner leaving={!!view} />}
      </header>

      {/* One instance for as long as a project is open: project to project it
          recycles its own elements instead of being rebuilt. */}
      {view && (
        <Project
          index={view.index}
          from={view.from}
          closing={closing}
          onClosed={onClosed}
          order={order.map((p) => p.i)}
          lens={filter === 'all' ? null : filter}
          onNext={next}
          onBack={() => close()}
        />
      )}
    </>
  )
}
