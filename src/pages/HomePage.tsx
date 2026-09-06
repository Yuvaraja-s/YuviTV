import { CategoryChips } from '../components/browse/CategoryChips'
import { ChannelGrid } from '../components/browse/ChannelGrid'
import { EmptyState } from '../components/browse/EmptyState'
import { FilterBar } from '../components/browse/FilterBar'
import { FilterSheet } from '../components/browse/FilterSheet'
import { useChannels } from '../hooks/useChannels'

export function HomePage() {
  const { channels } = useChannels()

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6">
      <CategoryChips />
      <FilterBar resultCount={channels.length} />
      <FilterSheet resultCount={channels.length} />

      <p className="hidden text-sm text-paper/50 sm:block">{channels.length.toLocaleString()} channels</p>

      {channels.length === 0 ? <EmptyState /> : <ChannelGrid channels={channels} />}
    </div>
  )
}
