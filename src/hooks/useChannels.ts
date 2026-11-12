import { useDeferredValue, useMemo } from 'react'
import { useCatalogStore } from '../store/useCatalogStore'
import { useChannelDiscoveryStore } from '../store/useChannelDiscoveryStore'
import { useChannelHealthStore } from '../store/useChannelHealthStore'
import { useFilterStore } from '../store/useFilterStore'
import type { Channel } from '../data/types'

function matchesQuery(channel: Channel, query: string) {
  if (!query) return true
  const q = query.toLowerCase()
  return (
    channel.name.toLowerCase().includes(q) ||
    channel.altNames.some((n) => n.toLowerCase().includes(q)) ||
    (channel.network?.toLowerCase().includes(q) ?? false)
  )
}

/** Filtered + sorted channel list. Search runs against a deferred query so
 * fast typing never blocks the input while ~10k rows get re-filtered. */
export function useChannels() {
  const channels = useCatalogStore((s) => s.channels)
  const { query, categories, countries, languages, sort, hideOffline, onlyNew } = useFilterStore()
  const deferredQuery = useDeferredValue(query)
  // Subscribed only so the filtered list re-renders as background probes
  // and real playback attempts resolve more channels' health while
  // "hide offline" is active — the lookup itself reads getState() below.
  const healthResults = useChannelHealthStore((s) => s.results)
  const firstSeenAt = useChannelDiscoveryStore((s) => s.firstSeenAt)

  const filtered = useMemo(() => {
    let result = channels.filter(
      (c) =>
        matchesQuery(c, deferredQuery) &&
        (categories.length === 0 || categories.some((cat) => c.categories.includes(cat))) &&
        (countries.length === 0 || countries.includes(c.country)) &&
        (languages.length === 0 || languages.some((lang) => c.languages.includes(lang))) &&
        (!hideOffline || useChannelHealthStore.getState().getStatus(c.id) !== 'offline') &&
        (!onlyNew || useChannelDiscoveryStore.getState().isNew(c.id)),
    )

    result = [...result].sort((a, b) => {
      if (sort === 'name-asc') return a.name.localeCompare(b.name)
      if (sort === 'name-desc') return b.name.localeCompare(a.name)
      if (sort === 'newest') return (firstSeenAt[b.id] ?? 0) - (firstSeenAt[a.id] ?? 0) || a.name.localeCompare(b.name)
      return a.country.localeCompare(b.country) || a.name.localeCompare(b.name)
    })

    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channels, deferredQuery, categories, countries, languages, sort, hideOffline, healthResults, onlyNew, firstSeenAt])

  return { channels: filtered, isStale: query !== deferredQuery }
}
