import { useEffect, useRef, useState } from 'react'
import type { Stream } from '../data/types'
import { streamUrl } from '../lib/streamCapabilities'

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
  const retryCountRef = useRef(0)

  // New channel: start from its first stream.
  useEffect(() => {
    setStreamIndex(0)
    retryCountRef.current = 0
  }, [streams])

  useEffect(() => {
    const video = videoRef.current
    const stream = streams[streamIndex]
    if (!video || !stream) return

    let cancelled = false
    let hls: import('hls.js').default | null = null
    setStatus('loading')
    setError(null)

    // Every mirror gets tried automatically before giving up — most channels
    // only list a couple, and a dead one shouldn't need a manual click past
    // it when the next one in the list might just work.
    const advanceOrFail = (message: string) => {
      if (cancelled) return
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
        hls.loadSource(streamUrl(stream))
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
        video.src = streamUrl(stream)
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
  }, [streams, streamIndex, videoRef])

  const switchStream = (index: number) => {
    retryCountRef.current = 0
    setStreamIndex(index)
  }

  const retry = () => {
    retryCountRef.current = 0
    setStreamIndex(0)
    setStatus('loading')
    setError(null)
  }

  return { status, error, streamIndex, switchStream, retry }
}
