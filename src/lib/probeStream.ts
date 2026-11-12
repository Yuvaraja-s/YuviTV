import type { Stream } from '../data/types'
import { needsProxy, streamUrl } from './streamCapabilities'
import { isProxyConfigured } from './streamProxy'

const PROBE_TIMEOUT_MS = 8000

/**
 * One liveness attempt against a single URL by running the same hls.js load
 * path the real player uses (loadSource + attachMedia, no play()) against a
 * detached <video> that's never inserted into the DOM. A fragment loading
 * successfully is treated as "online" without waiting for playback to
 * start — this is a liveness check, not a watch session.
 */
function attemptLoad(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.muted = true
    video.preload = 'auto'

    let hls: import('hls.js').default | null = null
    let settled = false

    const finish = (ok: boolean) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      hls?.destroy()
      video.removeAttribute('src')
      video.load()
      resolve(ok)
    }

    const timer = setTimeout(() => finish(false), PROBE_TIMEOUT_MS)

    import('hls.js').then(({ default: Hls }) => {
      if (settled) return

      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true })
        hls.loadSource(url)
        hls.attachMedia(video)
        hls.on(Hls.Events.FRAG_LOADED, () => finish(true))
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) finish(false)
        })
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.addEventListener('loadeddata', () => finish(true))
        video.addEventListener('error', () => finish(false))
        video.src = url
      } else {
        finish(false)
      }
    })
  })
}

/**
 * Probes a stream the same way the player actually plays it: a direct (or
 * eagerly-proxied, for known header/mixed-content cases — see
 * streamCapabilities.needsProxy) attempt first, falling back to a forced
 * retry through the proxy on failure. That fallback is what rescues origins
 * that are perfectly live but never send CORS headers at all — not knowable
 * in advance, only after a direct attempt has actually failed — so without
 * it the health badge would wrongly call a channel "Offline" that the real
 * player would go on to successfully play.
 */
export async function probeStream(stream: Stream): Promise<boolean> {
  const eagerlyProxied = needsProxy(stream)
  if (await attemptLoad(streamUrl(stream))) return true
  if (isProxyConfigured() && !eagerlyProxied) {
    return attemptLoad(streamUrl(stream, true))
  }
  return false
}
