# YuviTV stream proxy (optional)

YuviTV works fully without this. Its only job is to rescue the subset of
channels tagged **"VLC only"** in the app — streams whose origin server
requires a `Referer`/`User-Agent` a browser's `<video>`/hls.js can't send,
so they're excluded from in-page playback and offered as "open in VLC"
instead (see `src/lib/streamCapabilities.ts`). This Worker forwards those
same two headers from Cloudflare's edge, which is all those origins
actually check for — functionally what VLC does with the same URL, just
reachable from a `<video>` tag. It does not store, transcode, or inspect
the stream.

It does **not** fix channels marked "Offline" — those are dead links or
geo-blocked at the broadcaster's own server, which no proxy can route
around.

Deploying this also means YuviTV is no longer purely "link-only, zero
backend" for this subset of channels — see the note in the main
[README](../README.md) and [disclaimer page](../src/pages/DisclaimerPage.tsx).

## Cost

Cloudflare Workers' free plan (100,000 requests/day, no credit card
required at the time of writing) is enough for this — a single-digit
number of channels per catalog typically need it. Confirm current limits at
[developers.cloudflare.com/workers/platform/pricing](https://developers.cloudflare.com/workers/platform/pricing/)
before relying on this long-term.

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
header-restricted streams stay "VLC only".

## Abuse

`PROXY_KEY` is not a real secret once deployed — it ships inside YuviTV's
public JS bundle, so anyone who reads the bundle can extract it. It only
raises the bar against a scanner that finds the bare Worker URL and tries
to use it as a free, generic CORS proxy for unrelated traffic. The real
backstop is Cloudflare's own abuse detection and the free plan's request
cap. Don't point this Worker at anything other than YuviTV's own stream
list.
