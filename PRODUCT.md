# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React (user's choice), deployed on Vercel from `main` (`vercel.json` rewrites every route to the SPA). No scroll or animation library: a custom requestAnimationFrame engine drives the carousel, and the page transitions use the Web Animations API, so motion is fully controlled. Fonts: Figtree (via @fontsource, bundled) and Lora (Google Fonts). The GT Walsheim trial files in `src/fonts/` are not licensed for publishing and are not used.

## Users

Two audiences, weighted equally:

- **Hiring:** recruiters and product teams evaluating a Front-end Developer for a staff role.
- **Clients:** studios and clients commissioning design and development work.

Both skim fast, mostly on desktop and often on a phone. They decide from the work itself and from how the site behaves.

## Product Purpose

Adrián García's personal portfolio. Success means the visitor moves through the work, opens a project, and writes an email (`hello.adrian.gar@gmail.com`). The email is the single conversion.

## Positioning

The site is itself the proof of front-end craft. The motion (the inertial carousel, cards becoming the project page, pages that recycle their content instead of reloading) demonstrates what the portfolio sells: a developer with a product-design background who cares as much about the implementation as about the experience.

## Operating Context

- Routes: `/` home (carousel), `/proyecto/:slug` project pages, `/about`, and a 404 page for anything else.
- Visitors arrive from links shared in applications, DMs and CVs, often deep-linked straight to a project.

## Capabilities and Constraints

- Home layout pinned by the user: an upper area mostly empty (bio, menu, local time, name) and a horizontal project carousel below with smooth scroll, glide, and cards that shrink and spread with speed. Reference given by the user: brandonyasin.com.
- Only real projects. No demo or placeholder entries.
- Mobile is a first-class target: every change is designed and checked at phone width.
- **Open decision:** the site is to become **bilingual (English + Spanish)**. The copy is English today, and the mechanism (selector, routes) is not decided yet.
- **Open:** Beside's year, status and stack; Dakubo's stack and status (marked `confirmar` in `src/projects.js`).

## Brand Commitments

- Name: Adrián García. Role: Front-end developer with a background in product design.
- Based in Manises, Valencia; the local time is shown as Valencia.
- Voice: first person, plain, precise, with no hype. Key phrases are marked with the lime marker, never with bold.

## Evidence on Hand

- **Projects** (`src/projects.js`, media in `public/projects/` with content-hashed filenames; a video's poster is its first frame):
  - **Beside:** macOS app that organises work in modes, with an AI that knows each mode and specialised agents. Video. No domain yet.
  - **Mockp:** a Pinterest of mockups (React, Vite, Supabase, Stripe). Image. mockp.com. Currently being built.
  - **Dakubo:** website of a web and app agency, with portfolio, services and a budget calculator. The logo, interface, motion and code are by Adrián. Video. dakubo.com.
- **About** (`src/about.js`, from the CV): skills; education at UOC (Computer Engineering, ongoing) and DAM (IES Álvaro Falomir); certificates from Google UX (in progress), IBM UX Design Fundamentals and Anthropic Claude 101.
- **Absent:** no testimonials, client logos, metrics, press or awards. Do not invent them.

## Product Principles

1. **The work leads:** the projects are the page, and the interface recedes around them.
2. **Motion is the argument:** every transition must be continuous and flicker-free, with nothing jumping or overlapping. A visible glitch costs more than a missing feature.
3. **Phone equals desktop:** a flow isn't done until it works at phone width.
4. **Only what's true:** no fabricated clients, numbers or projects.
5. **One clear way to reach out:** every path ends one step away from the email.

## Accessibility & Inclusion

Respect `prefers-reduced-motion` (all motion has a reduced path). Keyboard: Escape closes a project, the arrow keys move the carousel, and focus brings a card into view.
