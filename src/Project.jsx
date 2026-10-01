import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Media } from './Carousel.jsx'
import { projects } from './projects.js'
import { syncBarHeight } from './bar.js'
import { smoothScroll } from './smooth.js'

// Nothing is rebuilt between views: the card becomes the page's media, its caption
// becomes the page title, the next-project thumb becomes the next page.
const EASE = 'cubic-bezier(0.76, 0, 0.24, 1)'
const DUR = 1050
const dur = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : DUR)
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

// The card's caption grows into the page title (and shrinks back). A fixed clone
// flies it, so no scroll container clips it on the way.
function flyTitle(el, fromEl, reverse, opts) {
  const to = el.getBoundingClientRect()
  const from = fromEl.getBoundingClientRect()
  const scale = parseFloat(getComputedStyle(fromEl).fontSize) / parseFloat(getComputedStyle(el).fontSize)
  const clone = el.cloneNode(true)
  clone.classList.add('pr-title-flying')
  Object.assign(clone.style, { top: `${to.top}px`, left: `${to.left}px`, width: `${to.width}px` })
  el.closest('.proj').append(clone)
  el.style.visibility = 'hidden'
  const frames = [
    { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${scale})` },
    { transform: 'none' },
  ]
  const a = clone.animate(reverse ? frames.reverse() : frames, opts)
  const end = () => {
    clone.remove()
    if (!reverse) el.style.visibility = ''
  }
  a.finished.then(end, end)
  return a
}

export default function Project({ index, from, closing, onClosed, onNext, onBack }) {
  const p = projects[index]
  const next = (index + 1) % projects.length
  const rootRef = useRef(null)
  const mediaRef = useRef(null)
  const titleRef = useRef(null)
  const thumbRef = useRef(null)
  const scrollRef = useRef(null)
  const [ghost, setGhost] = useState(from?.ghost ?? null)
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
      anims.push(flyTitle(titleRef.current, card.querySelector('.card-caption span'), false, opts))
    } else if (from?.type === 'rect') {
      const a = media.animate([box(from.rect), box(target)], opts)
      a.finished.then(() => setGhost(null), () => {})
      anims.push(a)
    } else {
      anims.push(media.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], opts))
    }

    rootRef.current.classList.add('is-in')
    return () => anims.forEach((a) => a.cancel())
  }, [])

  useEffect(() => smoothScroll(scrollRef.current, window), [])

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
      anims.push(flyTitle(titleRef.current, card.querySelector('.card-caption span'), true, opts))
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

  const rv = (i, cls) => ({ className: `${cls} rv`, style: { '--i': i } })

  return (
    <div
      className="proj"
      ref={rootRef}
      style={{ '--base': viaCard ? '0.8s' : '0.3s' }}
      role="dialog"
      aria-label={p.title}
    >
      {ghost != null && (
        <div className="pm pm-ghost" aria-hidden>
          <Media p={projects[ghost]} decorative play={false} />
        </div>
      )}
      <div className="pm" ref={mediaRef}>
        <Media p={p} />
      </div>

      <button type="button" {...rv(0, 'back')} onClick={onBack} aria-label="Back to index">
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M13 8H3m4.5-4.5L3 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </button>

      <article className="pr" ref={scrollRef}>
        <div className="pr-inner">
          <div className="pr-sheet">
            <h1 ref={titleRef} {...(viaCard ? { className: 'pr-title' } : rv(1, 'pr-title'))}>
              {p.title}
            </h1>
            <p {...rv(2, 'pr-tags')}>{p.tags}</p>

            <p {...rv(3, 'pr-lead')}>{p.intro}</p>

            <dl {...rv(4, 'pr-facts')}>
              <div>
                <dt>Año</dt>
                <dd>{p.year}</dd>
              </div>
              <div>
                <dt>Rol</dt>
                <dd>{p.role}</dd>
              </div>
              <div>
                <dt>Stack</dt>
                <dd>{p.tools.join(', ')}</dd>
              </div>
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

            {p.sections.map((s, i) => (
              <section key={s.heading} {...rv(5 + i, 'pr-block')}>
                <h2>{s.heading}</h2>
                <p>{s.text}</p>
              </section>
            ))}

            {projects.length > 1 && (
              <button
                type="button"
                onClick={() => onNext(thumbRef.current.getBoundingClientRect())}
                {...rv(5 + p.sections.length, 'pr-next')}
              >
                <span className="pr-next-label">Siguiente proyecto</span>
                <span className="pr-next-row">
                  <span className="pr-next-thumb" ref={thumbRef}>
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
