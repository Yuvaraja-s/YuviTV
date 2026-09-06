import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'

/** The app shell and last-synced catalog work offline (cached via the
 * service worker + IndexedDB) — live playback never can, since it's a
 * connection to a broadcaster's own CDN. This says so, rather than letting
 * Play look clickable and then just fail. */
export function OfflineBanner() {
  const online = useOnlineStatus()
  if (online) return null

  return (
    <div role="status" className="flex items-center justify-center gap-2 bg-web-red-text/10 px-4 py-2 text-center text-sm text-web-red-text">
      <WifiOff size={14} aria-hidden="true" />
      You're offline — browsing cached channels. Playback needs a connection.
    </div>
  )
}
