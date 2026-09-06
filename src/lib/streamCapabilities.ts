import type { Channel, Stream } from '../data/types'

/**
 * Streams that need a custom Referer/User-Agent can never play through
 * <video>/hls.js — browsers refuse to let JS set those headers on a media
 * request. They're excluded from playback attempts entirely rather than
 * left to fail with a confusing error, and surfaced instead as external
 * (VLC/copy-link) options via StreamFallback.
 */
export function getPlayableStreams(channel: Channel): Stream[] {
  return channel.streams.filter((s) => !s.requiresHeaders)
}

export function getRestrictedStreams(channel: Channel): Stream[] {
  return channel.streams.filter((s) => s.requiresHeaders)
}

export function streamLabel(stream: Stream, index: number): string {
  if (stream.quality) return stream.quality
  if (stream.title && stream.title.length < 24) return stream.title
  return `Source ${index + 1}`
}
