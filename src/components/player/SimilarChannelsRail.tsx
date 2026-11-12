import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { Channel } from '../../data/types'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { enqueueHealthProbe } from '../../lib/channelProbeQueue'
import { useChannelHealthStore } from '../../store/useChannelHealthStore'
import { useFilterStore } from '../../store/useFilterStore'
import { CountryFlag } from '../ui/CountryFlag'

interface SimilarChannelsRailProps {
  current: Channel
  channels: Channel[]
}

const RAIL_SIZE = 18
// Probed pool is larger than what's shown so that, with "hide offline" on,
// a few offline channels among the top matches don't shrink the rail below
// its usual size — the next-best matches backfill instead.
const PROBE_POOL_SIZE = RAIL_SIZE * 3

/** Lets a viewer jump straight to another channel from the watch page
 * itself — ranked by shared category and shared language with the one
 * playing — instead of having to go back to Browse first. */
export function SimilarChannelsRail({ current, channels }: SimilarChannelsRailProps) {
  const hideOffline = useFilterStore((s) => s.hideOffline)
  const online = useOnlineStatus()
  // Subscribed so the rail re-renders as these probes resolve.
  const healthResults = useChannelHealthStore((s) => s.results)

  const ranked = useMemo(() => {
    return channels
      .map((c) => {
        if (c.id === current.id) return null
        const sharedCategory = c.categories.some((cat) => current.categories.includes(cat))
        const sharedLanguage = c.languages.some((lang) => current.languages.includes(lang))
        const score = (sharedCategory ? 2 : 0) + (sharedLanguage ? 1 : 0)
        return score > 0 ? { channel: c, score } : null
      })
      .filter((x): x is { channel: Channel; score: number } => x !== null)
      .sort((a, b) => b.score - a.score || a.channel.name.localeCompare(b.channel.name))
      .map((x) => x.channel)
  }, [channels, current])

  // Only this rail's own small shortlist needs checking — eagerly probing
  // the full ranked list the way the browse grid does would be overkill
  // for ~18 cards, but still needed since these specific channels may
  // never have scrolled into view anywhere else.
  useEffect(() => {
    if (!hideOffline || !online) return
    for (const c of ranked.slice(0, PROBE_POOL_SIZE)) enqueueHealthProbe(c)
  }, [hideOffline, online, ranked])

  const similar = useMemo(() => {
    const pool = ranked.slice(0, PROBE_POOL_SIZE)
    const list = hideOffline ? pool.filter((c) => useChannelHealthStore.getState().getStatus(c.id) !== 'offline') : pool
    return list.slice(0, RAIL_SIZE)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ranked, hideOffline, healthResults])

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
