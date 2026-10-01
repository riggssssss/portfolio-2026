// The project view starts just below the menu row; the bio above it hides there.
// Called on resize and by Project right before it measures, since hiding the bio
// (mobile) changes the edge in the same commit that opens the project.
export function syncBarHeight() {
  const bar = document.querySelector('.bar')
  const rows = [bar.querySelector('.nav'), bar.querySelector('.clock')]
  const bottom = Math.max(...rows.map((el) => el.getBoundingClientRect().bottom))
  document.documentElement.style.setProperty('--bar-h', `${bottom + bar.getBoundingClientRect().top + rows[0].offsetTop}px`)
}
