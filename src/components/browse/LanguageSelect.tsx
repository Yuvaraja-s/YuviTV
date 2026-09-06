import * as Select from '@radix-ui/react-select'
import { Check, ChevronDown, Languages } from 'lucide-react'
import { useFacets } from '../../hooks/useFacets'
import { useFilterStore } from '../../store/useFilterStore'

const itemClass =
  'flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-paper/80 outline-none data-[highlighted]:bg-ink-800 data-[highlighted]:text-paper'

export function LanguageSelect() {
  const { languageOptions } = useFacets()
  const { language, setLanguage } = useFilterStore()
  const selected = languageOptions.find((l) => l.code === language)

  return (
    <Select.Root value={language ?? 'all'} onValueChange={(v) => setLanguage(v === 'all' ? null : v)}>
      <Select.Trigger
        aria-label="Filter by language"
        className="flex items-center gap-2 rounded-md border border-ink-700 bg-ink-900 px-3 py-1.5 text-sm text-paper/80 outline-none hover:border-ink-600 data-[state=open]:border-web-blue"
      >
        <Languages size={14} aria-hidden="true" />
        <Select.Value placeholder="All languages">{selected?.name ?? 'All languages'}</Select.Value>
        <Select.Icon>
          <ChevronDown size={14} aria-hidden="true" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          className="z-50 max-h-80 w-60 overflow-hidden rounded-lg border border-ink-700 bg-ink-900 shadow-glow-sm"
        >
          <Select.Viewport className="p-1">
            <Select.Item value="all" className={itemClass}>
              <Languages size={14} aria-hidden="true" />
              <Select.ItemText>All languages</Select.ItemText>
            </Select.Item>
            {languageOptions.map((opt) => (
              <Select.Item key={opt.code} value={opt.code} className={itemClass}>
                <Select.ItemText>{opt.name}</Select.ItemText>
                <span className="ml-auto text-paper/40">{opt.count.toLocaleString()}</span>
                <Select.ItemIndicator>
                  <Check size={14} aria-hidden="true" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
