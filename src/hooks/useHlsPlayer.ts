import { useEffect, useRef, useState } from 'react'
import type { Stream } from '../data/types'
import { isProxyConfigured } from '../lib/streamProxy'
import { needsProxy, streamUrl } from '../lib/streamCapabilities'

export type PlayerStatus = 'loading' | 'buffering' | 'playing' | 'paused' | 'error'

const STALL_TIMEOUT_MS = 8000

interface UseHlsPlayerResult {
  status: PlayerStatus
  error: string | null
  streamIndex: number
  switchStream: (index: number) => void
  retry: () => void
}

/**
 * Attaches one stream at a time to the given <video>, auto-advancing to the
 * next stream in the list on a fatal error (channels often have 2-3 mirrors)
 * before finally surfacing an error.
 *
 * hls.js (MSE-based) is preferred whenever it's supported — including on
 * Chromium — and native HLS is only used as a fallback for browsers with no
 * MSE support at all (old iOS Safari). `canPlayType('application/vnd.apple.
 * mpegurl') !== ''` is a common but unreliable way to detect "native HLS
 * only": some Chromium builds return "maybe" for it too (a legitimately
 * vague answer per the HTML spec, not a real capability claim), which would
 * wrongly skip hls.js and hand the browser a raw .m3u8 it can't actually
 * demux. Checking Hls.isSupported() first avoids that false positive.
 */
export function useHlsPlayer(videoRef: React.RefObject<HTMLVideoElement | null>, streams: Stream[]): UseHlsPlayerResult {
  const [status, setStatus] = useState<PlayerStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [streamIndex, setStreamIndex] = useState(0)
  // Set once a direct attempt at the *current* stream has failed and we've
  // escalated to retrying that same stream through the proxy — covers
  // origins that are perfectly live but never send CORS headers at all
  // (hls.js's XHR-based loading needs them even though a desktop player
  // wouldn't care), which isn't knowable in advance like needsProxy's cases.
  const [forceProxy, setForceProxy] = useState(false)
  const retryCountRef = useRef(0)

  // New channel: start from its first stream.
  useEffect(() => {
    setStreamIndex(0)
    setForceProxy(false)
    retryCountRef.current = 0
  }, [streams])

  // Each mirror gets its own fresh direct-then-proxy cycle.
  useEffect(() => {
    setForceProxy(false)
  }, [streamIndex])

  useEffect(() => {
    const video = videoRef.current
    const stream = streams[streamIndex]
    if (!video || !stream) return

    let cancelled = false
    let hls: import('hls.js').default | null = null
    setStatus('loading')
    setError(null)

    // A stream that just failed gets one retry through the proxy before
    // it's written off — fixes origins that are actually fine but just
    // never send CORS headers (hls.js's XHR-based loading needs them; a
    // desktop player wouldn't care). Only once that's also failed, or
    // there's no proxy to retry through, does it move to the next mirror.
    const advanceOrFail = (message: string) => {
      if (cancelled) return
      if (isProxyConfigured() && !forceProxy && !needsProxy(stream)) {
        retryCountRef.current = 0
        setForceProxy(true)
        return
      }
      if (streamIndex < streams.length - 1) {
        setStreamIndex((i) => i + 1)
      } else {
        setStatus('error')
        setError(message)
      }
    }

    // Some streams "respond" indefinitely without ever producing playable
    // data (a manifest that never yields a loadable fragment, a non-fatal
    // hls.js error loop, etc.) — that must not spin the loading UI forever.
    // Any real progress (a loaded fragment, a playing/waiting event) pushes
    // the deadline back; silence past the timeout counts as a failure.
    let stallTimer: ReturnType<typeof setTimeout>
    const armStallTimer = () => {
      clearTimeout(stallTimer)
      stallTimer = setTimeout(() => advanceOrFail('This stream timed out.'), STALL_TIMEOUT_MS)
    }
    armStallTimer()

    const onWaiting = () => {
      setStatus('buffering')
      armStallTimer()
    }
    const onPlaying = () => {
      setStatus('playing')
      clearTimeout(stallTimer)
    }
    const onPause = () => setStatus((s) => (s === 'error' ? s : 'paused'))
    const onVideoError = () => advanceOrFail('This stream stopped responding.')

    video.addEventListener('waiting', onWaiting)
    video.addEventListener('playing', onPlaying)
    video.addEventListener('pause', onPause)
    video.addEventListener('error', onVideoError)

    import('hls.js').then(({ default: Hls }) => {
      if (cancelled) return

      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true })
        hls.loadSource(streamUrl(stream, forceProxy))
        hls.attachMedia(video)
        hls.on(Hls.Events.FRAG_LOADED, armStallTimer)
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (!cancelled) video.play().catch(() => {})
        })
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (!data.fatal || cancelled) return
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR && retryCountRef.current < 1) {
            retryCountRef.current += 1
            hls?.startLoad()
            return
          }
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR && retryCountRef.current < 2) {
            retryCountRef.current += 1
            hls?.recoverMediaError()
            return
          }
          advanceOrFail('This stream is currently unavailable.')
        })
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl(stream, forceProxy)
        video.play().catch(() => {})
      } else {
        advanceOrFail("This browser can't play this stream format.")
      }
    })

    return () => {
      cancelled = true
      clearTimeout(stallTimer)
      video.removeEventListener('waiting', onWaiting)
      video.removeEventListener('playing', onPlaying)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('error', onVideoError)
      hls?.destroy()
      video.removeAttribute('src')
      video.load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streams, streamIndex, videoRef, forceProxy])

  const switchStream = (index: number) => {
    retryCountRef.current = 0
    setForceProxy(false)
    setStreamIndex(index)
  }

  const retry = () => {
    retryCountRef.current = 0
    setForceProxy(false)
    setStreamIndex(0)
    setStatus('loading')
    setError(null)
  }

  return { status, error, streamIndex, switchStream, retry }
}
