import type { Channel, Stream } from '../data/types'
import { isProxyConfigured, proxiedStreamUrl } from './streamProxy'

/** Streams that need a custom Referer/User-Agent can never play through a
 * bare <video>/hls.js request — browsers refuse to let JS set those headers
 * on a media request. */
export function needsHeaders(stream: Stream): boolean {
  return Boolean(stream.userAgent || stream.referrer)
}

/** A plain-http stream requested from this (https) page is blocked by the
 * browser's mixed-content policy before it ever reaches the network —
 * unrelated to whether the origin itself is actually still live. */
function isInsecure(stream: Stream): boolean {
  return stream.url.startsWith('http://')
}

/** Whether this stream needs routing through the proxy to have any chance
 * of playing in-page — either because the origin requires headers a browser
 * can't send, or because it's plain http and would otherwise be blocked by
 * mixed-content on this https site. Streams that fail for some *other*
 * reason (most commonly: the origin just never sends CORS headers at all,
 * which only breaks hls.js's XHR-based loading, not a desktop player) aren't
 * knowable in advance — see streamUrl's forceProxy param, used as a retry
 * fallback once a direct attempt has actually failed. */
export function needsProxy(stream: Stream): boolean {
  return needsHeaders(stream) || isInsecure(stream)
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

/** The URL the player should actually request. Proxied when the stream
 * needs headers or is plain-http (proxiedStreamUrl itself falls back to the
 * origin URL when no proxy is configured), or when the caller passes
 * `forceProxy` after a direct attempt already failed — see needsProxy. */
export function streamUrl(stream: Stream, forceProxy = false): string {
  return forceProxy || needsProxy(stream) ? proxiedStreamUrl(stream) : stream.url
}

export function streamLabel(stream: Stream, index: number): string {
  if (stream.quality) return stream.quality
  if (stream.title && stream.title.length < 24) return stream.title
  return `Source ${index + 1}`
}
