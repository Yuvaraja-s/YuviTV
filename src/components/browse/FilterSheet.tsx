import * as Dialog from '@radix-ui/react-dialog'
import { RotateCcw, SlidersHorizontal, WifiOff, X } from 'lucide-react'
import { useState } from 'react'
import { useFilterStore } from '../../store/useFilterStore'
import { CountrySelect } from './CountrySelect'
import { LanguageSelect } from './LanguageSelect'
import { SearchInput } from './SearchInput'
import { SortSelect } from './SortSelect'

interface FilterSheetProps {
  resultCount: number
}

/** Mobile equivalent of FilterBar — a bottom sheet, since a full filter row
 * doesn't fit a phone screen. Filters apply live; the sheet is just a place
 * to reach them without eating permanent screen space on small viewports. */
export function FilterSheet({ resultCount }: FilterSheetProps) {
  const [open, setOpen] = useState(false)
  const { category, country, language, query, hideOffline, setHideOffline, reset } = useFilterStore()
  const activeCount = [category, country, language, query, hideOffline].filter(Boolean).length

  return (
    <div className="flex items-center gap-2 sm:hidden">
      <SearchInput resultCount={resultCount} />
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button
            type="button"
            className="relative flex items-center gap-1.5 rounded-md border border-ink-700 bg-ink-900 px-3 py-1.5 text-sm text-paper/80 transition-transform active:scale-95"
          >
            <SlidersHorizontal size={15} aria-hidden="true" />
            Filters
            {activeCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-web-red text-[10px] font-semibold text-paper">
                {activeCount}
              </span>
            )}
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="animate-sheet-overlay fixed inset-0 z-50 bg-ink-950/80" />
          <Dialog.Content className="animate-sheet-content fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-ink-700 bg-ink-900 p-5 shadow-glow">
            <div className="mb-4 flex items-center justify-between">
              <Dialog.Title className="font-display text-2xl tracking-wide text-paper">Filters</Dialog.Title>
              <Dialog.Close aria-label="Close filters" className="text-paper/60 transition-transform hover:text-paper active:scale-90">
                <X size={20} aria-hidden="true" />
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">Filter channels by country, language, and sort order.</Dialog.Description>

            <div className="flex flex-col gap-3">
              <CountrySelect />
              <LanguageSelect />
              <SortSelect />
              <button
                type="button"
                onClick={() => setHideOffline(!hideOffline)}
                aria-pressed={hideOffline}
                className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2.5 text-sm transition-colors ${
                  hideOffline ? 'border-web-red bg-web-red/15 text-paper' : 'border-ink-700 text-paper/70'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <WifiOff size={14} aria-hidden="true" />
                  Hide offline channels
                </span>
                <span
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${hideOffline ? 'bg-web-red' : 'bg-ink-700'}`}
                  aria-hidden="true"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-paper transition-transform duration-150 ${
                      hideOffline ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </span>
              </button>
            </div>

            <div className="mt-6 flex gap-2">
              {(category || country || language || query || hideOffline) && (
                <button
                  type="button"
                  onClick={reset}
                  className="flex items-center justify-center gap-1.5 rounded-md border border-ink-700 px-4 py-2.5 text-sm text-paper/70 transition-transform active:scale-95"
                >
                  <RotateCcw size={14} aria-hidden="true" />
                  Reset
                </button>
              )}
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="flex-1 rounded-md bg-web-red py-2.5 text-sm font-semibold text-paper shadow-glow-sm transition-transform active:scale-95"
                >
                  Show {resultCount.toLocaleString()} channels
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
