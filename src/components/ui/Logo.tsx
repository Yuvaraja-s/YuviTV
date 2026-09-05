import { cn } from '../../lib/cn'

interface LogoProps {
  size?: number
  className?: string
  /** Idle pulse-glow, used for chrome placements (navbar, footer). */
  glow?: boolean
}

/**
 * The "Signal Play" mark: a play triangle fused with broadcast arcs, built
 * with the same radial-gradient + ring technique as the portfolio's favicon
 * (yuvaraja-s.github.io/portfolio) so the two brands read as one family.
 */
export function Logo({ size = 40, className, glow = false }: LogoProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label="YuviTV"
      className={cn(glow && 'animate-pulse-glow', className)}
    >
      <defs>
        <radialGradient id="yuvitv-logo-g" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#e4123a" />
          <stop offset="100%" stopColor="#05070d" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="31" fill="url(#yuvitv-logo-g)" stroke="#1f6fff" strokeWidth="1.5" />
      <g stroke="#f4f1e8" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.9">
        <path d="M22,19 L22,45 L41,32 Z" fill="#f4f1e8" stroke="none" />
        <path d="M45.6,25.5 A8,8 0 0 1 45.6,38.6" />
        <path d="M48.7,20.9 A13.5,13.5 0 0 1 48.7,43.1" />
        <path d="M51.9,16.4 A19,19 0 0 1 51.9,47.6" />
      </g>
    </svg>
  )
}
