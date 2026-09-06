import { RefreshCw, X } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * `registerType: 'prompt'` means a new service worker never swaps in
 * silently mid-session (a bad experience if it happens mid-video) — this
 * toast is the only way an update is ever applied.
 */
export function UpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-fit items-center gap-3 rounded-full border border-ink-700 bg-ink-900 py-2 pr-2 pl-4 shadow-glow-sm">
      <p className="text-sm text-paper">A new version of YuviTV is ready.</p>
      <button
        type="button"
        onClick={() => updateServiceWorker(true)}
        className="flex items-center gap-1.5 rounded-full bg-web-red px-3 py-1.5 text-sm font-semibold text-paper"
      >
        <RefreshCw size={13} aria-hidden="true" />
        Refresh
      </button>
      <button type="button" onClick={() => setNeedRefresh(false)} aria-label="Dismiss" className="text-paper/50 hover:text-paper">
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  )
}
