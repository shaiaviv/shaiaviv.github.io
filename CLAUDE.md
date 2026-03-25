# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start Vite dev server (localhost:5173)
npm run build      # tsc + vite build → dist/
npm run preview    # preview the production build locally
```

No test suite exists. No linter is configured beyond TypeScript type-checking (`tsc` runs as part of build).

## Deployment

Two targets:

- **Vercel** — primary. `base: '/'` in `vite.config.ts`. All asset/public paths must be root-relative (e.g. `/resume.pdf`).
- **GitHub Pages** — auto-deployed via `.github/workflows/deploy.yml` on every push to `main`. The workflow runs `npm ci && npm run build` then publishes `dist/` via `peaceiris/actions-gh-pages`.

`public/resume.pdf` is the hosted resume — update the file there to change what the "View Resume" links serve.

## Architecture

Single-page app. `App.tsx` composes everything in order: `Background` → `CursorGlow` → `Navbar` → `Hero` → `About` → `Projects` → `Skills` → `Contact`.

**Background layer** (`Background.tsx`) is a `<canvas>` fixed behind everything (`z-0`). It runs a `requestAnimationFrame` loop drawing: nebulas (offscreen canvas blit) → starfield (magnitude-distributed, with glow halos on bright stars) → shooting stars → constellation particle network with cursor-proximity lines. Two Framer Motion `motion.div` nebula blobs (purple/blue, mouse-parallax) sit alongside the canvas in the same component.

**Animation system** — two distinct approaches used intentionally:
- **Framer Motion** (`useScroll`, `useTransform`, `useSpring`, `motion.*`) for scroll-linked parallax and entrance animations. Every section has depth layers moving at different rates.
- **CSS `@keyframes`** (in `index.css`) for animations that must stay smooth during scroll (marquee, scroll indicator, pulse ring). Framer Motion's `animate()` runs on the main thread and drops frames under scroll load; CSS animations run on the compositor thread.

**Projects data** (`src/data/projects.ts`) — single source of truth. `repo` is optional; omitting it hides the GitHub button from the card. The first entry in the array is rendered as `FeaturedCard` (large); the rest render as `ProjectCard` in a mason grid with odd-indexed cards offset down (`md:mt-14`).

**Custom hooks:**
- `useTextScramble(text, delay)` — scrambles characters through random symbols, resolves left-to-right. Returns `string[]` (array so each char can be styled independently).
- `useTypewriter(phrases, options)` — cycles through phrases with a typing/deleting animation.

## Theming

All colors are in `tailwind.config.js` under `theme.extend.colors`. The palette is a dark space theme: `background: #03040e`, `accent: #00e5a0` (neon green), `cyan: #00b8d4`. Shared CSS utilities (`.glass`, `.glass-card`, `.text-gradient`, `.section-label`, `.glow-accent`, `.btn-outline-gradient`, `.animated-underline`) are defined in `src/index.css` and used throughout components.

Fonts: `Outfit` (sans, body) and `JetBrains Mono` (mono, code/labels) — loaded via Google Fonts in `index.html`.
