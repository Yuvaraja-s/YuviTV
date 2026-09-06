import { Heart } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ChannelGrid } from '../components/browse/ChannelGrid'
import { useCatalogStore } from '../store/useCatalogStore'
import { useFavoritesStore } from '../store/useFavoritesStore'

export function FavoritesPage() {
  const channels = useCatalogStore((s) => s.channels)
  const favoriteIds = useFavoritesStore((s) => s.ids)

  const favorites = useMemo(() => {
    const idSet = new Set(favoriteIds)
    return channels.filter((c) => idSet.has(c.id))
  }, [channels, favoriteIds])

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6">
      <h1 className="font-display text-3xl tracking-wide text-paper">Favorites</h1>
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center text-paper/60">
          <Heart size={32} aria-hidden="true" className="text-paper/30" />
          <p>No favorites yet — star a channel while browsing to pin it here.</p>
          <Link to="/" className="text-sm text-web-cyan hover:underline">
            Browse channels
          </Link>
        </div>
      ) : (
        <ChannelGrid channels={favorites} />
      )}
    </div>
  )
}
