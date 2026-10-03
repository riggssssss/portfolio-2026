import { useEffect, useRef, useState } from 'react'

// Feel. Lower LERP = more glide.
const LERP = 0.07
const WHEEL = 1.15
const DRAG = 1.4
const THROW = 220 // ms of release velocity carried forward
const SCALE_DROP = 0.18 // max shrink at full speed
const SPREAD = 0.2 // how far cards drift from the center at full speed
const SPEED_MAX = 38 // px/frame that counts as full speed
const GROW = 0.1 // hovered card grows up to this much (capped by the headroom); its neighbours make room

const wrap = (min, max, v) => {
  const r = max - min
  return ((((v - min) % r) + r) % r) + min
}

// The landing intro: the strip arrives from the left this many viewports away
// and glides in on its own inertia, shrinking and spreading like any fast scroll.
const INTRO = 1.3
const INTRO_LERP = 0.032 // calmer glide for the intro only

export default function Carousel({ items, onOpen, locked, intro }) {
  const trackRef = useRef(null)
  // Position outlives the engine, which restarts when the copy count changes.
  const posRef = useRef(null)
  const lockedRef = useRef(locked)
  lockedRef.current = locked
  const [repeat, setRepeat] = useState(2)

  // Enough copies that the loop never shows its seam.
  useEffect(() => {
    const fit = () => {
      const card = trackRef.current?.firstElementChild
      if (!card) return
      const step = card.offsetWidth * 1.1
      setRepeat(Math.max(2, Math.ceil((innerWidth + step * 3) / (items.length * step))))
    }
    fit()
    addEventListener('resize', fit)
    return () => removeEventListener('resize', fit)
  }, [items.length])

  useEffect(() => {
    const track = trackRef.current
    const cards = [...track.children]
    const media = cards.map((c) => c.querySelector('.card-media').firstElementChild)
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    // Mouse: hover drives the card. Touch: the centered card does.
    const byHover = matchMedia('(hover: hover)').matches

    let step, cardW, total, vw, lefts, growMax
    const measure = () => {
      // Growth fills the headroom above the cards and never reaches the name.
      growMax = Math.min(GROW, (track.clientHeight - cards[0].offsetHeight - 6) / cards[0].offsetHeight)
      lefts = cards.map((c) => c.offsetLeft)
      step = lefts[1] - lefts[0]
      cardW = cards[0].offsetWidth
      total = step * cards.length
      vw = innerWidth
    }
    measure()

    if (!posRef.current) {
      const start = intro && !reduce ? innerWidth * INTRO : 0 // moving left → right
      posRef.current = { current: start, target: 0 }
    }
    let current = posRef.current.current
    let target = posRef.current.target
    // Until the intro glide settles (or the visitor takes over), it eases slower.
    let gliding = current !== target
    let intensity = 0
    let dirty = true
    let hovered = -1 // index into `cards`
    const grow = cards.map(() => 0)
    const videos = cards.map((c) => c.querySelector('video'))
    let playing = null
    let active = -1

    // Only one card plays: the hovered one (mouse) or the centered one (touch).
    // It's also the one whose name lights up.
    const play = (i) => {
      if (i !== active) {
        cards[active]?.classList.remove('is-active')
        cards[i]?.classList.add('is-active')
        active = i
      }
      const v = videos[i] ?? null
      if (v === playing) return
      const prev = playing
      playing = v // first, so the pause below isn't taken for an unwanted one
      prev?.pause()
      resume()
    }
    // Phones may refuse a play() that isn't inside a gesture (iOS low power),
    // or pause on their own: the active video is retried on every touch or
    // click, on coming back to the tab, and whenever it stops unasked.
    const resume = () => {
      if (playing && playing.paused && !document.hidden && !lockedRef.current) playing.play().catch(() => {})
    }
    const onVideoPause = (e) => e.target === playing && setTimeout(resume, 0)
    videos.forEach((v) => v?.addEventListener('pause', onVideoPause))
    document.addEventListener('visibilitychange', resume)
    addEventListener('touchend', resume, { passive: true })
    addEventListener('pointerdown', resume)

    // Wheel: vertical or horizontal deltas both drive the strip.
    const onWheel = (e) => {
      if (lockedRef.current) return
      e.preventDefault()
      let d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      if (e.deltaMode === 1) d *= 16
      target += d * WHEEL
    }

    // Drag with throw.
    let down = false, lastX = 0, lastT = 0, vel = 0, moved = 0
    const onDown = (e) => {
      if (e.button !== 0 || lockedRef.current) return
      down = true
      moved = 0
      vel = 0
      lastX = e.clientX
      lastT = performance.now()
      track.classList.add('is-dragging')
    }
    const onMove = (e) => {
      if (!down) return
      const now = performance.now()
      const dx = e.clientX - lastX
      moved += Math.abs(dx)
      vel = vel * 0.6 + (dx / Math.max(now - lastT, 1)) * 0.4
      target -= dx * DRAG
      lastX = e.clientX
      lastT = now
    }
    const onUp = () => {
      if (!down) return
      down = false
      track.classList.remove('is-dragging')
      if (performance.now() - lastT < 80) target -= vel * THROW * DRAG
    }
    // A drag is not a click; a click opens the project in place.
    const onClick = (e) => {
      const card = e.target.closest('.card')
      if (!card || e.metaKey || e.ctrlKey) return
      e.preventDefault()
      if (moved > 6 || lockedRef.current) return
      onOpen?.(+card.dataset.i)
    }

    const onOver = (e) => {
      if (!byHover || down || lockedRef.current) return
      const card = e.target.closest('.card')
      if (!card) return
      hovered = cards.indexOf(card)
      play(hovered)
    }
    const onLeave = () => {
      if (!byHover || lockedRef.current) return
      hovered = -1
      play(-1)
    }

    const onKey = (e) => {
      if (lockedRef.current) return
      if (e.key === 'ArrowRight') target += step
      else if (e.key === 'ArrowLeft') target -= step
    }

    // Keyboard focus brings the card to the center.
    const onFocus = (e) => {
      const card = e.target.closest('.card')
      const i = cards.indexOf(card)
      if (i < 0) return
      const p = wrap(-step, total - step, lefts[i] - current)
      target = current + (p + cardW / 2 - vw / 2)
    }

    const onResize = () => {
      measure()
      dirty = true
    }

    addEventListener('wheel', onWheel, { passive: false })
    track.addEventListener('pointerdown', onDown)
    addEventListener('pointermove', onMove)
    addEventListener('pointerup', onUp)
    addEventListener('pointercancel', onUp)
    track.addEventListener('click', onClick)
    track.addEventListener('pointerover', onOver)
    track.addEventListener('pointerleave', onLeave)
    track.addEventListener('focusin', onFocus)
    addEventListener('keydown', onKey)
    addEventListener('resize', onResize)

    let raf
    let last = performance.now()
    const tick = (now) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min((now - last) / 16.667, 4)
      last = now

      const prev = current
      if (gliding && (Math.abs(target - posRef.current.target) > 0 || Math.abs(target - current) < 1)) gliding = false
      const lerp = reduce ? 0.25 : gliding ? INTRO_LERP : LERP
      current += (target - current) * (1 - Math.pow(1 - lerp, dt))
      posRef.current.current = current
      posRef.current.target = target
      const speed = Math.abs(current - prev) / dt
      const want = reduce ? 0 : Math.min(speed / SPEED_MAX, 1)
      intensity += (want - intensity) * (1 - Math.pow(1 - 0.09, dt))

      let growing = false
      const kg = 1 - Math.pow(1 - 0.1, dt)
      for (let i = 0; i < cards.length; i++) {
        const want = i === hovered && !down && !lockedRef.current ? 1 : 0
        grow[i] += (want - grow[i]) * kg
        if (Math.abs(want - grow[i]) > 0.001) growing = true
      }

      if (!dirty && !growing && Math.abs(target - current) < 0.05 && intensity < 0.0005) return
      dirty = false

      const e = 1 - Math.pow(1 - intensity, 2) // ease-out: responds fast, settles soft
      const scale = 1 - SCALE_DROP * e
      let nearest = 0, best = Infinity

      const ps = cards.map((_, i) => wrap(-step, total - step, lefts[i] - current))
      for (let i = 0; i < cards.length; i++) {
        const p = ps[i]
        const fromCenter = p + cardW / 2 - vw / 2
        // Every growing card pushes the others away by half its extra width.
        let push = 0
        for (let j = 0; j < cards.length; j++) {
          if (j !== i && grow[j] > 0.001) push += Math.sign(p - ps[j]) * (cardW * growMax * grow[j]) / 2
        }
        const x = p - lefts[i] + fromCenter * SPREAD * e + push
        cards[i].style.transform = `translate3d(${x}px,0,0) scale(${scale * (1 + growMax * grow[i])})`
        if (media[i]) media[i].style.transform = `translate3d(${(fromCenter / vw) * -6}%,0,0) scale(1.14)`
        const d = Math.abs(fromCenter)
        if (d < best) (best = d), (nearest = i)
      }

      if (!byHover) play(nearest)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      videos.forEach((v) => v?.removeEventListener('pause', onVideoPause))
      document.removeEventListener('visibilitychange', resume)
      removeEventListener('touchend', resume)
      removeEventListener('pointerdown', resume)
      const last = playing
      playing = null
      last?.pause()
      removeEventListener('wheel', onWheel)
      track.removeEventListener('pointerdown', onDown)
      removeEventListener('pointermove', onMove)
      removeEventListener('pointerup', onUp)
      removeEventListener('pointercancel', onUp)
      track.removeEventListener('click', onClick)
      track.removeEventListener('pointerover', onOver)
      track.removeEventListener('pointerleave', onLeave)
      track.removeEventListener('focusin', onFocus)
      removeEventListener('keydown', onKey)
      removeEventListener('resize', onResize)
    }
  }, [items, repeat, onOpen])

  const list = Array.from({ length: repeat }, () => items).flat()

  return (
    <div className="track" ref={trackRef}>
      {list.map((p, i) => {
        const clone = i >= items.length
        return (
          <a
            key={i}
            className="card"
            data-i={i % items.length}
            href={`/proyecto/${p.slug}`}
            draggable={false}
            aria-hidden={clone || undefined}
            tabIndex={clone ? -1 : undefined}
          >
            {/* What hangs and falls on the way to About (hang.js); the engine owns the card. */}
            <div className="card-hang">
              <div className="card-media">
                <Media p={p} decorative={clone} eager={i < 8} play={false} reveal preload="none" />
              </div>
              <div className="card-caption">
                <span>{p.title}</span>
              </div>
            </div>
          </a>
        )
      })}
    </div>
  )
}

// `reveal`: hidden until it has something to show, then fades in (the card's
// skeleton waits underneath). Off for project media, which must never blank.
// Cards pass preload="none": six copies of the strip would otherwise all stream
// at once and starve the one that's playing; a card loads when it plays.
export function Media({ p, decorative, eager = true, play = true, reveal = false, preload = 'auto' }) {
  const [ready, setReady] = useState(!reveal)
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    // React never writes the `muted` attribute, and Safari (iOS above all)
    // wants it, not just the property, before it lets a video play by itself.
    if (p.video) (el.muted = el.defaultMuted = true), el.setAttribute('muted', '')
    if (!reveal) return
    // Already there (cache): no fade needed beyond the first frame.
    if (el.complete || el.readyState >= 2) return setReady(true)
    // A video shows its poster first, so the poster loading is enough.
    if (p.video) {
      const img = new Image()
      img.onload = () => setReady(true)
      img.src = p.image
    }
  }, [])
  const shown = reveal ? { ref, className: ready ? 'is-ready' : 'is-waiting' } : { ref }
  const done = reveal ? () => setReady(true) : undefined

  return p.video ? (
    <video
      {...shown}
      onLoadedData={done}
      src={p.video}
      poster={p.image}
      muted
      loop
      playsInline
      autoPlay={play}
      preload={preload}
      aria-label={decorative ? undefined : p.title}
    />
  ) : (
    <img
      {...shown}
      onLoad={done}
      src={p.image}
      alt={decorative ? '' : p.title}
      draggable={false}
      loading={eager ? 'eager' : 'lazy'}
    />
  )
}
