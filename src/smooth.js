// Wheel scrolling with glide for a scroll container: the wheel moves a target,
// the view eases toward it. Touch keeps the native momentum.
const LERP = 0.075
const WHEEL = 0.9

// `area` is where the wheel is heard (defaults to the container itself).
export function smoothScroll(el, area = el) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}
  let target = el.scrollTop
  let current = target
  let raf = 0

  const max = () => el.scrollHeight - el.clientHeight

  const tick = () => {
    current += (target - current) * LERP
    if (Math.abs(target - current) < 0.5) current = target
    el.scrollTop = current
    raf = current === target ? 0 : requestAnimationFrame(tick)
  }

  const onWheel = (e) => {
    if (e.ctrlKey) return // pinch zoom
    e.preventDefault()
    const step = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? el.clientHeight : 1
    if (!raf) current = el.scrollTop
    target = Math.max(0, Math.min(max(), target + e.deltaY * step * WHEEL))
    if (!raf) raf = requestAnimationFrame(tick)
  }

  // Keyboard, scrollbar or touch moved it: follow instead of fighting.
  const onScroll = () => {
    if (!raf) target = current = el.scrollTop
  }

  area.addEventListener('wheel', onWheel, { passive: false })
  el.addEventListener('scroll', onScroll, { passive: true })
  return () => {
    cancelAnimationFrame(raf)
    area.removeEventListener('wheel', onWheel)
    el.removeEventListener('scroll', onScroll)
  }
}
