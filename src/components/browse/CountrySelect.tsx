import { Globe } from 'lucide-react'
import { useMemo } from 'react'
import { useFacets } from '../../hooks/useFacets'
import { useFilterStore } from '../../store/useFilterStore'
import { MultiSelect, type MultiSelectGroup } from '../ui/MultiSelect'
import { CountryFlag } from '../ui/CountryFlag'

// regions.json models 42 overlapping groupings (continents, trade blocs, "Worldwide", …),
// not a clean partition — so the country dropdown groups by these 5 true continents only.
// Order also breaks ties for transcontinental countries (e.g. Russia, Turkey → Europe).
const CONTINENT_CODES = ['EUR', 'ASIA', 'AFR', 'AMER', 'OCE']

export function CountrySelect() {
  const { countryOptions, regions } = useFacets()
  const { countries, toggleCountry } = useFilterStore()

  const groups: MultiSelectGroup[] = useMemo(() => {
    const byCode = new Map(countryOptions.map((c) => [c.code, c]))
    const regionByCode = new Map(regions.map((r) => [r.code, r]))
    const used = new Set<string>()

    const grouped = CONTINENT_CODES.map((code) => regionByCode.get(code))
      .filter((r): r is NonNullable<typeof r> => Boolean(r))
      .map((region) => {
        const options = region.countries
          .filter((code) => !used.has(code))
          .map((code) => byCode.get(code))
          .filter((o): o is NonNullable<typeof o> => Boolean(o))
        options.forEach((o) => used.add(o.code))
        return { name: region.name, options: options.sort((a, b) => a.name.localeCompare(b.name)) }
      })
      .filter((g) => g.options.length > 0)

    const rest = countryOptions.filter((o) => !used.has(o.code)).sort((a, b) => a.name.localeCompare(b.name))
    if (rest.length > 0) grouped.push({ name: 'Other', options: rest })
    return grouped
  }, [countryOptions, regions])

  return (
    <MultiSelect
      icon={<Globe size={14} aria-hidden="true" />}
      label="Filter by country"
      placeholder="All countries"
      options={groups}
      selected={countries}
      onToggle={toggleCountry}
      renderOptionIcon={(code) => <CountryFlag code={code} className="h-3.5 w-5 shrink-0 rounded-sm" />}
    />
  )
}
