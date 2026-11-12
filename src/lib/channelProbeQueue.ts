import type { Channel } from '../data/types'
import { useChannelHealthStore } from '../store/useChannelHealthStore'
import { getPlayableStreams } from './streamCapabilities'
import { probeStream } from './probeStream'

// Scanning ~10k channels is only ever triggered a card at a time as it
// scrolls into view (see useInView in ChannelCard), but keep a hard cap on
// simultaneous network+hls.js probes so a fast scroll never floods the tab.
const MAX_CONCURRENT = 3
// Most channels list 1-3 mirrors; trying the first couple is enough to tell
// "this channel is down" from "that particular mirror is down" without
// paying the full per-stream timeout for every single mirror.
const MAX_STREAMS_PER_CHANNEL = 2

let active = 0
const pending: Channel[] = []
const queued = new Set<string>()

function pump() {
  while (active < MAX_CONCURRENT && pending.length > 0) {
    const channel = pending.shift()!
    queued.delete(channel.id)
    active++
    runProbe(channel).finally(() => {
      active--
      pump()
    })
  }
}

async function runProbe(channel: Channel) {
  const { startChecking, reportResult } = useChannelHealthStore.getState()
  startChecking(channel.id)

  const streams = getPlayableStreams(channel).slice(0, MAX_STREAMS_PER_CHANNEL)
  for (const stream of streams) {
    if (await probeStream(stream)) {
      reportResult(channel.id, true)
      return
    }
  }
  reportResult(channel.id, false)
}

/**
 * Queues a background liveness probe for a channel. Cheap to call on every
 * render a card is in view — already-queued, in-flight, or recently-checked
 * channels are skipped immediately.
 */
export function enqueueHealthProbe(channel: Channel) {
  if (queued.has(channel.id)) return
  if (useChannelHealthStore.getState().getStatus(channel.id) !== 'unknown') return
  if (getPlayableStreams(channel).length === 0) return

  queued.add(channel.id)
  pending.push(channel)
  pump()
}
