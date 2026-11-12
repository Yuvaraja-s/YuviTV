import type { Stream } from '../data/types'
import { streamUrl } from './streamCapabilities'

const PROBE_TIMEOUT_MS = 8000

/**
 * Answers "would this stream actually start playing" by running the same
 * hls.js load path the real player uses (loadSource + attachMedia, no
 * play()) against a detached <video> that's never inserted into the DOM.
 * A fragment loading successfully is treated as "online" without waiting
 * for playback to start — this is a liveness check, not a watch session.
 */
export function probeStream(stream: Stream): Promise<boolean> {
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
        hls.loadSource(streamUrl(stream))
        hls.attachMedia(video)
        hls.on(Hls.Events.FRAG_LOADED, () => finish(true))
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) finish(false)
        })
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.addEventListener('loadeddata', () => finish(true))
        video.addEventListener('error', () => finish(false))
        video.src = streamUrl(stream)
      } else {
        finish(false)
      }
    })
  })
}
