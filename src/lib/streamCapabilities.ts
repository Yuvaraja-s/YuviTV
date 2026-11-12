import type { Channel, Stream } from '../data/types'
import { isProxyConfigured, proxiedStreamUrl } from './streamProxy'

/** Streams that need a custom Referer/User-Agent can never play through a
 * bare <video>/hls.js request — browsers refuse to let JS set those headers
 * on a media request. */
export function needsHeaders(stream: Stream): boolean {
  return Boolean(stream.userAgent || stream.referrer)
}

/**
 * Streams playable in-page: everything that doesn't need special headers,
 * plus (when cloudflare-worker/ is deployed and wired up — see
 * streamProxy.ts) everything that does, since the proxy can supply them.
 * Without a proxy configured, header-restricted streams are excluded here
 * and surfaced instead as external (VLC/copy-link) options via
 * StreamFallback, rather than left to fail with a confusing error.
 */
export function getPlayableStreams(channel: Channel): Stream[] {
  const proxied = isProxyConfigured()
  return channel.streams.filter((s) => !needsHeaders(s) || proxied)
}

export function getRestrictedStreams(channel: Channel): Stream[] {
  if (isProxyConfigured()) return []
  return channel.streams.filter((s) => needsHeaders(s))
}

/** The URL the player should actually request: proxied when the stream needs
 * headers, the origin URL unchanged otherwise. */
export function streamUrl(stream: Stream): string {
  return needsHeaders(stream) ? proxiedStreamUrl(stream) : stream.url
}

export function streamLabel(stream: Stream, index: number): string {
  if (stream.quality) return stream.quality
  if (stream.title && stream.title.length < 24) return stream.title
  return `Source ${index + 1}`
}
