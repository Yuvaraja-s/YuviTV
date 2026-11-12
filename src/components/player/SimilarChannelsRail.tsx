import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { Channel } from '../../data/types'
import { CountryFlag } from '../ui/CountryFlag'

interface SimilarChannelsRailProps {
  current: Channel
  channels: Channel[]
}

/** Lets a viewer jump straight to another channel from the watch page
 * itself — same category and/or country as the one playing, ranked by how
 * many of those it shares — instead of having to go back to Browse first. */
export function SimilarChannelsRail({ current, channels }: SimilarChannelsRailProps) {
  const similar = useMemo(() => {
    const primaryCategory = current.categories[0]

    return channels
      .map((c) => {
        if (c.id === current.id) return null
        const sharedCategories = c.categories.includes(primaryCategory ?? '') ? 2 : 0
        const sameCountry = c.country === current.country ? 1 : 0
        const score = sharedCategories + sameCountry
        return score > 0 ? { channel: c, score } : null
      })
      .filter((x): x is { channel: Channel; score: number } => x !== null)
      .sort((a, b) => b.score - a.score || a.channel.name.localeCompare(b.channel.name))
      .slice(0, 18)
      .map((x) => x.channel)
  }, [channels, current])

  if (similar.length === 0) return null

  return (
    <section aria-label="Similar channels">
      <h2 className="mb-2 text-sm font-semibold text-paper/70">More like this</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {similar.map((channel) => (
          <Link
            key={channel.id}
            to={`/watch/${channel.id}`}
            className="flex w-36 shrink-0 flex-col gap-1.5 rounded-lg border border-ink-700 bg-ink-900 p-2 transition-all duration-150 hover:-translate-y-0.5 hover:border-ink-600 hover:shadow-glow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-web-blue"
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
              {channel.categories[0] ?? 'general'}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
