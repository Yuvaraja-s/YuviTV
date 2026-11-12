import { Loader2 } from 'lucide-react'
import { CategoryChips } from '../components/browse/CategoryChips'
import { ChannelGrid } from '../components/browse/ChannelGrid'
import { ContinueWatchingRail } from '../components/browse/ContinueWatchingRail'
import { EmptyState } from '../components/browse/EmptyState'
import { FilterBar } from '../components/browse/FilterBar'
import { FilterSheet } from '../components/browse/FilterSheet'
import { useChannels } from '../hooks/useChannels'
import { useCatalogStore } from '../store/useCatalogStore'

export function HomePage() {
  const { channels, isStale } = useChannels()
  const revalidating = useCatalogStore((s) => s.revalidating)

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6">
      <ContinueWatchingRail />
      <CategoryChips />
      <FilterBar resultCount={channels.length} isStale={isStale} />
      <FilterSheet resultCount={channels.length} isStale={isStale} />

      <p className="hidden items-center gap-1.5 text-sm text-paper/50 sm:flex">
        {channels.length.toLocaleString()} channels
        {revalidating && (
          <span className="flex items-center gap-1 text-paper/40">
            <Loader2 size={12} aria-hidden="true" className="animate-spin" />
            Updating…
          </span>
        )}
      </p>

      {channels.length === 0 ? <EmptyState /> : <ChannelGrid channels={channels} />}
    </div>
  )
}
