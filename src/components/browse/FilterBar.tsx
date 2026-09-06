import { RotateCcw } from 'lucide-react'
import { useFilterStore } from '../../store/useFilterStore'
import { CountrySelect } from './CountrySelect'
import { LanguageSelect } from './LanguageSelect'
import { SearchInput } from './SearchInput'
import { SortSelect } from './SortSelect'

interface FilterBarProps {
  resultCount: number
}

/** Desktop filter row — search + facet selects + sort, all visible at once. */
export function FilterBar({ resultCount }: FilterBarProps) {
  const { category, country, language, query, reset } = useFilterStore()
  const hasActiveFilters = Boolean(category || country || language || query)

  return (
    <div className="hidden flex-wrap items-center gap-2 sm:flex">
      <SearchInput resultCount={resultCount} />
      <CountrySelect />
      <LanguageSelect />
      <SortSelect />
      {hasActiveFilters && (
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-paper/60 hover:text-web-cyan"
        >
          <RotateCcw size={14} aria-hidden="true" />
          Reset
        </button>
      )}
    </div>
  )
}
