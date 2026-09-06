import { SearchX } from 'lucide-react'
import { useFilterStore } from '../../store/useFilterStore'

export function EmptyState() {
  const reset = useFilterStore((s) => s.reset)
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center text-paper/60">
      <SearchX size={32} aria-hidden="true" className="text-paper/30" />
      <p>No channels match these filters.</p>
      <button type="button" onClick={reset} className="text-sm text-web-cyan hover:underline">
        Clear filters
      </button>
    </div>
  )
}
