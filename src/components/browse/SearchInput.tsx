import { Search, X } from 'lucide-react'
import { useFilterStore } from '../../store/useFilterStore'

interface SearchInputProps {
  resultCount: number
}

export function SearchInput({ resultCount }: SearchInputProps) {
  const { query, setQuery } = useFilterStore()

  return (
    <div className="relative flex-1 sm:max-w-xs">
      <Search size={15} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-paper/40" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search channels…"
        aria-label="Search channels"
        aria-describedby="search-result-count"
        className="w-full rounded-md border border-ink-700 bg-ink-900 py-1.5 pr-8 pl-9 text-sm text-paper placeholder:text-paper/40 outline-none hover:border-ink-600 focus-visible:border-web-blue"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery('')}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 -translate-y-1/2 text-paper/40 hover:text-paper"
        >
          <X size={15} aria-hidden="true" />
        </button>
      )}
      <span id="search-result-count" aria-live="polite" className="sr-only">
        {resultCount.toLocaleString()} channels found
      </span>
    </div>
  )
}
