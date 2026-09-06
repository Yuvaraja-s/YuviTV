import * as Flags from 'country-flag-icons/react/3x2'

type FlagCode = keyof typeof Flags

interface CountryFlagProps {
  code: string
  className?: string
}

/** SVG flags render consistently cross-platform; Windows in particular
 * renders Unicode regional-indicator flag emoji as plain two-letter codes. */
export function CountryFlag({ code, className }: CountryFlagProps) {
  const Flag = Flags[code as FlagCode]
  if (!Flag) return <span className={className} aria-hidden="true" />
  return <Flag className={className} title="" />
}
