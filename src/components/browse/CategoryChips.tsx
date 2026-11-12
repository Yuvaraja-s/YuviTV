import { getCategoryIcon } from '../../data/categoryIcons'
import { useFacets } from '../../hooks/useFacets'
import { useFilterStore } from '../../store/useFilterStore'
import { Chip } from '../ui/Chip'

export function CategoryChips() {
  const { categoryOptions } = useFacets()
  const { categories, toggleCategory } = useFilterStore()

  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin] [-webkit-overflow-scrolling:touch]"
    >
      {categoryOptions.map((opt) => {
        const Icon = getCategoryIcon(opt.code)
        const active = categories.includes(opt.code)
        return (
          <Chip key={opt.code} active={active} onClick={() => toggleCategory(opt.code)}>
            <span className="flex items-center gap-1.5">
              <Icon size={14} aria-hidden="true" />
              {opt.name}
              <span className="text-paper/60">{opt.count.toLocaleString()}</span>
            </span>
          </Chip>
        )
      })}
    </div>
  )
}
