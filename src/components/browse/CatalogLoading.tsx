import { useCatalogStore } from '../../store/useCatalogStore'
import { Logo } from '../ui/Logo'

/**
 * Placeholder boot state for Phase 2 — shows real progress from the worker,
 * just without the full "Signal Acquisition" choreography yet. Phase 4
 * replaces this with the real BootLoader built on the same store fields.
 */
export function CatalogLoading() {
  const { progress, error } = useCatalogStore()
  const refresh = useCatalogStore((s) => s.refresh)

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-web-red">Couldn't load the channel catalog: {error}</p>
        <button type="button" onClick={refresh} className="rounded-md bg-web-red px-4 py-2 text-sm font-semibold text-paper">
          Try again
        </button>
      </div>
    )
  }

  return (
    <div role="status" aria-live="polite" aria-busy="true" className="flex flex-col items-center gap-4 py-24 text-center">
      <Logo size={56} glow />
      <p className="font-mono text-sm tracking-wide text-web-cyan uppercase">{progress.label || 'Booting…'}</p>
      {progress.pct !== null && (
        <div className="h-1.5 w-56 overflow-hidden rounded-full bg-ink-800">
          <div className="h-full bg-web-red transition-all" style={{ width: `${progress.pct}%` }} />
        </div>
      )}
    </div>
  )
}
