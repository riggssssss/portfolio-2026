import { useEffect } from 'react'
import { projects, site } from './projects.js'
import { useT } from './i18n.js'

// Any address the site doesn't know. Its links are real navigations: each page
// they lead to plays its own entrance from a clean start.
export default function NotFound() {
  const t = useT()
  useEffect(() => {
    const was = document.title
    document.title = `${t.nfTitle} · ${site.name}`
    return () => void (document.title = was)
  }, [t])

  return (
    <main className="nf">
      <div className="nf-in">
        <p className="nf-code">404</p>
        <h1 className="nf-title">{t.nfHead}</h1>
        <p className="nf-lead">
          <span className="nf-path">{location.pathname}</span> {t.nfLead}
        </p>
        <div className="nf-row">
          <a className="nf-home" href="/">
            <mark>{t.nfBack}</mark>
            <svg viewBox="0 0 16 16" aria-hidden>
              <path d="M3 8h10M8.5 3.5L13 8l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </a>
          <p className="nf-or">
            {t.nfOr}{' '}
            {projects.map((p, i) => (
              <span key={p.slug}>
                <a className="link" href={`/proyecto/${p.slug}`}>
                  {p.title}
                </a>
                {i < projects.length - 2 ? ', ' : i === projects.length - 2 ? ` ${t.or} ` : '.'}
              </span>
            ))}
          </p>
        </div>
      </div>
    </main>
  )
}
