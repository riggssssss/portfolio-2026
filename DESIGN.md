---
name: Adrián García — Portfolio
description: A front-end developer's working desk; the work moves, the interface stays still.
colors:
  paper: "#ececea"
  ink: "oklch(0.27 0.004 100)"
  ink-2: "oklch(0.45 0.004 100)"
  ink-3: "oklch(0.63 0.004 100)"
  tile: "#e3e3e1"
  rule: "#d2d2cf"
  highlighter-lime: "#d5ff2e"
typography:
  display:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "clamp(2.25rem, 5vw, 5.75rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "clamp(2rem, 3.4vw, 3.75rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.03em"
  signature:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "clamp(1.5rem, 2.4vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.03em"
  lead:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.75vw, 1.75rem)"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "-0.005em"
rounded:
  none: "0px"
  focus: "2px"
  pill: "999px"
spacing:
  card-gap: "clamp(4px, 0.4vw, 8px)"
  gap: "clamp(10px, 1.1vw, 18px)"
  gutter: "clamp(16px, 1.6vw, 28px)"
components:
  card:
    backgroundColor: "{colors.tile}"
    textColor: "{colors.ink-3}"
    rounded: "{rounded.none}"
  card-active:
    textColor: "{colors.ink}"
  nav-link:
    textColor: "{colors.ink-2}"
    typography: "{typography.body}"
  nav-link-current:
    textColor: "{colors.ink-2}"
    backgroundColor: "{colors.highlighter-lime}"
  link-marked:
    textColor: "{colors.ink-2}"
    backgroundColor: "{colors.highlighter-lime}"
  pill:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "0.4em 0.95em 0.45em"
---

# Design System: Adrián García — Portfolio

## Overview

**Creative North Star: "The Working Desk"**

This is the desk of a designer who writes code: a warm grey sheet of paper, three pencils of the same grey in different pressures, and one highlighter. Nothing on the desk is decorative. What matters is marked by hand, in lime, and everything else stays in pencil. The work itself (photographs and videos of real products) is the only colour that isn't a marker.

The page is mostly empty on purpose. The upper area holds a few lines of small type: the bio, the menu, the local time, the signature. The lower area holds the work strip. Density is low and the scale contrast is high: 15px interface type next to 90px serif statements, with nothing in between pretending to be important.

The motion is the craft being sold, so it follows the same rule as the desk: continuous, physical, never decorative. Things glide with inertia, fall with gravity and settle, and an element is recycled rather than rebuilt. A flicker, a jump or two things overlapping breaks the illusion that this is one continuous object, and that is treated as a defect.

**Key Characteristics:**
- Warm grey paper with three equal-step greys of the same hue; no pure black, no pure white.
- One highlighter, Highlighter Lime, drawn as a marker band under words and never as a fill or button.
- Two voices: Lora for signatures and statements, Figtree for everything you read or press.
- No boxes, no shadows, no corners. Square images, hairline rules, and empty space as structure.
- Motion with mass: inertia, gravity and springs, all continuous across views.

## Colors

A monochrome paper-and-pencil palette with a single fluorescent marker.

### Primary
- **Highlighter Lime:** the only accent. It is a marker band, not a fill:
  - used on key phrases in the bio, About and the project sections;
  - the current-page band under the menu link and its hover;
  - "Mockp" in "Now building";
  - the "Back to the work" link;
  - the text selection colour.

### Neutral
- **Paper:** the page ground everywhere, and the site's "white". Nothing sits on pure white.
- **Pencil Dark (`ink`):** content. Titles, the signature, project leads, body values, and the active card's name.
- **Pencil Mid (`ink-2`):** interface. The menu, the clock, tags, section links, and the pills' text.
- **Pencil Light (`ink-3`):** whispers. The bio, "by", "Now building", fact labels, section headings, card names at rest, and the 404 code.
- **Tile:** the ground of an image box before its picture lands, and the base of the loading skeleton.
- **Rule:** hairline dividers between fact rows and the scrollbar thumb.

The three pencils are the same warm-neutral hue (OKLCH hue 100, chroma 0.004) at lightness 0.27, 0.45 and 0.63. The steps are equal, so the hierarchy reads as pressure, not as different colours.

### Named Rules
**The One Highlighter Rule.** Highlighter Lime appears only as a marker band (a gradient stripe from 62% to 92% of the line height, under the text) or as the selection colour. It is never a button fill, a background panel, a border or text colour. On any screen it marks a handful of words, not regions.

**The Three Pencils Rule.** Every piece of text uses one of the three inks; there are no other greys or opacity hacks. Pick by role: content is `ink`, interface is `ink-2`, whisper is `ink-3`. State changes move one step (a card name goes from `ink-3` to `ink` when active); they never change weight.

## Typography

**Display Font:** Lora (with Georgia, serif)
**Body Font:** Figtree Variable (with system-ui, sans-serif)

**Character:** Lora is the hand-signed part: the signature, project titles, the About statement, the 404. Figtree is the typed part, quiet and even. The pairing reads as a signed technical sheet.

### Hierarchy
- **Display** (Lora 400, clamp(2.25rem → 5.75rem), line-height 0.98, letter-spacing −0.035em): the About statement and the 404 "Nothing here." One per page, sitting low on the first screen.
- **Headline** (Lora 400, clamp(2rem → 3.75rem), line-height 1): the project title, the next-project title, and the closing email on About.
- **Signature** (Lora 400, clamp(1.5rem → 2.5rem), line-height 1): "Adrián García" on the home, baseline-aligned with "Now building" on the strip's edge. "by" before it is body size in Pencil Light.
- **Lead** (Figtree 400, clamp(1.25rem → 1.75rem), line-height 1.2, letter-spacing −0.02em, max 32ch): the project intro, the About lead and the 404 explanation. On phones the project section text also takes this size, with headings at 18px.
- **Body** (Figtree 400, 15px, line-height 1.35): everything else, including the bio, menu, clock, card names, facts and section text on desktop. There is one size for all small type.

### Named Rules
**The One Small Size Rule.** All small type is 15px Figtree 400. Hierarchy among small things comes from the three pencils and from position, never from a 13px/14px/16px ladder or from bold.

**The No-Bold Rule.** Weight never changes, not even on hover or for the current state. Emphasis is the lime marker; importance is ink pressure.

**The Serif Signs Rule.** Lora is only for names and statements (a person's, a project's, the page's thesis). It never sets UI, labels or paragraphs.

## Layout

The page is a sheet with one gutter (`clamp(16px, 1.6vw, 28px)`) on every edge, and the gap between the name and the strip is that same gutter.

- **Home:** the upper area holds the header bar and, at its bottom edge, the signature line. The strip takes `58svh` at the bottom. The header is a four-column grid: the bio spans columns 1–2 (max 62ch), the menu is in column 3 and the clock in column 4, right-aligned.
- **Project:** two fixed halves under the bar. The media fills the left half to the bottom gutter; the text column scrolls on the right. Its first screen holds the title, tags, lead and the facts table, sitting on the media's bottom edge. The sections start below the fold. Facts and sections use a 1fr / 2fr label/value grid.
- **About and 404:** the statement sits low on the first screen, where the work would be. Rows reuse the bar's four columns, so the lead sits under the bio and the facts under the menu.
- **Phone (≤760px):**
  - The bar is one column: the bio, then the menu, which sits midway between the bio and the strip.
  - Inside a project the menu moves to the top right and the back arrow to the top left.
  - Project media is pinned at 46svh on top, and the text sheet scrolls up over it.
  - The signature scales with the viewport so it stays on one line with "Now building", down to 360px.

**The Same Gutter Rule.** Edges, the name-to-strip gap, and the space under media all use the one gutter. A new surface introduces no new margin.

## Elevation & Depth

Completely flat. There are no shadows anywhere; depth comes from layering and motion. A project page lies over the home; the next project's media falls like a curtain over the current one; cards shrink and drift apart as they speed up. A hairline Rule and empty space separate content; nothing is raised.

**The Flat Desk Rule.** Nothing has a shadow, glow or blur at rest. Blur exists only as motion blur on falling pieces (About), proportional to speed.

## Shapes

Square. Images and their boxes have sharp corners (0px), and so do the facts table and dividers. The two exceptions are functional: the focus outline (2px radius, 1.5px ink outline offset 4px), and the skill pills on About (999px, a 1px Rule border), which are the only closed outlines on the site.

## Components

### Work Strip and Cards
The signature component.
- **Cards:** portrait boxes with sharp corners and the Tile ground. Each picture fades in as it loads, and a soft sweep plays over the Tile if loading takes more than 0.6s.
- **Names:** sit under each card in body type, Pencil Light at rest and Pencil Dark when active (hovered with a mouse, centred on touch). Only the active card plays its video.
- **Motion:**
  - A requestAnimationFrame engine with lerp glide (0.07), wheel, drag and throw.
  - At speed, cards shrink up to 18% and spread from the centre.
  - The hovered card grows into the headroom above (up to 10%) and pushes its neighbours aside.
  - The intro slides the strip in from the left on a slower glide.

### Card → Project Transition
- **Opening:** the card's media box flies (FLIP, WAAPI, `cubic-bezier(0.5, 0, 0.2, 1)`, 1050ms) into the project's media slot. The other cards fall out and away, nearest first.
- **Closing:** the media flies back and the cards rise.
- **Continuity:** the crop (the card's parallax zoom) and the video frame are handed over exactly; a still of the current frame covers the incoming video until it shows the same frame. Video posters are always frame 0.

### Project → Project
The page is recycled, not rebuilt.
- **Media:** the next media falls like a curtain inside the media frame.
- **Text:** each piece fades out top-down, swaps its content while invisible, and fades back in place.
- **Unchanged:** labels that don't change stay put.
- **Scroll:** the column glides to the top meanwhile.

### Navigation
- **Style:** body type in Pencil Mid; the links are words, not buttons.
- **Current page:** a permanent Highlighter Lime marker band under the link. The same band draws in from the left on hover.
- **Back:** a bare arrow, 28–40px, at the menu's line, which nudges 5px left on hover.

### Links and Marks
- **Marked link:** the text sits on a lime marker band, and hover fills the whole line in lime ("Now building Mockp", "Back to the work").
- **Plain link:** a hairline underline that draws in on hover, with a small ↗ arrow for external links.

### Facts Table
Label/value rows separated by hairline Rules. Labels are Pencil Light and values Pencil Dark, both in body type.

### Pills (About skills)
These are the only rounded, outlined elements: 999px radius, a 1px Rule border, and Pencil Mid text at 15–18px.

### Motion Tokens
- **ease-out** `cubic-bezier(0.16, 1, 0.3, 1)`: entrances, text, hover.
- **ease-io** `cubic-bezier(0.5, 0, 0.2, 1)`: shared-element flights and curtains. It is deliberately gentle; a steeper in-out reads as mechanical.
- **Entrances:** staggered and uneven (for example 1.0s, 1.4s, 1.7s, 2.0s, 2.25s), rising 14px with a fade.
- **prefers-reduced-motion:** every motion has a 1ms or instant path.

## Do's and Don'ts

### Do:
- **Do** mark at most a few phrases per block with the lime marker band, written as `*word*` in content.
- **Do** keep all small type at 15px Figtree 400 and express hierarchy with the three pencils.
- **Do** use Lora only for names and statements, set low on the first screen.
- **Do** make every view change continuous: shared elements fly, text recycles in place, and nothing is rebuilt in view.
- **Do** design and check every change at phone width (360–390px) as well as desktop.
- **Do** export every video's poster from its first frame, and give media files content-hashed names.

### Don't:
- **Don't** use bold, or change weight on hover or for the current state.
- **Don't** use Highlighter Lime as a fill, button, border or text colour.
- **Don't** add shadows, rounded corners on media, cards with borders, or gradient panels.
- **Don't** use pure black (#000) or pure white (#fff), or greys outside the three pencils.
- **Don't** let two elements share a place during a transition. Each must leave before the next arrives on the same line.
- **Don't** add placeholder projects, client logos, metrics or testimonials that aren't real.
