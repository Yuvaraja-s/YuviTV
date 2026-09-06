import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCatalogStore } from '../../store/useCatalogStore'
import { useRecentlyWatchedStore } from '../../store/useRecentlyWatchedStore'
import { CountryFlag } from '../ui/CountryFlag'

export function ContinueWatchingRail() {
  const channels = useCatalogStore((s) => s.channels)
  const recentIds = useRecentlyWatchedStore((s) => s.ids)

  const recents = useMemo(() => {
    const byId = new Map(channels.map((c) => [c.id, c]))
    return recentIds.map((id) => byId.get(id)).filter((c): c is NonNullable<typeof c> => Boolean(c))
  }, [channels, recentIds])

  if (recents.length === 0) return null

  return (
    <section aria-label="Continue watching">
      <h2 className="mb-2 text-sm font-semibold text-paper/70">Continue watching</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {recents.map((channel) => (
          <Link
            key={channel.id}
            to={`/watch/${channel.id}`}
            className="flex w-36 shrink-0 flex-col gap-1.5 rounded-lg border border-ink-700 bg-ink-900 p-2 transition-colors hover:border-ink-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-web-blue"
          >
            <span className="flex aspect-video items-center justify-center overflow-hidden rounded bg-ink-950">
              {channel.logo ? (
                <img src={channel.logo} alt="" loading="lazy" className="max-h-full max-w-[80%] object-contain" />
              ) : (
                <span className="text-xs text-paper/40">{channel.name.slice(0, 2).toUpperCase()}</span>
              )}
            </span>
            <span className="line-clamp-1 text-xs font-medium text-paper">{channel.name}</span>
            <span className="flex items-center gap-1 text-[11px] text-paper/50">
              <CountryFlag code={channel.country} className="h-2.5 w-4 shrink-0 rounded-[1px]" />
              {channel.country}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
