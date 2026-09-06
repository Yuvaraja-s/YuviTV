# YuviTV

A free, open web player for live IPTV channels from around the world — filterable by language, country, and category. Built on the public channel catalog maintained by [iptv-org](https://github.com/iptv-org/iptv).

**Live:** https://yuvaraja-s.github.io/YuviTV/

## What this is (and isn't)

YuviTV is a browser for publicly available stream links, not a streaming service. There's no backend, no video hosting, and no proxying — every play button opens a direct connection from your browser to the original broadcaster's own server. See [`/disclaimer`](https://yuvaraja-s.github.io/YuviTV/#/disclaimer) for the full story, including how to report a broken stream or request a takedown.

## Stack

- [Vite](https://vitejs.dev/) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) — custom ink/web-red/web-blue/cyan design tokens shared with [the portfolio](https://yuvaraja-s.github.io/portfolio/) this project is a sibling to
- [Zustand](https://zustand.docs.pmnd.rs/) — catalog, filters, favorites, and recently-watched state
- [hls.js](https://github.com/video-dev/hls.js) — HLS playback (dynamically imported, only on `/watch/:id`)
- [`@tanstack/react-virtual`](https://tanstack.com/virtual) — window-virtualized channel grid (the catalog is ~9,800 playable channels)
- [Framer Motion](https://www.framer.com/motion/) + [GSAP](https://gsap.com/) — page/layout transitions and frame-accurate boot/tuning choreography, respectively
- [`@react-three/fiber`](https://docs.pmnd.rs/react-three-fiber) — the WebGL "signal field" background in the boot loader (lazy-loaded)
- [Radix UI](https://www.radix-ui.com/) — accessible select/dialog primitives
- [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/) — installable app shell, offline-aware
- [`idb-keyval`](https://github.com/jakearchibald/idb-keyval) — IndexedDB cache for the catalog (too large for localStorage)
- [`zod`](https://zod.dev/) — validates the upstream JSON shape at the fetch boundary

## Local development

```bash
npm install
npm run dev       # http://localhost:5173/YuviTV/
npm run build     # type-check + production build to dist/
npm run preview   # serve the production build locally
```

## Deployment

Pushing to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds and publishes `dist/` to GitHub Pages via GitHub Actions.

`vite.config.ts` sets `base: "/YuviTV/"` for this repo's Pages URL — update it (and the PWA manifest's `start_url`/`scope`) if the repo is ever renamed or moved to a custom domain.

## How the data works

`iptv-org` publishes channels, streams, languages, countries, regions, feeds, logos, and a blocklist as separate static JSON endpoints. `src/workers/catalogWorker.ts` fetches all of them in parallel inside a Web Worker, `src/data/normalize.ts` joins them into one flat `Channel[]` and hard-excludes NSFW/`xxx`-category/closed/blocklisted/streamless channels (not a UI setting — see the disclaimer), and the result is cached in IndexedDB with a 12-hour TTL and silent background revalidation. See `src/data/` and `src/store/useCatalogStore.ts`.

Some streams require a `Referer`/`User-Agent` header that browsers can't set on `<video>`/hls.js requests — those are excluded from in-page playback and surfaced instead as "copy link" / "open externally" options (`src/components/player/StreamFallback.tsx`), since they'll work fine in VLC or similar.

## Project structure

```
src/
  data/            fetch, zod schemas, normalize/join logic, IndexedDB cache
  workers/         catalogWorker — fetch+join off the main thread
  store/           Zustand stores: catalog, filters, favorites, recently-watched
  hooks/           useChannels, useFacets, useHlsPlayer, usePrefersReducedMotion, ...
  components/
    layout/         Navbar, Footer (developer credit), SkipToContent
    loader/          BootLoader ("Signal Acquisition"), TuningTransition (channel switch)
    three/           SignalField — the WebGL boot-loader background
    browse/          filters, search, sort, the virtualized channel grid
    player/          VideoPlayer, controls, error/fallback states
    ui/              small shared primitives
  pages/           route-level components (Home, Watch, Favorites, About, Disclaimer)
```

## Accessibility

Skip-to-content, focus-visible rings tuned for keyboard/remote navigation, ARIA-labeled controls throughout, and every animated sequence (boot loader, channel-switch transition, WebGL background) fully bypasses to a static/reduced form under `prefers-reduced-motion`. Verified with an automated axe-core (WCAG 2 A/AA) pass across every route — see the Phase 5 commit for what that caught and fixed.

## Known limitations / backlog

- **EPG ("what's on now/next")** — `iptv-org` publishes `guides.json`; not wired up yet.
- **Subdivision-level regional filtering** — country-level only for now; `subdivisions.json` is available upstream if this is wanted later.
- **No analytics** — a deliberate default, not an oversight.
- Some streams simply won't play, by design of the underlying dataset (dead links, geo-blocking, header-restricted origins). This is expected — see the disclaimer.

## Credits

Developed by [Yuvaraja Selvapandi](https://yuvaraja-s.github.io/portfolio/) · [GitHub](https://github.com/Yuvaraja-s) · [LinkedIn](https://linkedin.com/in/yuvaraja-selvapandi)

Channel data courtesy of the [iptv-org](https://github.com/iptv-org/iptv) community project (unaffiliated).
