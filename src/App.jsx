import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import Carousel from './Carousel.jsx'
import Project from './Project.jsx'
import { syncBarHeight } from './bar.js'
import { projects, site } from './projects.js'

const fromPath = () => {
  const slug = location.pathname.match(/^\/proyecto\/([^/]+)/)?.[1]
  const i = projects.findIndex((p) => p.slug === slug)
  return i < 0 ? null : i
}

function Clock() {
  const fmt = () =>
    new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: site.timeZone }).format(new Date())
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 10_000)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="clock">
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
  const nowIndex = projects.findIndex((p) => p.slug === site.now)

  const open = useCallback((i) => {
    setView({ index: i, from: { type: 'card' } })
    history.pushState(null, '', `/proyecto/${projects[i].slug}`)
  }, [])

  const close = useCallback((push = true) => {
    setClosing(true)
    if (push) history.pushState(null, '', '/')
  }, [])

  const next = (rect) => {
    const i = (view.index + 1) % projects.length
    setView({ index: i, from: { type: 'rect', rect, ghost: view.index } })
    history.pushState(null, '', `/proyecto/${projects[i].slug}`)
  }

  const onClosed = useCallback(() => {
    setView(null)
    setClosing(false)
  }, [])

  // Browser back/forward replay the same transitions.
  useEffect(() => {
    const onPop = () => {
      const i = fromPath()
      if (i == null) return view && close(false)
      setClosing(false)
      setView({ index: i, from: view ? null : { type: 'card' } })
    }
    const onKey = (e) => e.key === 'Escape' && view && !closing && close()
    addEventListener('popstate', onPop)
    addEventListener('keydown', onKey)
    return () => {
      removeEventListener('popstate', onPop)
      removeEventListener('keydown', onKey)
    }
  }, [view, closing, close])

  useLayoutEffect(() => {
    const ro = new ResizeObserver(syncBarHeight)
    ro.observe(document.querySelector('.bar'))
    return () => ro.disconnect()
  }, [])

  const pageClass = ['page', view && 'is-away', view && !closing && 'cards-out'].filter(Boolean).join(' ')

  return (
    <>
      <main className={pageClass} inert={view ? true : undefined}>
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
          <Carousel items={projects} onOpen={open} locked={!!view} />
        </section>
      </main>

      {/* Outside the page so it survives every view. */}
      <header className={view ? 'bar is-project' : 'bar'}>
        <p className="role">
          {site.bio.split('*').map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part))}
        </p>
        <nav className="nav" aria-label="Principal">
          {site.nav.map((l) => (
            <a
              key={l.label}
              href={l.href}
              // Work is the landing and every project page, so it's current on both.
              aria-current={l.href === '/' ? 'page' : undefined}
              onClick={(e) => l.href === '/' && view && (e.preventDefault(), close())}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <Clock />
      </header>

      {view && (
        <Project
          key={view.index}
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
