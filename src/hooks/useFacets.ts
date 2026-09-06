import { useMemo } from 'react'
import { useCatalogStore } from '../store/useCatalogStore'

export interface FacetOption {
  code: string
  name: string
  count: number
}

/** Counts of each category/country/language actually present in the loaded
 * catalog, so filter UIs only ever offer choices with real results behind them. */
export function useFacets() {
  const channels = useCatalogStore((s) => s.channels)
  const categories = useCatalogStore((s) => s.categories)
  const countries = useCatalogStore((s) => s.countries)
  const languages = useCatalogStore((s) => s.languages)
  const regions = useCatalogStore((s) => s.regions)

  return useMemo(() => {
    const categoryCounts = new Map<string, number>()
    const countryCounts = new Map<string, number>()
    const languageCounts = new Map<string, number>()

    for (const c of channels) {
      for (const cat of c.categories) categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1)
      countryCounts.set(c.country, (countryCounts.get(c.country) ?? 0) + 1)
      for (const lang of c.languages) languageCounts.set(lang, (languageCounts.get(lang) ?? 0) + 1)
    }

    const countryNameByCode = new Map(countries.map((c) => [c.code, c.name]))
    const languageNameByCode = new Map(languages.map((l) => [l.code, l.name]))

    const categoryOptions: FacetOption[] = categories
      .map((cat) => ({ code: cat.id, name: cat.name, count: categoryCounts.get(cat.id) ?? 0 }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count)

    const countryOptions: FacetOption[] = [...countryCounts.entries()]
      .map(([code, count]) => ({ code, name: countryNameByCode.get(code) ?? code, count }))
      .sort((a, b) => a.name.localeCompare(b.name))

    const languageOptions: FacetOption[] = [...languageCounts.entries()]
      .map(([code, count]) => ({ code, name: languageNameByCode.get(code) ?? code, count }))
      .sort((a, b) => b.count - a.count)

    return { categoryOptions, countryOptions, languageOptions, regions }
  }, [channels, categories, countries, languages, regions])
}
