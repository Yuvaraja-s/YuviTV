import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Check, ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

export interface MultiSelectOption {
  code: string
  name: string
  count: number
}

export interface MultiSelectGroup {
  name: string
  options: MultiSelectOption[]
}

interface MultiSelectProps {
  icon: ReactNode
  label: string
  placeholder: string
  /** Either a flat list or pre-grouped (e.g. countries by continent) — pass whichever this facet needs. */
  options: MultiSelectOption[] | MultiSelectGroup[]
  selected: string[]
  onToggle: (code: string) => void
  renderOptionIcon?: (code: string) => ReactNode
}

const itemClass =
  'flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-paper/80 outline-none data-[highlighted]:bg-ink-800 data-[highlighted]:text-paper'

function isGrouped(options: MultiSelectProps['options']): options is MultiSelectGroup[] {
  return options.length > 0 && 'options' in options[0]
}

/**
 * A checklist dropdown for "any of these" facet filters (country, language),
 * built on Radix DropdownMenu rather than Select since Select is strictly
 * single-value. Each CheckboxItem calls preventDefault on select so picking
 * one option doesn't close the menu — the whole point of a multi-select is
 * picking several without reopening it each time.
 */
export function MultiSelect({ icon, label, placeholder, options, selected, onToggle, renderOptionIcon }: MultiSelectProps) {
  const grouped = isGrouped(options)
  const flatOptions = grouped ? options.flatMap((g) => g.options) : options
  const selectedNames = flatOptions.filter((o) => selected.includes(o.code)).map((o) => o.name)

  const summary =
    selectedNames.length === 0
      ? placeholder
      : selectedNames.length === 1
        ? selectedNames[0]
        : `${selectedNames[0]} +${selectedNames.length - 1}`

  const renderItem = (opt: MultiSelectOption) => {
    const checked = selected.includes(opt.code)
    return (
      <DropdownMenu.CheckboxItem
        key={opt.code}
        checked={checked}
        onSelect={(e) => e.preventDefault()}
        onCheckedChange={() => onToggle(opt.code)}
        className={itemClass}
      >
        {renderOptionIcon?.(opt.code)}
        <span className="flex-1">{opt.name}</span>
        <span className="text-paper/60">{opt.count.toLocaleString()}</span>
        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
          {checked && <Check size={14} aria-hidden="true" />}
        </span>
      </DropdownMenu.CheckboxItem>
    )
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label={label}
        className="flex items-center gap-2 rounded-md border border-ink-700 bg-ink-900 px-3 py-1.5 text-sm text-paper/80 outline-none hover:border-ink-600 data-[state=open]:border-web-blue"
      >
        {icon}
        <span className="max-w-32 truncate sm:max-w-40">{summary}</span>
        {selectedNames.length > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-web-red px-1 text-[10px] font-semibold text-paper">
            {selectedNames.length}
          </span>
        )}
        <ChevronDown size={14} aria-hidden="true" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={6}
          className="z-50 max-h-80 w-64 overflow-y-auto rounded-lg border border-ink-700 bg-ink-900 p-1 shadow-glow-sm"
        >
          {grouped
            ? options.map((group) => (
                <DropdownMenu.Group key={group.name}>
                  <DropdownMenu.Label className="px-2 pt-2 pb-1 text-xs font-semibold tracking-wide text-paper/60 uppercase">
                    {group.name}
                  </DropdownMenu.Label>
                  {group.options.map(renderItem)}
                </DropdownMenu.Group>
              ))
            : options.map(renderItem)}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
