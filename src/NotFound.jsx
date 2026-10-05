import { useEffect } from 'react'
import { projects, site } from './projects.js'

// Any address the site doesn't know. Its links are real navigations: each page
// they lead to plays its own entrance from a clean start.
export default function NotFound() {
  useEffect(() => {
    const was = document.title
    document.title = `Not found — ${site.name}`
    return () => void (document.title = was)
  }, [])

  return (
    <main className="nf">
      <div className="nf-in">
        <p className="nf-code">404</p>
        <h1 className="nf-title">Nothing here.</h1>
        <p className="nf-lead">
          <span className="nf-path">{location.pathname}</span> doesn't exist — it may have moved, or never been.
        </p>
        <div className="nf-row">
          <a className="nf-home" href="/">
            <mark>Back to the work</mark>
            <svg viewBox="0 0 16 16" aria-hidden>
              <path d="M3 8h10M8.5 3.5L13 8l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </a>
          <p className="nf-or">
            Or straight to{' '}
            {projects.map((p, i) => (
              <span key={p.slug}>
                <a className="link" href={`/proyecto/${p.slug}`}>
                  {p.title}
                </a>
                {i < projects.length - 2 ? ', ' : i === projects.length - 2 ? ' or ' : '.'}
              </span>
            ))}
          </p>
        </div>
      </div>
    </main>
  )
}
