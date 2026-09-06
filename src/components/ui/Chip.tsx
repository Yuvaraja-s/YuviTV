import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export function Chip({ active, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
        active
          ? 'border-web-red bg-web-red/15 text-paper shadow-glow-sm'
          : 'border-ink-700 bg-ink-900 text-paper/70 hover:border-ink-600 hover:text-paper',
        className,
      )}
      {...props}
    />
  )
}
