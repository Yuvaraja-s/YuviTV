# YuviTV stream proxy (optional)

YuviTV works fully without this. Its job is to rescue two categories of
channel that would otherwise never play in-page:

1. Streams tagged **"VLC only"** in the app — the origin requires a
   `Referer`/`User-Agent` a browser's `<video>`/hls.js can't send, so
   they're excluded from in-page playback and offered as "open in VLC"
   instead (see `src/lib/streamCapabilities.ts`). This Worker forwards
   those same two headers from Cloudflare's edge, which is all those
   origins actually check for — functionally what VLC does with the same
   URL, just reachable from a `<video>` tag.
2. Plain-`http://` streams, which the browser blocks outright on an
   `https://` site (mixed content) regardless of the origin's own CORS
   headers — about 1 in 5 channels in the iptv-org catalog, many of them
   otherwise perfectly live. Fetching server-side and handing the result
   back over `https://` sidesteps that browser rule entirely.

Either way, this Worker does not store, transcode, or inspect the stream —
it just forwards the request and rewrites every URI inside the playlist
(variant playlists, segments, key/map references) to route back through
itself too, since otherwise only the first request would get the benefit.

It does **not** fix channels marked "Offline" — those are dead links or
geo-blocked at the broadcaster's own server, which no proxy can route
around.

Deploying this also means YuviTV is no longer purely "link-only, zero
backend" for this subset of channels — see the note in the main
[README](../README.md) and [disclaimer page](../src/pages/DisclaimerPage.tsx).

## Cost

Cloudflare Workers' free plan (100,000 requests/day, no credit card
required at the time of writing) is the baseline this was built against.
Combined, the two categories above cover roughly a quarter of the iptv-org
catalog — comfortably inside the free tier for casual/personal traffic,
but confirm current limits at
[developers.cloudflare.com/workers/platform/pricing](https://developers.cloudflare.com/workers/platform/pricing/)
before relying on this at any real scale of visitors.

## Deploy

```bash
cd cloudflare-worker
npm install
npx wrangler login          # opens a browser to authorize your Cloudflare account

# Optional but recommended — see "Abuse" below.
npx wrangler secret put PROXY_KEY   # paste any random string when prompted

npm run deploy
```

Wrangler prints a URL like `https://yuvitv-stream-proxy.<your-subdomain>.workers.dev`.

## Wire it into the app

Set these when building YuviTV (locally, that's a `.env.local` in the repo
root; for the GitHub Pages deploy, add them as **repository secrets** under
Settings → Secrets and variables → Actions, then reference them as `env:`
in `.github/workflows/deploy.yml`'s build step):

```
VITE_STREAM_PROXY_URL=https://yuvitv-stream-proxy.<your-subdomain>.workers.dev
VITE_STREAM_PROXY_KEY=<the same string you put in PROXY_KEY, if you set one>
```

Without `VITE_STREAM_PROXY_URL` set, the app behaves exactly as before —
header-restricted streams stay "VLC only", and plain-http streams keep
failing to mixed-content exactly as they did previously.

## Abuse

`PROXY_KEY` is not a real secret once deployed — it ships inside YuviTV's
public JS bundle, so anyone who reads the bundle can extract it. It only
raises the bar against a scanner that finds the bare Worker URL and tries
to use it as a free, generic CORS proxy for unrelated traffic. The real
backstop is Cloudflare's own abuse detection and the free plan's request
cap. Don't point this Worker at anything other than YuviTV's own stream
list.
