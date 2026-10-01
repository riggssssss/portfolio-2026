import { useEffect, useRef } from 'react'
import { about } from './about.js'
import { site } from './projects.js'
import { marked } from './marked.jsx'
import { smoothScroll } from './smooth.js'

// The page arrives as the home pieces fall (hang.js). Each line reads the same
// progress (--ap) and comes in at its own point of it, so it leaves the same way.
const at = (i, cls = '') => ({ className: `${cls} ar`.trimStart(), style: { '--at': Math.min(0.5 + i * 0.04, 0.75) } })

function Entry({ e, i }) {
  return (
    <div {...at(i, 'ab-entry')}>
      {e.dates && <p className="ab-dates">{e.dates}</p>}
      <div className="ab-body">
        <h3>
          {e.place} <span>{e.role}</span>
        </h3>
        {e.note && <p className="ab-note">{e.note}</p>}
      </div>
    </div>
  )
}

function Block({ title, i, children }) {
  return (
    <section className="ab-block">
      <h2 {...at(i)}>{title}</h2>
      <div className="ab-list">{children}</div>
    </section>
  )
}

export default function About({ active, rootRef }) {
  const scrollRef = useRef(null)
  useEffect(() => smoothScroll(scrollRef.current, window), [])

  return (
    <div className={active ? 'ab is-on' : 'ab'} ref={rootRef} inert={active ? undefined : true}>
      <article className="ab-scroll" ref={scrollRef} aria-label="About">
        <div className="ab-intro">
          <h1 {...at(0)}>{about.title}</h1>
          <div className="ab-row">
            <p className="ab-lead ar" style={{ '--at': 0.58 }}>
              {marked(about.lead)}
            </p>
            <dl className="ab-facts ar" style={{ '--at': 0.62 }}>
              {about.facts.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
              <div>
                <dt>Email</dt>
                <dd>
                  <a className="link" href={`mailto:${site.email}`}>
                    {site.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <section className="ab-block">
          <h2 {...at(9)}>Skills</h2>
          <ul {...at(10, 'ab-pills')}>
            {about.skills.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>

        <Block title="Education" i={11}>
          {about.education.map((e) => (
            <Entry key={e.place} e={e} i={12} />
          ))}
        </Block>

        <Block title="Certificates" i={12}>
          {about.certificates.map((e) => (
            <Entry key={e.role} e={{ ...e, dates: e.place, place: e.role, role: null }} i={13} />
          ))}
        </Block>

        <footer className="ab-close ar" style={{ '--at': 0.75 }}>
          <p className="ab-close-label">Say hello</p>
          <a className="ab-mail" href={`mailto:${site.email}`}>
            <mark>{site.email}</mark>
          </a>
        </footer>
      </article>
    </div>
  )
}
