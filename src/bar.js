// The project view starts just below the menu row; the bio above it hides there.
// Called on resize and by Project right before it measures, since hiding the bio
// (mobile) changes the edge in the same commit that opens the project.
export function syncBarHeight() {
  // Layout offsets, not rects: the menu animates its transform on mobile and the
  // edge must not move with it. The bar is fixed at the top, so offsets are y.
  const bar = document.querySelector('.bar')
  const nav = bar.querySelector('.nav')
  const rows = [nav, bar.querySelector('.clock')]
  const bottom = Math.max(...rows.map((el) => el.offsetTop + el.offsetHeight))
  const root = document.documentElement.style
  root.setProperty('--nav-mid', `${nav.offsetTop + nav.offsetHeight / 2}px`)
  root.setProperty('--bar-h', `${bottom + nav.offsetTop}px`)
}
