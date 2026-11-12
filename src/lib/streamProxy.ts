import type { Stream } from '../data/types'

// Optional and unset by default — without it, header-restricted streams stay
// "VLC only" exactly as before. Deploying cloudflare-worker/ and setting
// these at build time (see that folder's README) turns this on. Never
// required for the app to run.
const PROXY_BASE = (import.meta.env.VITE_STREAM_PROXY_URL as string | undefined)?.replace(/\/+$/, '')
const PROXY_KEY = import.meta.env.VITE_STREAM_PROXY_KEY as string | undefined

export function isProxyConfigured(): boolean {
  return Boolean(PROXY_BASE)
}

/**
 * Routes a header-restricted stream through the configured proxy, which
 * forwards the Referer/User-Agent its origin server expects — the same
 * thing VLC does when given this URL and header pair, just run from an edge
 * function instead of a desktop app so <video>/hls.js can play it.
 */
export function proxiedStreamUrl(stream: Stream): string {
  if (!PROXY_BASE) return stream.url

  const params = new URLSearchParams({ url: stream.url })
  if (stream.userAgent) params.set('ua', stream.userAgent)
  if (stream.referrer) params.set('ref', stream.referrer)
  if (PROXY_KEY) params.set('key', PROXY_KEY)

  return `${PROXY_BASE}/stream?${params.toString()}`
}
