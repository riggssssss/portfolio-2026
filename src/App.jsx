import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import About from './About.jsx'
import Carousel from './Carousel.jsx'
import Project from './Project.jsx'
import { syncBarHeight } from './bar.js'
import { createHang } from './hang.js'
import { marked } from './marked.jsx'
import { projects, site } from './projects.js'

const fromPath = () => {
  const slug = location.pathname.match(/^\/proyecto\/([^/]+)/)?.[1]
  const i = projects.findIndex((p) => p.slug === slug)
  return i < 0 ? null : i
}
const isAbout = () => location.pathname === '/about'

function Clock({ leaving }) {
  const fmt = () =>
    new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: site.timeZone }).format(new Date())
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 10_000)
    return () => clearInterval(id)
  }, [])
  return (
    <span className={leaving ? 'clock is-leaving' : 'clock'}>
      {site.city} <time>{time}</time>
    </span>
  )
}

export default function App() {
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
      if (p === 0) setAboutOn(false)
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
  // Landing on the home page plays the intro; landing on a project doesn't.
  const [intro] = useState(() => view == null && !about)
  // The intro's staggered entrances stay put until the first project opens:
  // dropping them earlier would restart the elements' own animations (a blink).
  useLayoutEffect(() => {
    if (intro && !view) document.documentElement.classList.add('intro')
  }, [])
  // Coming home from a project the header and the name settle back in the same
  // staggered way (`returning`); like the intro, it stays until the next open.
  const hadView = useRef(view != null)
  useLayoutEffect(() => {
    const root = document.documentElement
    if (view) (hadView.current = true), root.classList.remove('intro', 'returning')
    else if (hadView.current) root.classList.add('returning')
  }, [view])

  const open = useCallback((i) => {
    setView({ index: i, from: { type: 'card' } })
    history.pushState(null, '', `/proyecto/${projects[i].slug}`)
  }, [])

  const close = useCallback((push = true) => {
    setClosing(true)
    if (push) history.pushState(null, '', '/')
  }, [])

  // Next project: the same page stays and recycles itself into the next one
  // (Project animates whenever its index changes).
  const next = () => {
    const i = (view.index + 1) % projects.length
    setView((v) => ({ ...v, index: i }))
    history.pushState(null, '', `/proyecto/${projects[i].slug}`)
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
    if (about) setAbout(false), history.pushState(null, '', '/')
  }

  // Browser back/forward replay the same transitions.
  useEffect(() => {
    const onPop = () => {
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
      else if (about) setAbout(false), history.pushState(null, '', '/')
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

  const pageClass = ['page', view && 'is-away', view && !closing && 'cards-out'].filter(Boolean).join(' ')

  return (
    <>
      <main className={pageClass} ref={pageRef} inert={view || about ? true : undefined}>
        <section className="top">
          <h1 className="hero">
            <span className="by">by</span> <span className="signature">{site.name}</span>
          </h1>
          {nowIndex >= 0 && (
            <p className="now">
              Now building{' '}
              <a href={`/proyecto/${site.now}`} onClick={(e) => (e.preventDefault(), open(nowIndex))}>
                <mark>{projects[nowIndex].title}</mark>
              </a>
            </p>
          )}
        </section>

        <section className="work" aria-label="Proyectos">
          <Carousel items={projects} onOpen={open} locked={!!view || about} intro={intro} />
        </section>
      </main>

      {aboutOn && <About active={about} rootRef={aboutRef} />}

      {/* Outside the page so it survives every view. */}
      <header className={view ? 'bar is-project' : 'bar'}>
        {/* Not just hidden: gone while a project is open, so it can never linger. */}
        {!bioGone && <p className={bioAway ? 'role is-leaving' : 'role'}>{marked(site.bio)}</p>}
        <nav className="nav" aria-label="Principal">
          {site.nav.map((l) => (
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
        {!(bioGone && view) && <Clock leaving={!!view} />}
      </header>

      {/* One instance for as long as a project is open: project to project it
          recycles its own elements instead of being rebuilt. */}
      {view && (
        <Project
          index={view.index}
          from={view.from}
          closing={closing}
          onClosed={onClosed}
          onNext={next}
          onBack={() => close()}
        />
      )}
    </>
  )
}
