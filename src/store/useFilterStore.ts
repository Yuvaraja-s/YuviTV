import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SortKey = 'name-asc' | 'name-desc' | 'country-asc'

interface FilterState {
  query: string
  category: string | null
  country: string | null
  language: string | null
  sort: SortKey
  setQuery: (query: string) => void
  setCategory: (category: string | null) => void
  setCountry: (country: string | null) => void
  setLanguage: (language: string | null) => void
  setSort: (sort: SortKey) => void
  reset: () => void
}

const initial = {
  query: '',
  category: null,
  country: null,
  language: null,
  sort: 'name-asc' as SortKey,
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      ...initial,
      setQuery: (query) => set({ query }),
      setCategory: (category) => set((s) => ({ category: s.category === category ? null : category })),
      setCountry: (country) => set({ country }),
      setLanguage: (language) => set({ language }),
      setSort: (sort) => set({ sort }),
      reset: () => set(initial),
    }),
    { name: 'yuvitv-filters' },
  ),
)
