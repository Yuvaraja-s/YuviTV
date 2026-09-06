import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <p className="font-display text-4xl tracking-wide text-paper">404</p>
      <p className="text-paper/60">This channel doesn't exist on this frequency.</p>
      <Link to="/" className="text-sm text-web-cyan hover:underline">
        Back to browse
      </Link>
    </div>
  )
}
