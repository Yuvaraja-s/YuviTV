import { ExternalLink, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategoryIcon } from '../../data/categoryIcons'
import type { Channel } from '../../data/types'
import { useInView } from '../../hooks/useInView'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { enqueueHealthProbe } from '../../lib/channelProbeQueue'
import { getPlayableStreams } from '../../lib/streamCapabilities'
import { useChannelDiscoveryStore } from '../../store/useChannelDiscoveryStore'
import { useChannelHealthStore } from '../../store/useChannelHealthStore'
import { useFavoritesStore } from '../../store/useFavoritesStore'
import { CountryFlag } from '../ui/CountryFlag'

function initials(name: string) {
  const words = name.trim().split(/\s+/).slice(0, 2)
  return words.map((w) => w[0]?.toUpperCase()).join('')
}

/** Deterministic-ish accent color so the initials fallback tiles don't all look identical. */
function accentFor(id: string) {
  const palette = ['#e4123a', '#1f6fff', '#4de3ff', '#8a0d24', '#123a8a']
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return palette[hash % palette.length]
}

export function ChannelCard({ channel }: { channel: Channel }) {
  const [logoFailed, setLogoFailed] = useState(false)
  const { isFavorite, toggle } = useFavoritesStore()
  const favorite = isFavorite(channel.id)
  const CategoryIcon = getCategoryIcon(channel.categories[0] ?? '')
  const showLogo = channel.logo && !logoFailed

  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '200px' })
  const online = useOnlineStatus()
  const playableCount = getPlayableStreams(channel).length
  const health = useChannelHealthStore((s) => s.getStatus(channel.id))
  const isNew = useChannelDiscoveryStore((s) => s.isNew(channel.id))

  useEffect(() => {
    if (inView && online && playableCount > 0 && health === 'unknown') {
      enqueueHealthProbe(channel)
    }
  }, [inView, online, playableCount, health, channel])

  return (
    <div
      ref={ref}
      className={`group relative flex h-full flex-col overflow-hidden rounded-lg border border-ink-700 bg-ink-900 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-ink-600 hover:shadow-glow-sm ${
        health === 'offline' ? 'opacity-70' : ''
      }`}
    >
      <Link to={`/watch/${channel.id}`} className="absolute inset-0 z-0 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-web-blue">
        <span className="sr-only">
          Watch {channel.name}
          {health === 'offline' ? ' (reported offline)' : ''}
        </span>
      </Link>

      {playableCount === 0 ? (
        <span className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-full bg-ink-950/70 px-2 py-1 text-[10px] font-medium text-paper/70 backdrop-blur">
          <ExternalLink size={10} aria-hidden="true" />
          VLC only
        </span>
      ) : health === 'online' ? (
        <span className="absolute top-2 left-2 z-10 flex items-center gap-1.5 rounded-full bg-ink-950/70 px-2 py-1 text-[10px] font-medium text-paper/80 backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-web-green" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Live</span>
        </span>
      ) : health === 'offline' ? (
        <span className="absolute top-2 left-2 z-10 flex items-center gap-1.5 rounded-full bg-ink-950/70 px-2 py-1 text-[10px] font-medium text-paper/80 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-web-red-text" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Offline</span>
        </span>
      ) : health === 'checking' ? (
        <span className="absolute top-2 left-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-ink-950/70 backdrop-blur" aria-hidden="true">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-paper/40" />
        </span>
      ) : null}

      <div className="pointer-events-none flex flex-1 flex-col p-3">
        <div className="mb-3 flex aspect-video items-center justify-center rounded-md bg-ink-950">
          {showLogo ? (
            <img
              src={channel.logo!}
              alt=""
              loading="lazy"
              onError={() => setLogoFailed(true)}
              className="max-h-full max-w-[80%] object-contain"
            />
          ) : (
            <span
              className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-paper"
              style={{ backgroundColor: accentFor(channel.id) }}
            >
              {initials(channel.name) || '?'}
            </span>
          )}
        </div>

        <p className="line-clamp-2 text-sm font-medium text-paper">{channel.name}</p>

        <div className="mt-auto flex items-center gap-2 pt-2 text-xs text-paper/50">
          <CountryFlag code={channel.country} className="h-3 w-4.5 shrink-0 rounded-[1px]" />
          <span className="flex items-center gap-1">
            <CategoryIcon size={11} aria-hidden="true" />
            {channel.categories[0] ?? 'general'}
          </span>
          {isNew && (
            <span className="ml-auto shrink-0 rounded-full bg-web-cyan/15 px-1.5 py-0.5 text-[10px] font-semibold text-web-cyan">
              New
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => toggle(channel.id)}
        aria-pressed={favorite}
        aria-label={favorite ? `Remove ${channel.name} from favorites` : `Add ${channel.name} to favorites`}
        className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-ink-950/70 text-paper/70 backdrop-blur transition-all duration-150 hover:scale-110 hover:text-web-cyan active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-web-blue"
      >
        <Star size={16} aria-hidden="true" fill={favorite ? 'currentColor' : 'none'} className={favorite ? 'text-web-red transition-transform' : 'transition-transform'} />
      </button>
    </div>
  )
}
