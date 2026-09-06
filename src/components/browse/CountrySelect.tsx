import * as Select from '@radix-ui/react-select'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { useMemo } from 'react'
import { useFacets } from '../../hooks/useFacets'
import { useFilterStore } from '../../store/useFilterStore'
import { CountryFlag } from '../ui/CountryFlag'

const itemClass =
  'flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-paper/80 outline-none data-[highlighted]:bg-ink-800 data-[highlighted]:text-paper'

// regions.json models 42 overlapping groupings (continents, trade blocs, "Worldwide", …),
// not a clean partition — so the country dropdown groups by these 5 true continents only.
// Order also breaks ties for transcontinental countries (e.g. Russia, Turkey → Europe).
const CONTINENT_CODES = ['EUR', 'ASIA', 'AFR', 'AMER', 'OCE']

export function CountrySelect() {
  const { countryOptions, regions } = useFacets()
  const { country, setCountry } = useFilterStore()

  const groups = useMemo(() => {
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

  const selected = countryOptions.find((c) => c.code === country)

  return (
    <Select.Root value={country ?? 'all'} onValueChange={(v) => setCountry(v === 'all' ? null : v)}>
      <Select.Trigger
        aria-label="Filter by country"
        className="flex items-center gap-2 rounded-md border border-ink-700 bg-ink-900 px-3 py-1.5 text-sm text-paper/80 outline-none hover:border-ink-600 data-[state=open]:border-web-blue"
      >
        {selected ? <CountryFlag code={selected.code} className="h-3.5 w-5 rounded-sm" /> : <Globe size={14} aria-hidden="true" />}
        <Select.Value placeholder="All countries">{selected?.name ?? 'All countries'}</Select.Value>
        <Select.Icon>
          <ChevronDown size={14} aria-hidden="true" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          className="z-50 max-h-80 w-64 overflow-hidden rounded-lg border border-ink-700 bg-ink-900 shadow-glow-sm"
        >
          <Select.Viewport className="p-1">
            <Select.Item value="all" className={itemClass}>
              <Globe size={14} aria-hidden="true" />
              <Select.ItemText>All countries</Select.ItemText>
            </Select.Item>
            {groups.map((group) => (
              <Select.Group key={group.name}>
                <Select.Label className="px-2 pt-2 pb-1 text-xs font-semibold tracking-wide text-paper/60 uppercase">
                  {group.name}
                </Select.Label>
                {group.options.map((opt) => (
                  <Select.Item key={opt.code} value={opt.code} className={itemClass}>
                    <CountryFlag code={opt.code} className="h-3.5 w-5 shrink-0 rounded-sm" />
                    <Select.ItemText>{opt.name}</Select.ItemText>
                    <span className="ml-auto text-paper/60">{opt.count.toLocaleString()}</span>
                    <Select.ItemIndicator>
                      <Check size={14} aria-hidden="true" />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Group>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
