# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start Vite dev server (localhost:5173)
npm run build      # tsc + vite build → dist/
npm run preview    # preview the production build locally
```

No test suite exists. No linter is configured beyond TypeScript type-checking (`tsc` runs as part of build).

**Restart the dev server after touching `tailwind.config.js`.** A config change made while the server is running is not always picked up, and the symptom is silent: a new utility class simply does nothing and the element falls back to inherited styles. Production builds are unaffected, so this hides well. (`font-hand` shipped broken in dev for exactly this reason.)

## Deployment

Two targets:

- **Vercel** — primary. `base: '/'` in `vite.config.ts`.
- **GitHub Pages** — auto-deployed via `.github/workflows/deploy.yml` on every push to `main`. The workflow sets `GH_PAGES`, which switches `base` to `/portfolio/`.

Because the base differs per target, **never hardcode a root-relative asset path**. Import assets (`import portrait from '../assets/x.jpg'`) so Vite rewrites the URL with the correct base. `public/` files are the exception and must be referenced through `import.meta.env.BASE_URL`. `public/resume.pdf` is the hosted resume.

## Architecture

Single-page app. `App.tsx` composes, in order: `Background` → `CursorGlow` → `DoodleTrail` → `AchievementToasts` → `UnlockBanners` → negative-sweep layers → `Navbar` → `Hero` → `About` → `Projects` → `Skills` → `Contact` → footer.

**Background layer** (`Background.tsx`) is a `<canvas>` fixed behind everything (`z-0`) running a `requestAnimationFrame` loop that draws soft "gummy" blobs which drift and nudge away from the cursor; clicking one dead-on pops it into sharp particles. Three mouse/scroll-parallax `motion.div` blobs and a dot-grid texture sit alongside it. Note it applies `ctx.filter = 'blur(30px)'` per blob per frame, which is the most expensive thing on the page — baseline full-page scroll measures ~57fps with a 43ms p95 before any easter-egg code is involved.

**Animation system** — two approaches, used deliberately:

- **Framer Motion** for scroll-linked parallax, entrance animations, and all drag physics.
- **CSS `@keyframes`** (in `index.css`) for anything that must stay smooth during scroll (marquee, scroll indicator, pulse ring, `float-bob`), because those run on the compositor thread.

**A CSS animation and Framer Motion cannot share `transform` on one element.** A running CSS animation outranks inline styles in the cascade, so the keyframes silently discard everything Framer writes — the drag runs, handlers fire, and nothing moves. `DeskToy` in `Hero.tsx` is the worked example: the bob lives on a wrapper, the drag on an inner `motion.div`. Same reason tilt goes through Framer's `rotate` rather than a `rotate-*` class on a dragged element.

**Stacking contexts bite constantly here.** An element with a `transform` (including one from a CSS animation) creates one, trapping any `z-index` set on its children. A dragged toy inside a bobbing wrapper needs the *wrapper* raised, not the child.

**Projects data** (`src/data/projects.ts`) — single source of truth. `repo` is optional; omitting it hides the GitHub button. The first two entries render as `FeaturedCard`; the rest as `ProjectCard`. `screenshots` drives the lightbox and the easter-egg gates below.

**Custom hooks:**

- `useTextScramble(text, delay)` — scrambles characters through random symbols, resolving left-to-right. Returns `string[]`.
- `useTypewriter(phrases, options)` — cycles phrases with a typing/deleting animation.
- `useDragSuppressClick(threshold)` — the browser fires a `click` after any drag's `pointerup`. Spread these handlers on anything both draggable and clickable so a drag doesn't also navigate or toggle.

## Easter eggs

Ten tracked eggs plus a discovery chain. Everything is **session-only** — a refresh resets the hunt, deliberately.

`src/lib/achievements.ts` is the single source of truth. `TOTAL_ACHIEVEMENTS` is just the object's size, so adding an egg updates the badge automatically. The badge panel renders each found egg's `message`, which makes `message` the natural place to plant a hint for the next one.

| Egg | Trigger |
|---|---|
| 🫳 Fidgety | drag anything (wired via `lib/dragProps.ts`) |
| 💃 Meta easter egg | click the hero sentence about easter eggs — shockwave |
| 🎉 Konami Code | ↑↑↓↓←→←→BA — page flips to its negative, again to flip back |
| 🕹️ Game on | start the playable Arkanoid in its card |
| 🫧 Pop | click a background blob dead-on |
| 🖍️ Domino run | draw on the backdrop and release |
| 🔖 Flip side | click the About polaroid → handwritten riddle |
| 🥚 Infestation | call `hiShai()` in the console |
| 💫 Shape shifter | draw a recognised closed shape — **gated** |
| 🪐 Gravity | type `gravity` — **gated** |

### Unlocks are not achievements

`src/lib/unlocks.ts` holds *abilities*, announced in sticky stacking banners (`UnlockBanners.tsx`). Using the ability is what earns the egg.

- Close a screenshot lightbox having opened it at all → **drawing** unlocked.
- Close it having viewed **every screenshot of every project with screenshots** → **gravity** unlocked. The requirement is derived from `projects.ts`, so a third project with screenshots joins it automatically.

Two rules here are load-bearing. Banners fire on lightbox **close**, never on open, or they cover the screenshots the reward exists to encourage. And view progress is tallied at module scope keyed by project, because each card mounts its own lightbox — component state can't see across projects, and a per-open set would discard progress when a visitor closes a gallery partway.

Each unlock declares `completedBy` (an achievement id) so its banner retires itself once the instruction has been carried out.

The full chain: polaroid riddle → answer is "the console" → the console greeting names `hiShai()`. Separately: open a gallery → draw a shape → that egg's message points at viewing *every* screenshot → gravity.

### The negative (konami)

`App.tsx` grows a white circle in `mix-blend-mode: difference`, which is arithmetically exact inversion (255 − channel) in sRGB.

- **Not `filter: invert(1)` on a wrapper.** A filter establishes a containing block for every `position: fixed` descendant, so the navbar, background, cursor swarm and toasts would stop being viewport-fixed and scroll with the page.
- **Adding `isolation: isolate` above that layer silently reduces the whole effect to a plain white disc.**
- State is a *count* of sweeps, not a boolean: difference-with-white is an involution, so the way back is a second circle cancelling the first, not a rewind. Both layers then drop in one frame. No `AnimatePresence` — an exit animation would visibly re-invert on the way out.
- `.keep-color` (in `index.css`) pre-inverts the portrait and every product screenshot so the global layer inverts them a second time, back to true colour. **Add it to any screenshot added later.** It is scoped to a single active layer, since during the restore sweep the page already reads true.
- **The lightbox must NOT get `.keep-color`.** It is portalled to `document.body`, so it paints above the negative already; adding the class would invert those screenshots rather than protect them.

### Console egg and the egg storm (`lib/consoleEgg.ts`, `lib/eggstorm.ts`)

`installConsoleEgg` prints the greeting and installs `window.hiShai`, but owns no
effect — the caller passes one in, so discovery and payoff stay separable. Today
the payoff is `eggStorm()`: two dozen eggs rain in on a throwaway canvas,
ricochet off the walls, the floor and each other, then pop in a staggered
cascade. Same self-cleaning shape as `lib/confetti.ts`, so it can be fired from
anywhere including the console. The naive O(n²) collision pass is free at this
count and is what makes the pile feel alive.

Eggs are drawn as bezier paths with the site's ink outline rather than as 🥚
glyphs, so they belong to the same sticker-book world as the page. Both the apex
and the base need HORIZONTAL control points or the ends come out sharp and the
storm reads as falling teardrops.

An earlier version of this egg flashed a wireframe over the page instead, and its
CSS is worth remembering as a cautionary tale: `.xray-mode *` is a universal
selector behind a descendant combinator, which defeats the style engine's fast
path so every recalc walks each element's ancestor chain. With Framer writing
inline transforms on dozens of elements per scroll frame, that rule cost ~6ms per
frame and took 88fps down to 56 **while switched off** — the cost is in matching,
not applying. Don't ship page-wide selectors, even dormant ones.

### Shockwave (`lib/shockwave.ts`)

Clicking the hero's easter-egg sentence detonates a pulse from the click point:
a visible ring, plus a pop on every object it reaches, each delayed by
`distance / speed`. That stagger is the whole effect — animate everything at once
and the page merely twitches.

Two things were measured the hard way. The pops animate **transform only**: a
first pass also flashed `filter: brightness/saturate`, which cannot be
composited, and 26 simultaneous filter animations collapsed the page to ~12fps
(transform-only measures 120fps). And the ring is a tight, saturated band with a
dark leading edge, not a soft glow — on a cream page with ambient colour blobs a
bright haze is invisible, so contrast has to come from saturation and darkness.

The target list is curated rather than `*`, and only the OUTERMOST matches pop:
a card and the chips inside it would otherwise compound transforms, since a child
inherits its parent's scale.

### Gravity (`lib/gravity.ts`)

Drops every on-screen toy via the **Web Animations API over `.cursor-grab`**, which is the site-wide marker for "draggable". Script animations outrank inline styles, so this overrides Framer's transforms for the duration and hands control back on `fill: 'none'`. Each toy lands on its nearest clipping ancestor's floor, or it would vanish mid-air inside the marquee or a card. Phase durations are named milliseconds (`FALL_MS`, `BOUNCE_MS`, `REST_MS`, `RETURN_MS`) with keyframe offsets derived — `REST_MS` is the knob that decides whether it reads as a bounce or as a collapse.

### Doodle trail (`DoodleTrail.tsx` + `lib/shapes.ts`)

Press and drag on bare backdrop to paint beads of the cursor-swarm colours; release and they topple into the release point like dominos.

- Beads animate along a **scalar arc-length position** on the recorded polyline, not raw x/y, so the drawn path is preserved instead of cut into chords. Springs get a rest length equal to bead spacing, which is what makes the run propagate rather than slide as a unit. A per-trail speed clamp is essential — without it a bead 700px out gets ~90px/frame and reads as a teleport.
- **Where drawing is allowed**: interactive elements block anywhere in their box; text carriers block only where their glyphs actually are, tested with `Range.selectNodeContents(el).getClientRects()`. A text block is a full-width rectangle with ragged contents, so treating the whole box as text made drags in blank space refuse to draw *and* let the browser select a sentence instead. Anything painted (background, border, shadow) between the target and `[data-doodle-root]` also blocks, which avoids enumerating card classes.
- **Shape recognition is closed-stroke only, by design.** Open strokes, and closed strokes that don't match, fall through to the domino run so a scribble is never a failed gesture. Recognition is corner-based rather than template-based ($1 and friends), because counting curvature peaks is naturally invariant to start point and direction. Ideal forms come from *regularising* the drawing — keep each corner's angle, replace its radius with its class mean — which reconstructs squares, rotated diamonds and rectangles from one rule, plus stars from two alternating radii.
- Gotchas that were measured, not guessed: sampling must stay at 96 points (at 64, a five-point star's edges are too short for the corner window and it finds 8 corners, snapping into a blob); star spokes split by radius *value*, never index parity; the heart notch is measured off the upper envelope, since a thin centre column reads it as 0.07 of the height. Radial spread cannot separate polygons — a square sits at ~0.13 and would read as a circle — so corners must be settled first.
- A `import.meta.env.DEV`-only `console.debug('[doodle] shape: …')` logs the classifier's measurements on every release. Use it before touching thresholds.

### Layer map

Fixed layers, low to high: content `z-10` (Navbar's `z-50` is capped inside it) · UnlockBanners `9990` · shockwave ring `9996` · DoodleTrail canvas and achievement badge `9997` · CursorGlow and the completion card `9998` · negative sweep `9999` · screenshot lightbox `9999` (portalled to `body`, so it paints above the sweep) · confetti and egg-storm canvases `10000`.

## Theming

All colours live in `tailwind.config.js` under `theme.extend.colors`. The palette is a light, neo-brutalist paper theme — `background: #fdf9ef`, `text-1: #171310` (also `border`), `accent: #6c5ce7` (violet), `cyan: #06d6a0` (mint), `pink: #ff6b57` (coral), `green: #ffc23c` (sunshine). The four accent colours are reused as the cursor swarm and doodle beads, so changing them changes those too.

Shared utilities in `src/index.css`: `.sticker` and `.sticker-btn` (the hard offset shadow that defines the look), `.chip`, `.section-label`, `.text-gradient`, `.animated-underline`, `.noise-overlay`, plus the compositor-thread animations `.float-bob`, `.spin-slow`, `.wiggle-hover`, `.marquee-*`, `.pulse-ring`, `.scroll-indicator-line`, `.cursor-blink`. `.keep-color` is the negative opt-out described above.

Fonts, via Google Fonts in `index.html`: `Space Grotesk` (display), `Plus Jakarta Sans` (body), `JetBrains Mono` (code/labels), `Caveat` (handwriting — the polaroid riddle). Caveat has no true italic, so `italic` on it renders as a synthetic oblique.

## Accessibility and platform notes

- Every animated easter egg bails on `prefers-reduced-motion`; the negative degrades to a fade instead of a sweep.
- The cursor swarm and doodle trail are desktop-only (`hidden md:block` plus a coarse-pointer bail), and konami/gravity/`hiShai()` need a keyboard or devtools. A phone visitor can reach roughly 4 of the 10 eggs while the badge advertises 10 — a known gap.
