// Home ⇄ About. The home pieces (the name, the cards on screen, "Now building")
// are bodies, not tweens. Going to About each one is let go in turn (every
// other piece first, the ones between right after): a small hop off its hook,
// then real gravity, each a touch heavier or lighter than the next. Coming back
// a spring catches each one and pulls it up onto its hook, overshooting a hair
// before it settles. Position and velocity carry over, so turning around
// mid-way just changes the force acting on everything already in flight.
//
// The About text doesn't fall: it rides a progress value that runs at constant
// speed toward its target. onFrame(p, resting): resting once every body stopped.

const TEXT = 0.8 // s, progress 0 → 1 for the About text
const G = 5200 // px/s²
const HOP = 210 // px/s upward when a piece lets go
const K = 95 // spring back onto the hook
const C = 2 * Math.sqrt(K) * 0.68 // under-damped: one soft overshoot
const STEP = 0.045 // s between pieces of one wave
const WAVE = 0.075 // s between the two waves

// Same small variation every time for the same slot, in (-amp, amp).
const jitter = (k, amp) => ((Math.sin(k * 12.9898 + 4.1) * 43758.5453) % 1) * amp

export function createHang(onFrame) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  let p = 0
  let target = 0
  let raf = 0
  let last = 0
  let clock = 0 // s since the last change of direction
  let pieces = []
  let order = 0 // longest delay, so the way back runs in reverse

  const clear = () => pieces.forEach(({ el }) => (el.style.translate = el.style.opacity = el.style.filter = ''))

  // Measured at rest on the hooks, left to right, so order and drop fit what's on screen.
  const collect = () => {
    const inView = (r) => r.right > 0 && r.left < innerWidth
    const cards = [...document.querySelectorAll('.card-hang')].map((el) => ({ el, r: el.getBoundingClientRect() }))
    const seen = cards.filter((c) => inView(c.r)).sort((a, b) => a.r.left - b.r.left)
    const list = [document.querySelector('.hero'), ...seen.map((c) => c.el), document.querySelector('.now')].filter(Boolean)
    const piece = (el, k) => ({
      el,
      y: 0,
      vy: 0,
      free: false,
      // Two interleaved waves: 0, 2, 4… then 1, 3, 5…, never on a perfect beat.
      delay: Math.max(0, (k >> 1) * STEP + (k % 2) * WAVE + jitter(k, 0.018)),
      g: G * (1 + jitter(k + 7, 0.14)),
      // Only as far as the bottom edge: all of the fall happens on screen.
      drop: innerHeight - el.getBoundingClientRect().top + 24,
    })
    const end = list.length - 1
    // Off-screen copies leave with the last one, out of sight.
    pieces = [...list.map(piece), ...cards.filter((c) => !inView(c.r)).map((c) => piece(c.el, end))]
    order = Math.max(0, ...pieces.map((q) => q.delay))
  }

  // Advances one body; true while it still moves.
  const move = (q, dt) => {
    const out = target === 1
    const due = clock >= (out ? q.delay : order - q.delay)
    if (out && due && !q.free) (q.free = true), (q.vy = -HOP)
    if (!out && due) q.free = false

    if (q.free) {
      if (q.y >= q.drop) return (q.y = q.drop), (q.vy = 0), false
      q.vy += q.g * dt
    } else {
      // On (or on its way back to) the hook.
      if (Math.abs(q.y) < 0.3 && Math.abs(q.vy) < 4) return (q.y = 0), (q.vy = 0), false
      q.vy += (-K * q.y - C * q.vy) * dt
    }
    q.y += q.vy * dt
    if (q.free && q.y > q.drop) q.y = q.drop
    return true
  }

  const paint = (resting) => {
    for (const q of pieces) {
      if (reduce) q.el.style.opacity = 1 - p
      else {
        q.el.style.translate = `0 ${q.y}px`
        // Speed smears it a little; distance from the hook fades it a little.
        const blur = Math.min(Math.abs(q.vy) / 1400, 1) * 3.5
        const away = Math.max(0, Math.min(q.y / q.drop, 1))
        q.el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : ''
        q.el.style.opacity = away > 0.002 ? (1 - 0.55 * away * away).toFixed(3) : ''
      }
    }
    onFrame(p, resting)
  }

  const tick = (now) => {
    const dt = Math.min((now - last) / 1000, 1 / 30)
    last = now
    clock += dt
    p = target > p ? Math.min(target, p + dt / TEXT) : Math.max(target, p - dt / TEXT)
    let moving = false
    if (!reduce) for (const q of pieces) moving = move(q, dt) || moving
    const resting = !moving && p === target
    paint(resting)
    if (!resting) return (raf = requestAnimationFrame(tick))
    raf = 0
    if (p === 0) clear(), (pieces = [])
  }

  return {
    to(next, instant = false) {
      if (next === target && (raf || p === target)) return
      target = next
      clock = 0
      if (!pieces.length) collect()
      if (instant) {
        cancelAnimationFrame(raf)
        raf = 0
        p = target
        for (const q of pieces) (q.free = target === 1), (q.y = q.free ? q.drop : 0), (q.vy = 0)
        paint(true)
        if (p === 0) clear(), (pieces = [])
        return
      }
      if (!raf) (last = performance.now()), (raf = requestAnimationFrame(tick))
    },
    stop: () => cancelAnimationFrame(raf),
  }
}
