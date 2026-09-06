import { Heart } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { Logo } from '../ui/Logo'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn('text-sm font-medium transition-colors', isActive ? 'text-web-cyan' : 'text-paper/70 hover:text-paper')

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950/90 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2">
          <Logo size={32} />
          <span className="font-display text-xl tracking-wide text-paper">
            Yuvi<span className="text-web-red-text">TV</span>
          </span>
        </NavLink>

        <div className="flex items-center gap-5">
          <NavLink to="/" end className={navLinkClass}>
            Browse
          </NavLink>
          <NavLink to="/favorites" className={navLinkClass}>
            <span className="flex items-center gap-1.5">
              <Heart size={15} aria-hidden="true" />
              Favorites
            </span>
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
        </div>
      </nav>
    </header>
  )
}
