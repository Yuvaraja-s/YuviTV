import { RotateCcw, WifiOff } from 'lucide-react'
import { Chip } from '../ui/Chip'
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
  const { category, country, language, query, hideOffline, setHideOffline, reset } = useFilterStore()
  const hasActiveFilters = Boolean(category || country || language || query || hideOffline)

  return (
    <div className="hidden flex-wrap items-center gap-2 sm:flex">
      <SearchInput resultCount={resultCount} />
      <CountrySelect />
      <LanguageSelect />
      <SortSelect />
      <Chip active={hideOffline} onClick={() => setHideOffline(!hideOffline)}>
        <span className="flex items-center gap-1.5">
          <WifiOff size={13} aria-hidden="true" />
          Hide offline
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
