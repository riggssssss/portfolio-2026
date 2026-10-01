import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Media } from './Carousel.jsx'
import { projects } from './projects.js'
import { syncBarHeight } from './bar.js'
import { smoothScroll } from './smooth.js'
import { marked } from './marked.jsx'

// Nothing is rebuilt between views: the card becomes the page's media and the
// next-project thumb becomes the next page. Text only fades.
const EASE = 'cubic-bezier(0.5, 0, 0.2, 1)'
const DUR = 1050
const dur = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : DUR)
const narrow = () => matchMedia('(max-width: 760px)').matches
const box = (r) => ({ top: `${r.top}px`, left: `${r.left}px`, width: `${r.width}px`, height: `${r.height}px` })

// The on-screen card for project i, closest to the center.
function findCard(i) {
  let best = null
  let bestD = Infinity
  document.querySelectorAll(`.card[data-i="${i}"]`).forEach((c) => {
    const r = c.getBoundingClientRect()
    if (r.right < 0 || r.left > innerWidth) return
    const d = Math.abs(r.left + r.width / 2 - innerWidth / 2)
    if (d < bestD) (bestD = d), (best = c)
  })
  return best
}

// Take the card out of the strip without animating, so its slot can be measured.
function lift(card) {
  document.querySelectorAll('.card.is-lifted').forEach((c) => c !== card && c.classList.remove('is-lifted'))
  card.style.transition = 'none'
  card.classList.add('is-lifted')
  card.offsetWidth
  card.style.transition = ''
}

// The other cards fall away from (or rise back toward) the lifted one, nearest first.
function scatter(card) {
  const sx = card.getBoundingClientRect().left + card.offsetWidth / 2
  document.querySelectorAll('.card').forEach((c) => {
    const r = c.getBoundingClientRect()
    const dx = r.left + r.width / 2 - sx
    c.style.setProperty('--delay', `${(Math.abs(dx) / innerWidth) * 0.32}s`)
    c.style.setProperty('--dir', Math.sign(dx))
  })
}

export default function Project({ index, from, closing, onClosed, onNext, onBack }) {
  const p = projects[index]
  const next = (index + 1) % projects.length
  const rootRef = useRef(null)
  const mediaRef = useRef(null)
  const scrollRef = useRef(null)
  const viaCard = from?.type === 'card'

  useLayoutEffect(() => {
    syncBarHeight()
    const media = mediaRef.current
    const target = media.getBoundingClientRect()
    const opts = { duration: dur(), easing: EASE }
    const anims = []

    if (viaCard && findCard(index)) {
      const card = findCard(index)
      const cardMedia = card.querySelector('.card-media')
      const source = cardMedia.getBoundingClientRect()
      scatter(card)
      lift(card)
      const cv = card.querySelector('video')
      const pv = media.querySelector('video')
      if (cv && pv) pv.currentTime = cv.currentTime
      anims.push(media.animate([box(source), box(target)], opts))
      anims.push(
        media.firstElementChild.animate([{ transform: cardMedia.firstElementChild.style.transform }, { transform: 'none' }], opts)
      )
    } else if (from?.type === 'curtain') {
      // The previous page already curtained this media in: same frame, no move.
      const pv = media.querySelector('video')
      if (pv && from.time) pv.currentTime = from.time
    } else {
      anims.push(media.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], opts))
    }

    rootRef.current.classList.add('is-in')
    return () => anims.forEach((a) => a.cancel())
  }, [])

  useEffect(() => smoothScroll(scrollRef.current, window), [])

  // Inside a project the video always runs. Set muted as a property too: React
  // doesn't render the attribute, and without it Safari refuses autoplay.
  useEffect(() => {
    const v = mediaRef.current.querySelector('video')
    if (!v) return
    v.muted = true
    v.play().catch(() => {})
  }, [])

  useEffect(() => {
    if (!closing) return
    const media = mediaRef.current
    const opts = { duration: dur(), easing: EASE, fill: 'forwards' }
    const card = findCard(index)
    rootRef.current.classList.add('is-out')
    const anims = []

    if (card) {
      lift(card)
      scatter(card)
      const slot = card.querySelector('.card-media').getBoundingClientRect()
      anims.push(media.animate([box(media.getBoundingClientRect()), box(slot)], opts))
    } else {
      anims.push(media.animate([{ opacity: 1 }, { opacity: 0 }], { ...opts, duration: dur() / 2 }))
    }

    let done = false
    Promise.all(anims.map((a) => a.finished)).then(() => {
      if (done) return
      done = true
      card?.classList.remove('is-lifted')
      onClosed()
    }, () => {})
    return () => {
      done = true
      anims.forEach((a) => a.cancel())
    }
  }, [closing])

  // Next project: inside the media frame the next one falls like a curtain over
  // this one, while the text column glides back to the top. Then the text fades
  // and the page swaps under the media, which is already the next one.
  const [curtain, setCurtain] = useState(false)
  const curtainRef = useRef(null)
  const goNext = () => setCurtain(true)

  useEffect(() => {
    if (!curtain) return
    const nv = curtainRef.current.querySelector('video')
    if (nv) (nv.muted = true), nv.play().catch(() => {})
    const d = dur()
    const pr = scrollRef.current
    const from = pr.scrollTop
    const t0 = performance.now()
    const glide = d * 0.85
    let raf = 0
    const step = (now) => {
      const k = Math.min(1, (now - t0) / glide || 1)
      pr.scrollTop = from * (1 - (1 - (1 - k) ** 3))
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)

    const cloth = curtainRef.current.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }], {
      duration: d,
      easing: EASE,
      fill: 'forwards',
    })
    let out = 0
    cloth.finished.then(() => {
      rootRef.current.classList.add('is-leaving')
      out = setTimeout(() => onNext(curtainRef.current.querySelector('video')?.currentTime), d && 280)
    }, () => {})
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(out)
      cloth.cancel()
    }
  }, [curtain])

  const rv = (i, cls) => ({ className: `${cls} rv`, style: { '--i': i } })

  return (
    <div
      className="proj"
      ref={rootRef}
      // Text starts while the media is still settling. On phones the media flies
      // through the text's place, so the text waits until it has passed.
      style={{ '--base': viaCard ? `${0.55 + (narrow() ? 0.4 : 0)}s` : from?.type === 'curtain' ? '0.1s' : '0.3s' }}
      role="dialog"
      aria-label={p.title}
    >
      <div className="pm" ref={mediaRef}>
        <Media p={p} />
        {curtain && (
          <div className="pm-curtain" ref={curtainRef} aria-hidden>
            <Media p={projects[next]} decorative />
          </div>
        )}
      </div>

      {/* Project to project the arrow just stays where it is. */}
      <button
        type="button"
        {...(from?.type === 'curtain' ? { className: 'back' } : rv(0, 'back'))}
        onClick={onBack}
        aria-label="Back to index"
      >
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M13 8H3m4.5-4.5L3 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </button>

      <article className="pr" ref={scrollRef}>
        <div className="pr-inner">
          <div className="pr-sheet">
            {/* The first screen holds the intro and the facts; sections wait below. */}
            <div className="pr-intro">
              <h1 {...rv(1, 'pr-title')}>{p.title}</h1>
              <p {...rv(2, 'pr-tags')}>{p.tags}</p>
              <p {...rv(3, 'pr-lead')}>{p.intro}</p>

              <dl {...rv(4, 'pr-facts')}>
                <div>
                  <dt>Year</dt>
                  <dd>{p.year}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{p.status}</dd>
                </div>
                <div>
                  <dt>Role</dt>
                  <dd>{p.role}</dd>
                </div>
                {p.tools && (
                  <div>
                    <dt>Stack</dt>
                    <dd>{p.tools.join(', ')}</dd>
                  </div>
                )}
                {p.url && (
                  <div>
                    <dt>Web</dt>
                    <dd>
                      <a className="link" href={p.url} target="_blank" rel="noreferrer">
                        {p.url.replace(/^https?:\/\//, '')}
                        <svg viewBox="0 0 16 16" aria-hidden>
                          <path d="M5 11l6-6M6 5h5v5" fill="none" stroke="currentColor" strokeWidth="1.3" />
                        </svg>
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {p.sections.map((s, i) => (
              <section key={s.heading} {...rv(5 + i, 'pr-block')}>
                <h2>{s.heading}</h2>
                <p>{marked(s.text)}</p>
              </section>
            ))}

            {projects.length > 1 && (
              <button
                type="button"
                onClick={goNext}
                {...rv(5 + p.sections.length, 'pr-next')}
              >
                <span className="pr-next-label">Siguiente proyecto</span>
                <span className="pr-next-row">
                  <span className="pr-next-thumb">
                    <Media p={projects[next]} decorative play={false} />
                  </span>
                  <span className="pr-next-title">{projects[next].title}</span>
                </span>
              </button>
            )}
          </div>
        </div>
      </article>
    </div>
  )
}
