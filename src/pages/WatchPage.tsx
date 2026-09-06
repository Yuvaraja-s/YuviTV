import { ArrowLeft, Tv } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CatalogLoading } from '../components/browse/CatalogLoading'
import { CountryFlag } from '../components/ui/CountryFlag'
import { useCatalogStore } from '../store/useCatalogStore'

export function WatchPage() {
  const { channelId } = useParams<{ channelId: string }>()
  const status = useCatalogStore((s) => s.status)
  const channels = useCatalogStore((s) => s.channels)
  const channel = useMemo(() => channels.find((c) => c.id === channelId), [channels, channelId])

  if (status === 'loading' || status === 'error') {
    return <CatalogLoading />
  }

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

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-6 sm:px-6">
      <Link to="/" className="flex w-fit items-center gap-1.5 text-sm text-paper/60 hover:text-paper">
        <ArrowLeft size={15} aria-hidden="true" />
        Back to browse
      </Link>

      <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-lg border border-ink-700 bg-ink-900">
        <Tv size={32} aria-hidden="true" className="text-paper/30" />
        <p className="text-sm text-paper/50">Player arrives in the next update — {channel.streams.length} source(s) found.</p>
      </div>

      <div>
        <h1 className="font-display text-2xl tracking-wide text-paper">{channel.name}</h1>
        <div className="mt-1 flex items-center gap-2 text-sm text-paper/60">
          <CountryFlag code={channel.country} className="h-3 w-4.5 rounded-[1px]" />
          {channel.country}
          <span aria-hidden="true">·</span>
          {channel.categories.join(', ')}
        </div>
      </div>
    </div>
  )
}
