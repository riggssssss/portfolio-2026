import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Media } from './Carousel.jsx'
import { projects } from './projects.js'
import { syncBarHeight } from './bar.js'
import { smoothScroll } from './smooth.js'
import { marked } from './marked.jsx'

// Nothing is rebuilt between views: the card becomes the page's media, and from
// project to project the page recycles itself: the media curtains in, every
// piece of text swaps its content in place, labels that don't change stay put.
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

// A still of a video's current frame, to stand in for another video until that
// one shows the same frame — so a handover between the card and the page never
// flashes a poster or jumps in time.
function still(video) {
  if (!video || video.readyState < 2 || !video.videoWidth) return null
  const c = document.createElement('canvas')
  c.width = video.videoWidth
  c.height = video.videoHeight
  c.getContext('2d').drawImage(video, 0, 0)
  c.className = 'still'
  return c
}

// Calls back once `video` shows the frame at `t` (or after a safety timeout).
function whenAt(video, t, cb) {
  const t0 = performance.now()
  let raf = 0
  const check = () => {
    const there = video.readyState >= 2 && !video.seeking && Math.abs(video.currentTime - t) < 0.4
    if (there || performance.now() - t0 > 4000) return void (raf = requestAnimationFrame(cb))
    raf = requestAnimationFrame(check)
  }
  check()
  return () => cancelAnimationFrame(raf)
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
  // `shown` is whose text is on the page; it trails `index` while text swaps.
  const [shown, setShown] = useState(index)
  // Media layers, bottom to top; the top one curtains in over the others.
  const [layers, setLayers] = useState([index])
  const p = projects[shown]
  const next = (shown + 1) % projects.length
  const rootRef = useRef(null)
  const mediaRef = useRef(null)
  const scrollRef = useRef(null)
  const busy = useRef(false)
  const outs = useRef([])
  const viaCard = from?.type === 'card'
  // Text starts while the media is still settling. On phones the media flies
  // through the text's place, so the text waits until it has passed. Frozen:
  // a later change would retime (and replay) the finished entrances.
  const [base] = useState(() => (viaCard ? `${0.55 + (narrow() ? 0.4 : 0)}s` : '0.3s'))

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
      if (cv && pv) {
        // The page's video is new and still loading: the card's frame flies on
        // top of it until it catches up.
        const t = cv.currentTime
        const frame = still(cv)
        if (frame) pv.after(frame)
        pv.currentTime = t
        const stop = whenAt(pv, t, () => frame?.remove())
        anims.push({ cancel: () => (stop(), frame?.remove()) })
      }
      anims.push(media.animate([box(source), box(target)], opts))
      // From the card's crop (its parallax zoom) to the page's.
      media.querySelectorAll('.pm-layer > *').forEach((el) =>
        anims.push(el.animate([{ transform: cardMedia.firstElementChild.style.transform }, { transform: 'none' }], opts))
      )
    } else {
      anims.push(media.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], opts))
    }

    rootRef.current.classList.add('is-in')
    return () => anims.forEach((a) => a.cancel())
  }, [])

  useEffect(() => smoothScroll(scrollRef.current, window), [])

  // Inside a project the video always runs, looping, whatever the phone does:
  // a pause nobody asked for (iOS low power, a blocked autoplay, a tab coming
  // back) is undone, an end without a loop restarts, and a blocked start gets
  // its go on the first touch. Muted as attribute and property: React renders
  // neither reliably, and without them Safari refuses autoplay.
  useEffect(() => {
    const videos = [...mediaRef.current.querySelectorAll('video')]
    if (!videos.length) return
    const run = () => {
      if (document.hidden) return
      videos.forEach((v) => v.isConnected && v.paused && v.play().catch(() => {}))
    }
    const again = (e) => ((e.target.currentTime = 0), run())
    videos.forEach((v) => {
      v.muted = v.defaultMuted = true
      v.setAttribute('muted', '')
      v.setAttribute('playsinline', '')
      v.loop = true
      v.addEventListener('pause', run)
      v.addEventListener('ended', again)
    })
    run()
    document.addEventListener('visibilitychange', run)
    addEventListener('touchstart', run, { passive: true })
    addEventListener('pointerdown', run)
    return () => {
      videos.forEach((v) => (v.removeEventListener('pause', run), v.removeEventListener('ended', again)))
      document.removeEventListener('visibilitychange', run)
      removeEventListener('touchstart', run)
      removeEventListener('pointerdown', run)
    }
  }, [layers])

  useEffect(() => {
    if (!closing) return
    const media = mediaRef.current
    const opts = { duration: dur(), easing: EASE, fill: 'forwards' }
    const card = findCard(index)
    rootRef.current.classList.add('is-out')
    const anims = []

    const cardMedia = card?.querySelector('.card-media')
    const crop = cardMedia?.firstElementChild.style.transform || 'none'
    if (card) {
      lift(card)
      scatter(card)
      const slot = cardMedia.getBoundingClientRect()
      anims.push(media.animate([box(media.getBoundingClientRect()), box(slot)], opts))
      // Land in the card's crop too (its parallax zoom), or the picture jumps
      // at the handover.
      media.querySelectorAll('.pm-layer:last-child > *').forEach((el) =>
        anims.push(el.animate([{ transform: 'none' }, { transform: crop }], opts))
      )
    } else {
      anims.push(media.animate([{ opacity: 1 }, { opacity: 0 }], { ...opts, duration: dur() / 2 }))
    }

    let done = false
    Promise.all(anims.map((a) => a.finished)).then(() => {
      if (done) return
      done = true
      // The card's video is paused somewhere else (or never loaded): the page's
      // last frame stays on the card until the card's video is on that frame.
      const pv = media.querySelector('.pm-layer:last-child video')
      const cv = cardMedia?.querySelector('video')
      if (pv && cv) {
        const frame = still(pv)
        if (frame) (frame.style.transform = crop), cardMedia.append(frame)
        cv.preload = 'auto'
        cv.currentTime = pv.currentTime
        whenAt(cv, pv.currentTime, () => frame?.remove())
      }
      card?.classList.remove('is-lifted')
      onClosed()
    }, () => {})
    return () => {
      done = true
      anims.forEach((a) => a.cancel())
    }
  }, [closing])

  // ---- project to project ----

  const swappable = () => [...rootRef.current.querySelectorAll('[data-swap]')]

  // A new index: the next media curtains in, the column glides to the top, and
  // each piece of text goes out top-down; once all are out the content swaps.
  useEffect(() => {
    if (index === shown) return
    busy.current = true
    // The card this page was opened from goes back among the fallen ones,
    // unseen, so on the way home it rises with them instead of waiting in place.
    document.querySelectorAll('.card.is-lifted').forEach((c) => {
      c.style.transition = 'none'
      c.classList.remove('is-lifted')
      c.offsetWidth
      c.style.transition = ''
    })
    setLayers((l) => [...l.filter((i) => i !== index), index])

    const d = dur() * (narrow() ? 1.15 : 1)
    const pr = scrollRef.current
    const top = pr.scrollTop
    const t0 = performance.now()
    let raf = 0
    const glide = (now) => {
      const k = Math.min(1, (now - t0) / d || 1)
      pr.scrollTop = top * (1 - k) ** 3
      if (k < 1) raf = requestAnimationFrame(glide)
    }
    raf = requestAnimationFrame(glide)

    outs.current = swappable().map((el, i) =>
      el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-0.35em)' }], {
        duration: d * 0.32,
        delay: Math.min(i, 10) * 28,
        easing: 'cubic-bezier(0.4, 0, 1, 1)',
        fill: 'forwards',
      })
    )
    let alive = true
    Promise.all(outs.current.map((a) => a.finished)).then(() => alive && setShown(index), () => {})
    return () => {
      alive = false
      cancelAnimationFrame(raf)
    }
  }, [index])

  // The content has swapped while invisible: each piece comes back in place.
  const was = useRef(shown) // not a mount flag: StrictMode mounts twice
  useLayoutEffect(() => {
    if (was.current === shown) return
    was.current = shown
    outs.current.forEach((a) => a.cancel())
    outs.current = []
    const ins = swappable().map((el, i) =>
      el.animate([{ opacity: 0, transform: 'translateY(0.45em)' }, { opacity: 1, transform: 'none' }], {
        duration: dur() && 650,
        delay: Math.min(i, 10) * 45,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'backwards',
      })
    )
    Promise.all(ins.map((a) => a.finished)).then(() => (busy.current = false), () => {})
  }, [shown])

  // The curtain: the top media layer falls over the one below, then the ones
  // underneath leave. Layers are keyed, so the new one's video never reloads.
  useLayoutEffect(() => {
    if (layers.length < 2) return
    const layer = mediaRef.current.lastElementChild
    const v = layer.querySelector('video')
    if (v) (v.muted = true), v.play().catch(() => {}) // the keep-playing guard takes it from here
    // On phones the media sits above the text, uncovered as the column glides
    // up: the curtain has to be down before it gets there.
    const cloth = layer.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }], {
      duration: dur() * (narrow() ? 0.55 : 1),
      easing: EASE,
    })
    cloth.finished.then(() => setLayers((l) => l.slice(-1)), () => {})
    return () => cloth.cancel()
  }, [layers])

  const rv = (i, cls) => ({ className: `${cls} rv`, style: { '--i': i } })
  const sw = { 'data-swap': '' }

  return (
    <div className="proj" ref={rootRef} style={{ '--base': base }} role="dialog" aria-label={p.title}>
      <div className="pm" ref={mediaRef}>
        {layers.map((i) => (
          <div className="pm-layer" key={i}>
            <Media p={projects[i]} decorative={i !== index} />
          </div>
        ))}
      </div>

      <button type="button" {...rv(0, 'back')} onClick={onBack} aria-label="Back to index">
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M13 8H3m4.5-4.5L3 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </button>

      <article className="pr" ref={scrollRef}>
        <div className="pr-inner">
          <div className="pr-sheet">
            {/* The first screen holds the intro and the facts; sections wait below. */}
            <div className="pr-intro">
              <h1 {...rv(1, 'pr-title')}>
                <span {...sw}>{p.title}</span>
              </h1>
              <p {...rv(2, 'pr-tags')}>
                <span {...sw}>{p.tags}</span>
              </p>
              <p {...rv(3, 'pr-lead')}>
                <span {...sw}>{p.intro}</span>
              </p>

              {/* Labels are the same for every project and stay; values swap. Rows
                  a project doesn't have go out (and come in) whole. */}
              <dl {...rv(4, 'pr-facts')}>
                <div>
                  <dt>Year</dt>
                  <dd {...sw}>{p.year}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd {...sw}>{p.status}</dd>
                </div>
                <div>
                  <dt>Role</dt>
                  <dd {...sw}>{p.role}</dd>
                </div>
                {p.tools && (
                  <div key="stack" {...sw}>
                    <dt>Stack</dt>
                    <dd>{p.tools.join(', ')}</dd>
                  </div>
                )}
                {p.url && (
                  <div key="web" {...sw}>
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
              <section key={i} {...rv(5 + i, 'pr-block')}>
                <h2 {...sw}>{s.heading}</h2>
                <p {...sw}>{marked(s.text)}</p>
              </section>
            ))}

            {projects.length > 1 && (
              <button
                type="button"
                onClick={() => busy.current || onNext()}
                {...rv(5 + p.sections.length, 'pr-next')}
              >
                <span className="pr-next-label">Siguiente proyecto</span>
                <span className="pr-next-row">
                  <span className="pr-next-thumb" {...sw}>
                    <Media key={next} p={projects[next]} decorative play={false} />
                  </span>
                  <span className="pr-next-title" {...sw}>
                    {projects[next].title}
                  </span>
                </span>
              </button>
            )}
          </div>
        </div>
      </article>
    </div>
  )
}
