import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Media } from './Carousel.jsx'
import { lensed, projects } from './projects.js'
import { localize, useLang, useT } from './i18n.js'
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
// A rect as the media's top/left/width/height, against `o`: the media's
// containing box (the viewport while it's fixed, its slot in the page's flow).
const box = (r, o = { top: 0, left: 0 }) => ({
  top: `${r.top - o.top}px`,
  left: `${r.left - o.left}px`,
  width: `${r.width}px`,
  height: `${r.height}px`,
})
const origin = (el) => el.offsetParent?.getBoundingClientRect() // null while fixed

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

// The card's picture, to lay over the page's when the page shows other media
// (a category's own video): it fades during the flight, so the swap never cuts.
function ghost(cardMedia) {
  const src = cardMedia.firstElementChild
  const g = (src.tagName === 'VIDEO' && still(src)) || src.cloneNode()
  g.className = 'ghost'
  return g
}
const differs = (cardMedia, media) =>
  cardMedia.firstElementChild.getAttribute('src') !== media.querySelector('.pm-layer:last-child > *')?.getAttribute('src')

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

// One sample shot, a picture or a looping video, in a box of its own proportions
// (cropping what it shows: the media inside moves).
// A video loads and plays only near the screen and pauses away from it: on a
// phone, the clips further down cost no data until they're reached. Until then
// its poster (frame 0) stands in, so starting never jumps.
function Shot({ s }) {
  const ref = useRef(null)
  // Parallax, read from where the shot sits (so it changes with the layout).
  // `p` runs 0 → 1 as the box crosses the screen, from entering below to
  // leaving above.
  // · A tall media in a lower window (`parallax`) pans through it whole: its
  //   top edge as the box comes in, its bottom edge as it leaves. The window
  //   itself comes up from below as it appears, and then stays put.
  // · Any other shot centred on the page: the media, a little larger than its
  //   box, drifts down inside it, slower than the page.
  // · A shot to one side: the box glides in from its side to its place in the
  //   grid, easing out by the time it reaches the middle of the screen, while
  //   the media drifts up inside it, larger and further than a centred one's.
  // Reduced motion holds everything in place.
  useEffect(() => {
    const box = ref.current
    const inner = box.firstElementChild
    const pr = box.closest('.pr')
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    const ZOOM = 1.12
    const ZOOM_SIDE = 1.22
    let raf = 0
    const update = () => {
      raf = 0
      const r = box.getBoundingClientRect()
      // Where the box sits without its own glide (read back from `translate`).
      const [dx, dy] = `${box.style.translate} 0 0`.split(' ').map((v) => parseFloat(v) || 0)
      const b = { left: r.left - dx, top: r.top - dy, bottom: r.bottom - dy, width: r.width, height: r.height }
      const p = still ? 0.5 : Math.min(1, Math.max(0, (innerHeight - b.top) / (innerHeight + b.height)))
      if (s.parallax) {
        const h = b.width / (s.width / s.height)
        inner.style.height = `${h}px`
        inner.style.transform = `translate3d(0, ${-Math.max(0, h - b.height) * p}px, 0)`
        if (still) return
        // It comes up from below as it appears, and is in place once its top
        // has risen a third of the screen; from there on it scrolls as the page.
        const k = Math.min(1, Math.max(0, 1 - (innerHeight - b.top) / (innerHeight * 0.35)))
        const rise = Math.min(160, innerHeight * 0.15)
        box.style.translate = k ? `0 ${rise * k * k}px` : ''
        return
      }
      // Far off screen nothing needs to move.
      if (still || b.bottom < -innerHeight * 0.25 || b.top > innerHeight * 1.25) return
      const page = pr.getBoundingClientRect()
      const off = (b.left + b.width / 2 - (page.left + page.width / 2)) / page.width
      const side = Math.abs(off) < 0.08 ? 0 : Math.sign(off)
      // A side shot travels further the wider it is (a tenth of its width,
      // 32–140px), so a large one's glide reads as clearly as a small one's;
      // inside, its media is larger and drifts further than a centred one's.
      const reach = Math.min(140, Math.max(32, b.width * 0.1))
      const k = Math.min(1, Math.max(0, (0.5 - p) / 0.5))
      const zoom = side ? ZOOM_SIDE : ZOOM
      box.style.translate = side ? `${side * reach * k * k}px 0` : ''
      inner.style.transform = `translate3d(0, ${(p - 0.5) * (zoom - 1) * b.height}px, 0) scale(${zoom})`
    }
    const queue = () => raf || (raf = requestAnimationFrame(update))
    update()
    if (still) return
    pr.addEventListener('scroll', queue, { passive: true })
    addEventListener('resize', queue)
    return () => {
      cancelAnimationFrame(raf)
      pr.removeEventListener('scroll', queue)
      removeEventListener('resize', queue)
    }
  }, [])
  useEffect(() => {
    const v = ref.current.querySelector('video')
    if (!v) return
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), {
      root: ref.current.closest('.pr'),
      rootMargin: '200px 0px',
    })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  const media = s.video ? (
    <Media p={{ video: s.video, image: s.image, title: s.alt }} play={false} preload="none" />
  ) : (
    <img src={s.image} alt={s.alt} loading="lazy" draggable={false} />
  )
  return s.parallax ? (
    <div className="pr-shot is-parallax" ref={ref}>
      <div className="pr-pan">{media}</div>
    </div>
  ) : (
    <div className="pr-shot" ref={ref} style={{ '--ar': `${s.width} / ${s.height}` }}>
      {media}
    </div>
  )
}

// `order`: the project indices "Next project" walks through (the filtered set).
// `lens`: the category it was opened from; each project shows that version of
// itself if it has it. Seen as product design the page is one centred column
// that scrolls as a normal page (`flow`): the title, the media in its own
// proportions, then the description.
export default function Project({ index, order, lens, from, closing, onClosed, onNext, onBack }) {
  // `shown` is whose text is on the page; it trails `index` while text swaps.
  const [shown, setShown] = useState(index)
  // Media layers, bottom to top; the top one curtains in over the others.
  const [layers, setLayers] = useState([index])
  const lang = useLang()
  const t = useT()
  const seen = (i) => lensed(localize(projects[i], lang), projects[i].category?.includes(lens) ? lens : null)
  const p = seen(shown)
  const flow = projects[shown].category?.includes(lens) && lens === 'product'
  // The slot takes the shape of the media on its way in (it follows `index`).
  const ratio = seen(index).ratio ?? 4 / 5
  const next = order[(order.indexOf(shown) + 1) % order.length]
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
      const other = differs(cardMedia, media)
      const crop = cardMedia.firstElementChild.style.transform
      if (other) {
        const g = ghost(cardMedia)
        media.append(g)
        const fade = g.animate(
          [{ opacity: 1, transform: crop }, { opacity: 1, offset: 0.2 }, { opacity: 0, offset: 0.75 }, { opacity: 0, transform: 'none' }],
          { ...opts, fill: 'forwards' }
        )
        fade.finished.then(() => g.remove(), () => {})
        anims.push({ cancel: () => (fade.cancel(), g.remove()) })
      } else if (cv && pv) {
        // The page's video is new and still loading: the card's frame flies on
        // top of it until it catches up.
        const t = cv.currentTime
        const frame = still(cv)
        if (frame) pv.after(frame)
        pv.currentTime = t
        const stop = whenAt(pv, t, () => frame?.remove())
        anims.push({ cancel: () => (stop(), frame?.remove()) })
      }
      const o = origin(media)
      anims.push(media.animate([box(source, o), box(target, o)], opts))
      // From the card's crop (its parallax zoom) to the page's.
      media.querySelectorAll('.pm-layer > *').forEach((el) =>
        anims.push(el.animate([{ transform: crop }, { transform: 'none' }], opts))
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
    const other = card && differs(cardMedia, media)
    if (card) {
      lift(card)
      scatter(card)
      const slot = cardMedia.getBoundingClientRect()
      const o = origin(media)
      anims.push(media.animate([box(media.getBoundingClientRect(), o), box(slot, o)], opts))
      // Landing as the card's own picture.
      if (other) {
        const g = ghost(cardMedia)
        media.append(g)
        anims.push(
          g.animate([{ opacity: 0, transform: 'none' }, { opacity: 0, offset: 0.25 }, { opacity: 1, offset: 0.8 }, { opacity: 1, transform: crop }], opts)
        )
      }
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
      if (pv && cv && !other) {
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
        delay: Math.min(i, 10) * 40,
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
        delay: Math.min(i, 10) * 65,
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

  // Labels are the same for every project and stay; values swap. Rows a
  // project doesn't have go out (and come in) whole. With shots, the table
  // sits among them, beside the last.
  const facts = (
    <dl {...rv(4, 'pr-facts')}>
      <div>
        <dt>{t.year}</dt>
        <dd {...sw}>{p.year}</dd>
      </div>
      <div>
        <dt>{t.status}</dt>
        <dd {...sw}>{p.status}</dd>
      </div>
      <div>
        <dt>{t.role}</dt>
        <dd {...sw}>{p.role}</dd>
      </div>
      {p.tools && (
        <div key="stack" {...sw}>
          <dt>{t.stack}</dt>
          <dd>{p.tools.join(', ')}</dd>
        </div>
      )}
      {p.url && (
        <div key="web" {...sw}>
          <dt>{t.web}</dt>
          <dd>
            <a className="link" href={p.url} target="_blank" rel="noreferrer">
              {p.url.replace(/^https?:\/\//, '')}
              <svg viewBox="0 0 16 16" aria-hidden>
                <path d="M4 12 12 4M4 4h8v8" fill="none" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            </a>
          </dd>
        </div>
      )}
    </dl>
  )

  const lead = (
    <p {...rv(3, 'pr-lead')}>
      <span {...sw}>{marked(p.intro)}</span>
    </p>
  )

  const media = (
    <div className="pm" ref={mediaRef}>
      {layers.map((i) => (
        <div className="pm-layer" key={i}>
          <Media p={seen(i)} decorative={i !== index} />
        </div>
      ))}
    </div>
  )

  return (
    <div className="proj" ref={rootRef} style={{ '--base': base }} role="dialog" aria-label={p.title}>
      {/* Fixed on the left; in the flow it sits in its slot under the title. */}
      {!flow && media}

      <button type="button" {...rv(0, 'back')} onClick={onBack} aria-label={t.back}>
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M13 8H3m4.5-4.5L3 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </button>

      <article className={flow ? 'pr is-flow' : 'pr'} ref={scrollRef} style={flow ? { '--ratio': ratio } : undefined}>
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
              {flow && (
                <div className="pr-slot">
                  {media}
                </div>
              )}
              {flow ? (
                // The description on the left gutter, the site on the right one.
                <div className="pr-about">
                  {lead}
                  {/* The paragraph's name, between it and the site. */}
                  {p.introLabel && (
                    <h2 key={p.introLabel} {...sw} {...rv(3, 'pr-about-label')}>
                      {p.introLabel}
                    </h2>
                  )}
                  {p.url && (
                    <a key={p.url} {...sw} {...rv(3, 'pr-url link')} href={p.url} target="_blank" rel="noreferrer">
                      {p.url}
                      <svg viewBox="0 0 16 16" aria-hidden>
                        <path d="M4 12 12 4M4 4h8v8" fill="none" stroke="currentColor" strokeWidth="1.3" />
                      </svg>
                    </a>
                  )}
                </div>
              ) : (
                lead
              )}

              {/* Sample shots, scattered over the page's grid; they come and go
                  whole with the project that has them. */}
              {flow && p.shots && (
                <div key="shots" {...sw} {...rv(4, 'pr-shots')}>
                  {p.shots.map((s, i) => (
                    <Shot key={i} s={s} />
                  ))}
                  {/* Paragraphs among the shots, each under its own. Last in the
                      DOM so the shots keep their places. */}
                  {p.notes?.map((n, i) => (
                    <div key={n.heading} className={`pr-note n${i + 1}`}>
                      <h2>{n.heading}</h2>
                      <p>{marked(n.text)}</p>
                    </div>
                  ))}
                  {facts}
                </div>
              )}

              {!(flow && p.shots) && facts}
            </div>

            {p.sections.map((s, i) => (
              <section key={i} {...rv(5 + i, 'pr-block')}>
                <h2 {...sw}>{s.heading}</h2>
                <p {...sw}>{marked(s.text)}</p>
              </section>
            ))}

            {order.length > 1 && (
              <button
                type="button"
                onClick={() => busy.current || onNext()}
                {...rv(5 + p.sections.length, 'pr-next')}
              >
                <span className="pr-next-label">{t.next}</span>
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
