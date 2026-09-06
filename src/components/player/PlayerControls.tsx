import * as Select from '@radix-ui/react-select'
import {
  Captions,
  ChevronDown,
  Maximize,
  Minimize,
  PictureInPicture2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react'
import type { Stream } from '../../data/types'
import { streamLabel } from '../../lib/streamCapabilities'

interface PlayerControlsProps {
  paused: boolean
  muted: boolean
  volume: number
  onTogglePlay: () => void
  onToggleMute: () => void
  onVolumeChange: (v: number) => void
  sources: Stream[]
  sourceIndex: number
  onSelectSource: (index: number) => void
  ccAvailable: boolean
  ccEnabled: boolean
  onToggleCC: () => void
  canPiP: boolean
  onTogglePiP: () => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
  hasPrevious: boolean
  hasNext: boolean
  onPrevious: () => void
  onNext: () => void
}

const iconButtonClass =
  'flex h-9 w-9 items-center justify-center rounded-full text-paper/90 hover:bg-paper/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-web-cyan'

export function PlayerControls(props: PlayerControlsProps) {
  const VolumeIcon = props.muted || props.volume === 0 ? VolumeX : props.volume < 0.5 ? Volume1 : Volume2

  return (
    <div className="flex items-center gap-1 bg-gradient-to-t from-ink-950/95 to-transparent px-3 pt-8 pb-3">
      <button type="button" onClick={props.onPrevious} disabled={!props.hasPrevious} aria-label="Previous channel" className={`${iconButtonClass} disabled:opacity-30`}>
        <SkipBack size={17} aria-hidden="true" />
      </button>

      <button type="button" onClick={props.onTogglePlay} aria-label={props.paused ? 'Play' : 'Pause'} className={iconButtonClass}>
        {props.paused ? <Play size={19} aria-hidden="true" fill="currentColor" /> : <Pause size={19} aria-hidden="true" fill="currentColor" />}
      </button>

      <button type="button" onClick={props.onNext} disabled={!props.hasNext} aria-label="Next channel" className={`${iconButtonClass} disabled:opacity-30`}>
        <SkipForward size={17} aria-hidden="true" />
      </button>

      <button type="button" onClick={props.onToggleMute} aria-label={props.muted ? 'Unmute' : 'Mute'} className={iconButtonClass}>
        <VolumeIcon size={18} aria-hidden="true" />
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={props.muted ? 0 : props.volume}
        onChange={(e) => props.onVolumeChange(Number(e.target.value))}
        aria-label="Volume"
        className="h-1 w-20 accent-web-red"
      />

      <span className="ml-2 flex items-center gap-1.5 rounded-full bg-web-red/20 px-2 py-1 text-xs font-semibold text-web-red">
        <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-web-red" aria-hidden="true" />
        LIVE
      </span>

      <div className="flex-1" />

      {props.sources.length > 1 && (
        <Select.Root value={String(props.sourceIndex)} onValueChange={(v) => props.onSelectSource(Number(v))}>
          <Select.Trigger aria-label="Choose source" className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-paper/80 hover:bg-paper/10">
            <Select.Value>{streamLabel(props.sources[props.sourceIndex], props.sourceIndex)}</Select.Value>
            <Select.Icon>
              <ChevronDown size={12} aria-hidden="true" />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content position="popper" sideOffset={6} className="z-50 overflow-hidden rounded-lg border border-ink-700 bg-ink-900 shadow-glow-sm">
              <Select.Viewport className="p-1">
                {props.sources.map((s, i) => (
                  <Select.Item
                    key={i}
                    value={String(i)}
                    className="cursor-pointer rounded px-3 py-1.5 text-sm text-paper/80 outline-none data-[highlighted]:bg-ink-800 data-[highlighted]:text-paper"
                  >
                    <Select.ItemText>{streamLabel(s, i)}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      )}

      {props.ccAvailable && (
        <button
          type="button"
          onClick={props.onToggleCC}
          aria-pressed={props.ccEnabled}
          aria-label="Toggle captions"
          className={`${iconButtonClass} ${props.ccEnabled ? 'text-web-cyan' : ''}`}
        >
          <Captions size={17} aria-hidden="true" />
        </button>
      )}

      {props.canPiP && (
        <button type="button" onClick={props.onTogglePiP} aria-label="Picture in picture" className={iconButtonClass}>
          <PictureInPicture2 size={16} aria-hidden="true" />
        </button>
      )}

      <button type="button" onClick={props.onToggleFullscreen} aria-label={props.isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} className={iconButtonClass}>
        {props.isFullscreen ? <Minimize size={17} aria-hidden="true" /> : <Maximize size={17} aria-hidden="true" />}
      </button>
    </div>
  )
}
