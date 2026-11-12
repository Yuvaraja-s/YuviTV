import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SortKey = 'name-asc' | 'name-desc' | 'country-asc' | 'newest'

function toggled(list: string[], code: string): string[] {
  return list.includes(code) ? list.filter((c) => c !== code) : [...list, code]
}

interface FilterState {
  query: string
  /** Each is "any of these" (OR) within the facet, "all facets must match" (AND) across them — see useChannels. */
  categories: string[]
  countries: string[]
  languages: string[]
  sort: SortKey
  hideOffline: boolean
  onlyNew: boolean
  setQuery: (query: string) => void
  toggleCategory: (category: string) => void
  toggleCountry: (country: string) => void
  toggleLanguage: (language: string) => void
  setSort: (sort: SortKey) => void
  setHideOffline: (hideOffline: boolean) => void
  setOnlyNew: (onlyNew: boolean) => void
  reset: () => void
}

const initial = {
  query: '',
  categories: [] as string[],
  countries: [] as string[],
  languages: [] as string[],
  sort: 'name-asc' as SortKey,
  hideOffline: false,
  onlyNew: false,
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      ...initial,
      setQuery: (query) => set({ query }),
      toggleCategory: (category) => set((s) => ({ categories: toggled(s.categories, category) })),
      toggleCountry: (country) => set((s) => ({ countries: toggled(s.countries, country) })),
      toggleLanguage: (language) => set((s) => ({ languages: toggled(s.languages, language) })),
      setSort: (sort) => set({ sort }),
      setHideOffline: (hideOffline) => set({ hideOffline }),
      setOnlyNew: (onlyNew) => set({ onlyNew }),
      reset: () => set(initial),
    }),
    { name: 'yuvitv-filters' },
  ),
)
