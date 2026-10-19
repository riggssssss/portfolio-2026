// Under the pointer any picture turns to text: where it passes, characters in
// the picture's own colours, picked by brightness (light → dense), rise over
// it and melt back as the trail fades. Videos read their live frame. One canvas over the
// whole site, never in the way of a click; only where there is a real hover.

const RAMP = ' .·:;-~=+*×#%&@' // symbols only, no letters
const CW = 7 // cell, px
const CH = 11
const FONT = '600 10px ui-monospace, SFMono-Regular, Menlo, monospace'
const R = 110 // brush radius, px
const LIFE = 700 // ms a trail point lasts
const SHIFT = 0.15 // how much darker a letter is than the picture under it

export function initAscii() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return

  const cv = document.createElement('canvas')
  cv.setAttribute('aria-hidden', '')
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2'
  document.body.append(cv)
  const ctx = cv.getContext('2d')
  const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  let dpr = 1
  const size = () => {
    dpr = Math.min(2, devicePixelRatio || 1)
    cv.width = innerWidth * dpr
    cv.height = innerHeight * dpr
  }
  size()
  addEventListener('resize', size)

  // Each picture keeps its own trail, as fractions of its size, so the letters
  // stay on the picture while it moves or grows.
  const trails = new Map()
  const posters = new Map()
  let raf = 0

  const source = (el) => {
    if (el.tagName === 'IMG') return el.complete && el.naturalWidth ? [el, el.naturalWidth, el.naturalHeight] : null
    if (el.readyState >= 2) return [el, el.videoWidth, el.videoHeight]
    // Not playing yet: what shows is the poster.
    if (!el.poster) return null
    let p = posters.get(el.poster)
    if (!p) posters.set(el.poster, (p = new Image())), (p.src = el.poster)
    return p.complete && p.naturalWidth ? [p, p.naturalWidth, p.naturalHeight] : null
  }

  // The part of the picture actually on screen: inside every box that clips it.
  const visible = (el, r) => {
    let [l, t, ri, b] = [r.left, r.top, r.right, r.bottom]
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      if (getComputedStyle(a).overflow === 'visible') continue
      const c = a.getBoundingClientRect()
      l = Math.max(l, c.left), t = Math.max(t, c.top), ri = Math.min(ri, c.right), b = Math.min(b, c.bottom)
    }
    return [l, t, ri, b]
  }

  const draw = () => {
    raf = 0
    const now = performance.now()
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, innerWidth, innerHeight)
    ctx.font = FONT
    ctx.textBaseline = 'top'

    for (const [el, pts] of trails) {
      while (pts.length && now - pts[0].t > LIFE) pts.shift()
      const src = el.isConnected && pts.length && source(el)
      if (!src) {
        trails.delete(el)
        continue
      }
      const r = el.getBoundingClientRect()
      const cols = Math.ceil(r.width / CW)
      const rows = Math.ceil(r.height / CH)
      if (!cols || !rows) continue

      // Shrink the picture to one pixel per cell, cropped the way object-fit: cover crops it.
      const [img, nw, nh] = src
      const k = Math.max(r.width / nw, r.height / nh)
      const sw = r.width / k
      const sh = r.height / k
      probe.canvas.width = cols
      probe.canvas.height = rows
      let px
      try {
        probe.drawImage(img, (nw - sw) / 2, (nh - sh) / 2, sw, sh, 0, 0, cols, rows)
        px = probe.getImageData(0, 0, cols, rows).data
      } catch {
        trails.delete(el) // another origin's picture: it can't be read
        continue
      }

      // Its own range of light, stretched over the whole ramp (dark pictures
      // would otherwise only ever reach the thin letters).
      let lo = 1, hi = 0
      for (let o = 0; o < px.length; o += 4) {
        const v = (0.299 * px[o] + 0.587 * px[o + 1] + 0.114 * px[o + 2]) / 255
        lo = Math.min(lo, v), hi = Math.max(hi, v)
      }
      const span = Math.max(0.1, hi - lo)

      const [l, t, ri, b] = visible(el, r)
      ctx.save()
      ctx.beginPath()
      ctx.rect(l, t, ri - l, b - t)
      ctx.clip()

      // Only the cells the trail can reach.
      const at = pts.map((p) => ({ x: p.u * r.width, y: p.v * r.height, t: p.t }))
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
      for (const p of at) x0 = Math.min(x0, p.x), y0 = Math.min(y0, p.y), x1 = Math.max(x1, p.x), y1 = Math.max(y1, p.y)
      const c0 = Math.max(0, Math.floor((x0 - R) / CW))
      const c1 = Math.min(cols - 1, Math.ceil((x1 + R) / CW))
      const r0 = Math.max(0, Math.floor((y0 - R) / CH))
      const r1 = Math.min(rows - 1, Math.ceil((y1 + R) / CH))
      const sx = r.width / cols // cells stretch a hair to land on the edges
      const sy = r.height / rows

      for (let j = r0; j <= r1; j++) {
        for (let i = c0; i <= c1; i++) {
          const cx = (i + 0.5) * sx
          const cy = (j + 0.5) * sy
          let s = 0
          for (const p of at) {
            const d = Math.hypot(cx - p.x, cy - p.y)
            if (d < R) s = Math.max(s, (1 - d / R) * (1 - (now - p.t) / LIFE))
          }
          // A ragged edge: each cell has its own threshold, so the brush dithers out.
          const h = ((i * 73856093) ^ (j * 19349663)) >>> 0
          if (s < 0.08 + (h % 1000) / 1000 * 0.35) continue
          const o = (j * cols + i) * 4
          const [cr, cg, cb] = [px[o], px[o + 1], px[o + 2]]
          const lum = (0.299 * cr + 0.587 * cg + 0.114 * cb) / 255
          const x = r.left + i * sx
          const y = r.top + j * sy
          const ch = RAMP[Math.min(RAMP.length - 1, Math.floor(((lum - lo) / span) * RAMP.length))]
          if (ch === ' ') continue
          // The picture's own colour, a touch darker, so the letter doesn't
          // vanish into what's under it.
          const dk = 1 - SHIFT
          ctx.fillStyle = `rgb(${cr * dk} ${cg * dk} ${cb * dk})`
          ctx.fillText(ch, x + (sx - 6) / 2, y + (sy - 10) / 2)
        }
      }
      ctx.restore()
    }
    if (trails.size) raf = requestAnimationFrame(draw)
  }

  addEventListener(
    'pointermove',
    (e) => {
      const el = e.target
      if ((el.tagName !== 'IMG' && el.tagName !== 'VIDEO') || el.closest('[data-no-ascii]')) return
      const r = el.getBoundingClientRect()
      let pts = trails.get(el)
      if (!pts) trails.set(el, (pts = []))
      pts.push({ u: (e.clientX - r.left) / r.width, v: (e.clientY - r.top) / r.height, t: performance.now() })
      if (pts.length > 40) pts.shift()
      raf ||= requestAnimationFrame(draw)
    },
    { passive: true }
  )
}
