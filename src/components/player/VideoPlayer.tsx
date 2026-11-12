import { useEffect, useMemo, useRef, useState } from 'react'
import type { Channel } from '../../data/types'
import { useHlsPlayer } from '../../hooks/useHlsPlayer'
import { enterFullscreen, exitFullscreen, getFullscreenElement, isFullscreenSupported } from '../../lib/fullscreen'
import { getPlayableStreams, getRestrictedStreams } from '../../lib/streamCapabilities'
import { useChannelHealthStore } from '../../store/useChannelHealthStore'
import { CountryFlag } from '../ui/CountryFlag'
import { TuningTransition } from '../loader/TuningTransition'
import { PlayerControls } from './PlayerControls'
import { PlayerErrorState } from './PlayerErrorState'
import { StreamFallback } from './StreamFallback'

const CONTROLS_IDLE_MS = 3000

interface VideoPlayerProps {
  channel: Channel
  hasPrevious: boolean
  hasNext: boolean
  onPrevious: () => void
  onNext: () => void
}

export function VideoPlayer({ channel, hasPrevious, hasNext, onPrevious, onNext }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Memoized: useHlsPlayer's effect depends on this array by reference, and
  // status updates from the hook itself re-render this component constantly
  // during playback — an unmemoized array here would tear down and rebuild
  // the entire hls.js instance on every single one of those re-renders.
  const playableStreams = useMemo(() => getPlayableStreams(channel), [channel])
  const player = useHlsPlayer(videoRef, playableStreams)
  const reportHealth = useChannelHealthStore((s) => s.reportResult)

  // The real player is the most authoritative health signal there is — a
  // successful or exhausted playback attempt overrides any earlier
  // background-probe guess for this channel.
  useEffect(() => {
    if (player.status === 'playing') reportHealth(channel.id, true)
    else if (player.status === 'error') reportHealth(channel.id, false)
  }, [player.status, channel.id, reportHealth])

  const [paused, setPaused] = useState(true)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [ccAvailable, setCcAvailable] = useState(false)
  const [ccEnabled, setCcEnabled] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [canPiP, setCanPiP] = useState(false)
  const [canFullscreen, setCanFullscreen] = useState(false)

  // Native <video> transport state, kept in sync via its own events (separate
  // from useHlsPlayer, which only owns "is a source attached and healthy").
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onPlay = () => setPaused(false)
    const onPause = () => setPaused(true)
    const onVolumeChange = () => {
      setMuted(video.muted)
      setVolume(video.volume)
    }
    const onLoadedMetadata = () => setCcAvailable(video.textTracks.length > 0)

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('volumechange', onVolumeChange)
    video.addEventListener('loadedmetadata', onLoadedMetadata)
    setCanPiP(document.pictureInPictureEnabled && !!video.requestPictureInPicture)
    setCanFullscreen(isFullscreenSupported(video))

    return () => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('volumechange', onVolumeChange)
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
    }
  }, [channel.id])

  useEffect(() => {
    const video = videoRef.current
    // Standard API fires `fullscreenchange` on the document; iOS Safari's
    // video-only fullscreen fires begin/end events on the <video> itself
    // instead and never touches document.fullscreenElement at all.
    const onFullscreenChange = () => setIsFullscreen(getFullscreenElement() === containerRef.current)
    const onIosBegin = () => setIsFullscreen(true)
    const onIosEnd = () => setIsFullscreen(false)

    document.addEventListener('fullscreenchange', onFullscreenChange)
    document.addEventListener('webkitfullscreenchange', onFullscreenChange)
    video?.addEventListener('webkitbeginfullscreen', onIosBegin)
    video?.addEventListener('webkitendfullscreen', onIosEnd)
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange)
      video?.removeEventListener('webkitbeginfullscreen', onIosBegin)
      video?.removeEventListener('webkitendfullscreen', onIosEnd)
    }
  }, [channel.id])

  const resetIdleTimer = () => {
    setControlsVisible(true)
    clearTimeout(idleTimerRef.current)
    if (!paused) idleTimerRef.current = setTimeout(() => setControlsVisible(false), CONTROLS_IDLE_MS)
  }
  useEffect(() => resetIdleTimer(), [paused])
  useEffect(() => () => clearTimeout(idleTimerRef.current), [])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) video.play().catch(() => {})
    else video.pause()
  }
  const toggleMute = () => {
    const video = videoRef.current
    if (video) video.muted = !video.muted
  }
  const changeVolume = (v: number) => {
    const video = videoRef.current
    if (!video) return
    video.volume = v
    video.muted = v === 0
  }
  const toggleCC = () => {
    const video = videoRef.current
    if (!video) return
    const track = video.textTracks[0]
    if (!track) return
    const next = track.mode !== 'showing'
    track.mode = next ? 'showing' : 'hidden'
    setCcEnabled(next)
  }
  const togglePiP = async () => {
    const video = videoRef.current
    if (!video) return
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture()
      else await video.requestPictureInPicture()
    } catch {
      // Some browsers report support but refuse for a given stream — not worth surfacing as an error.
    }
  }
  const toggleFullscreen = () => {
    const video = videoRef.current
    if (getFullscreenElement()) {
      exitFullscreen(video).catch(() => {})
    } else if (containerRef.current) {
      enterFullscreen(containerRef.current, video).catch(() => {})
    }
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        togglePlay()
      } else if (e.key.toLowerCase() === 'm') {
        toggleMute()
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        changeVolume(Math.min(1, (videoRef.current?.volume ?? 1) + 0.1))
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        changeVolume(Math.max(0, (videoRef.current?.volume ?? 1) - 0.1))
      } else if (e.key === 'ArrowLeft' && hasPrevious) {
        onPrevious()
      } else if (e.key === 'ArrowRight' && hasNext) {
        onNext()
      }
      resetIdleTimer()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPrevious, hasNext, onPrevious, onNext])

  if (playableStreams.length === 0) {
    return <StreamFallback channel={channel} />
  }

  if (player.status === 'error') {
    return <PlayerErrorState channel={channel} message={player.error ?? 'This channel is currently unavailable.'} onRetry={player.retry} />
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={resetIdleTimer}
      onTouchStart={resetIdleTimer}
      className="group relative aspect-video overflow-hidden rounded-lg bg-black"
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- captions are wired dynamically when a channel actually carries a text track */}
      <video ref={videoRef} playsInline className="h-full w-full" onClick={togglePlay} />

      <TuningTransition key={channel.id} channel={channel} />

      {(player.status === 'loading' || player.status === 'buffering') && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="h-10 w-10 animate-radar-sweep rounded-full border-2 border-t-web-cyan border-r-transparent border-b-transparent border-l-transparent" />
        </div>
      )}

      <div
        className={`pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between bg-gradient-to-b from-ink-950/90 to-transparent p-4 transition-opacity duration-200 ${
          controlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-2">
          {channel.logo && <img src={channel.logo} alt="" className="h-8 max-w-[6rem] object-contain" />}
          <div>
            <p className="font-semibold text-paper">{channel.name}</p>
            <p className="flex items-center gap-1.5 text-xs text-paper/60">
              <CountryFlag code={channel.country} className="h-2.5 w-4 rounded-[1px]" />
              {channel.categories[0]}
            </p>
          </div>
        </div>
      </div>

      <div className={`absolute inset-x-0 bottom-0 transition-opacity duration-200 ${controlsVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        <PlayerControls
          paused={paused}
          muted={muted}
          volume={volume}
          onTogglePlay={togglePlay}
          onToggleMute={toggleMute}
          onVolumeChange={changeVolume}
          sources={playableStreams}
          sourceIndex={player.streamIndex}
          onSelectSource={player.switchStream}
          ccAvailable={ccAvailable}
          ccEnabled={ccEnabled}
          onToggleCC={toggleCC}
          canPiP={canPiP}
          onTogglePiP={togglePiP}
          canFullscreen={canFullscreen}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          onPrevious={onPrevious}
          onNext={onNext}
        />
      </div>

      {getRestrictedStreams(channel).length > 0 && playableStreams.length > 0 && (
        <p className="sr-only">Additional sources for this channel require an external player such as VLC.</p>
      )}
    </div>
  )
}
