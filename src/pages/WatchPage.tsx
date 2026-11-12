import { ArrowLeft, Star, WifiOff } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { SimilarChannelsRail } from '../components/player/SimilarChannelsRail'
import { VideoPlayer } from '../components/player/VideoPlayer'
import { CountryFlag } from '../components/ui/CountryFlag'
import { useChannels } from '../hooks/useChannels'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { useCatalogStore } from '../store/useCatalogStore'
import { useFavoritesStore } from '../store/useFavoritesStore'
import { useRecentlyWatchedStore } from '../store/useRecentlyWatchedStore'

export function WatchPage() {
  const { channelId } = useParams<{ channelId: string }>()
  const navigate = useNavigate()
  const allChannels = useCatalogStore((s) => s.channels)
  const { channels: filteredChannels } = useChannels()
  const { isFavorite, toggle } = useFavoritesStore()
  const pushRecent = useRecentlyWatchedStore((s) => s.push)
  const online = useOnlineStatus()

  const channel = useMemo(() => allChannels.find((c) => c.id === channelId), [allChannels, channelId])

  // Prev/next cycles through whatever the browse filters currently show — falls back
  // to the full catalog if this channel was opened directly (e.g. a shared link).
  const list = filteredChannels.some((c) => c.id === channelId) ? filteredChannels : allChannels
  const index = list.findIndex((c) => c.id === channelId)
  const previous = index > 0 ? list[index - 1] : null
  const next = index >= 0 && index < list.length - 1 ? list[index + 1] : null

  useEffect(() => {
    if (channel) pushRecent(channel.id)
  }, [channel, pushRecent])

  if (!channel) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-4 py-24 text-center">
        <p className="text-paper/70">Channel not found — it may have been removed upstream.</p>
        <Link to="/" className="text-sm text-web-cyan hover:underline">
          Back to browse
        </Link>
      </div>
    )
  }

  const favorite = isFavorite(channel.id)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 sm:px-6">
      <Link to="/" className="flex w-fit items-center gap-1.5 text-sm text-paper/60 hover:text-paper">
        <ArrowLeft size={15} aria-hidden="true" />
        Back to browse
      </Link>

      {online ? (
        <VideoPlayer
          key={channel.id}
          channel={channel}
          hasPrevious={Boolean(previous)}
          hasNext={Boolean(next)}
          onPrevious={() => previous && navigate(`/watch/${previous.id}`)}
          onNext={() => next && navigate(`/watch/${next.id}`)}
        />
      ) : (
        <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-lg border border-ink-700 bg-ink-900 text-center">
          <WifiOff size={28} aria-hidden="true" className="text-paper/30" />
          <p className="text-paper/70">Playback needs a connection — you're currently offline.</p>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl tracking-wide text-paper">{channel.name}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-paper/60">
            <CountryFlag code={channel.country} className="h-3 w-4.5 rounded-[1px]" />
            {channel.country}
            <span aria-hidden="true">·</span>
            {channel.categories.join(', ')}
          </div>
        </div>
        <button
          type="button"
          onClick={() => toggle(channel.id)}
          aria-pressed={favorite}
          aria-label={favorite ? `Remove ${channel.name} from favorites` : `Add ${channel.name} to favorites`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink-700 text-paper/70 hover:text-web-cyan"
        >
          <Star size={18} aria-hidden="true" fill={favorite ? 'currentColor' : 'none'} className={favorite ? 'text-web-red' : ''} />
        </button>
      </div>

      <p className="text-xs text-paper/60">
        Keyboard: Space play/pause · M mute · F fullscreen · ↑/↓ volume · ←/→ previous/next channel
      </p>

      <SimilarChannelsRail current={channel} channels={allChannels} />
    </div>
  )
}
