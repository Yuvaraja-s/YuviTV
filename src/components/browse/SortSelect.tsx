import * as Select from '@radix-ui/react-select'
import { ArrowDownAZ, Check, ChevronDown } from 'lucide-react'
import { useFilterStore, type SortKey } from '../../store/useFilterStore'

const OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'name-desc', label: 'Name Z–A' },
  { value: 'country-asc', label: 'Country A–Z' },
]

const itemClass =
  'flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-paper/80 outline-none data-[highlighted]:bg-ink-800 data-[highlighted]:text-paper'

export function SortSelect() {
  const { sort, setSort } = useFilterStore()
  const current = OPTIONS.find((o) => o.value === sort)

  return (
    <Select.Root value={sort} onValueChange={(v) => setSort(v as SortKey)}>
      <Select.Trigger
        aria-label="Sort channels"
        className="flex items-center gap-2 rounded-md border border-ink-700 bg-ink-900 px-3 py-1.5 text-sm text-paper/80 outline-none hover:border-ink-600 data-[state=open]:border-web-blue"
      >
        <ArrowDownAZ size={14} aria-hidden="true" />
        <Select.Value>{current?.label}</Select.Value>
        <Select.Icon>
          <ChevronDown size={14} aria-hidden="true" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content position="popper" sideOffset={6} className="z-50 overflow-hidden rounded-lg border border-ink-700 bg-ink-900 shadow-glow-sm">
          <Select.Viewport className="p-1">
            {OPTIONS.map((opt) => (
              <Select.Item key={opt.value} value={opt.value} className={itemClass}>
                <Select.ItemText>{opt.label}</Select.ItemText>
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
