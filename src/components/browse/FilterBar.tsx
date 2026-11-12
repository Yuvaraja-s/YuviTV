import { RotateCcw, Sparkles, WifiOff } from 'lucide-react'
import { Chip } from '../ui/Chip'
import { useFilterStore } from '../../store/useFilterStore'
import { CountrySelect } from './CountrySelect'
import { LanguageSelect } from './LanguageSelect'
import { SearchInput } from './SearchInput'
import { SortSelect } from './SortSelect'

interface FilterBarProps {
  resultCount: number
  isStale?: boolean
}

/** Desktop filter row — search + facet selects + sort, all visible at once. */
export function FilterBar({ resultCount, isStale }: FilterBarProps) {
  const { categories, countries, languages, query, hideOffline, setHideOffline, onlyNew, setOnlyNew, reset } = useFilterStore()
  const hasActiveFilters = Boolean(
    categories.length || countries.length || languages.length || query || hideOffline || onlyNew,
  )

  return (
    <div className="hidden flex-wrap items-center gap-2 sm:flex">
      <SearchInput resultCount={resultCount} isStale={isStale} />
      <CountrySelect />
      <LanguageSelect />
      <SortSelect />
      <Chip active={hideOffline} onClick={() => setHideOffline(!hideOffline)}>
        <span className="flex items-center gap-1.5">
          <WifiOff size={13} aria-hidden="true" />
          Hide offline
        </span>
      </Chip>
      <Chip active={onlyNew} onClick={() => setOnlyNew(!onlyNew)}>
        <span className="flex items-center gap-1.5">
          <Sparkles size={13} aria-hidden="true" />
          New
        </span>
      </Chip>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-paper/60 transition-all duration-150 hover:text-web-cyan active:scale-95"
        >
          <RotateCcw size={14} aria-hidden="true" />
          Reset
        </button>
      )}
    </div>
  )
}
