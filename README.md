# Virtum — homepage (v3)

Single-page corporate site for **Виртум** — AI agents that automate bookings,
orders, communications and analytics for B2B. Built from the Claude Design
`Virtum Homepage v3` handoff.

- **Stack:** plain HTML + CSS + vanilla JS. No build step, no dependencies.
- **Design language:** dark navy (`#040D1C`) + warm off-white (`#FAF9F7`) +
  teal accent (`#00C8D4`). Fonts: Exo 2 (display) + Space Grotesk (body).
  Logo: the "Kinetic V" mark (`assets/logo.svg`).
- **Centerpiece:** a live "AI agent processing tasks" panel (`app.js` →
  `initAgent`) cycling through restaurant / flights / orders / hotel / medical
  tasks in real time.
- **Responsive:** mobile-first breakpoints at 1080 / 920 / 560px, hamburger
  menu, the agent panel collapses its feed column on small screens.
- **Accessibility:** semantic landmarks, skip link, focus-visible styles,
  `prefers-reduced-motion` static fallback for the agent animation.
- **SEO / indexable:** `lang="ru"`, unique title/description, canonical, Open
  Graph, JSON-LD Organization, `sitemap.xml`, `robots.txt` (allow all).

## Files
- `index.html` — the page
- `styles.css` — all styling + responsive rules
- `app.js` — reveals, counters, mobile menu, trust ticker, feature/step
  rendering, and the live agent animation
- `assets/logo.svg` — Kinetic V mark
- `404.html`, `sitemap.xml`, `robots.txt`, `site.webmanifest`, `vercel.json`

## Develop
```bash
python3 -m http.server 8080   # preview at http://localhost:8080
```

## Deploy (Vercel)
Static — no build. Import the repo at vercel.com → Framework: **Other** →
leave Build/Output empty. `vercel.json` is already configured.
