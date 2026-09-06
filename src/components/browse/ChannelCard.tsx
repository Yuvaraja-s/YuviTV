import { Star } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategoryIcon } from '../../data/categoryIcons'
import type { Channel } from '../../data/types'
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

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-ink-700 bg-ink-900 transition-colors hover:border-ink-600 hover:shadow-glow-sm">
      <Link to={`/watch/${channel.id}`} className="absolute inset-0 z-0 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-web-blue">
        <span className="sr-only">Watch {channel.name}</span>
      </Link>

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
        </div>
      </div>

      <button
        type="button"
        onClick={() => toggle(channel.id)}
        aria-pressed={favorite}
        aria-label={favorite ? `Remove ${channel.name} from favorites` : `Add ${channel.name} to favorites`}
        className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-ink-950/70 text-paper/70 backdrop-blur transition-colors hover:text-web-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-web-blue"
      >
        <Star size={16} aria-hidden="true" fill={favorite ? 'currentColor' : 'none'} className={favorite ? 'text-web-red' : ''} />
      </button>
    </div>
  )
}
