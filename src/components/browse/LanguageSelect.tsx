import { Languages } from 'lucide-react'
import { useFacets } from '../../hooks/useFacets'
import { useFilterStore } from '../../store/useFilterStore'
import { MultiSelect } from '../ui/MultiSelect'

export function LanguageSelect() {
  const { languageOptions } = useFacets()
  const { languages, toggleLanguage } = useFilterStore()

  return (
    <MultiSelect
      icon={<Languages size={14} aria-hidden="true" />}
      label="Filter by language"
      placeholder="All languages"
      options={languageOptions}
      selected={languages}
      onToggle={toggleLanguage}
    />
  )
}
