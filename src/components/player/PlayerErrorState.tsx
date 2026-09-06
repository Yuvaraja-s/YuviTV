import { ArrowLeft, RotateCcw, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Channel } from '../../data/types'

interface PlayerErrorStateProps {
  channel: Channel
  message: string
  onRetry: () => void
}

export function PlayerErrorState({ channel, message, onRetry }: PlayerErrorStateProps) {
  const issueUrl = `https://github.com/Yuvaraja-s/YuviTV/issues/new?labels=broken-stream&title=${encodeURIComponent(
    `Broken stream: ${channel.name} (${channel.id})`,
  )}&body=${encodeURIComponent(`Channel: ${channel.name}\nID: ${channel.id}\nError: ${message}\n\nThis data comes from iptv-org/iptv — the fix may belong upstream.`)}`

  return (
    <div role="alert" aria-live="assertive" className="flex aspect-video flex-col items-center justify-center gap-4 rounded-lg border border-ink-700 bg-ink-900 p-6 text-center">
      <TriangleAlert size={32} aria-hidden="true" className="text-web-red" />
      <p className="text-paper">{message}</p>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-1.5 rounded-md bg-web-red px-3 py-2 text-sm font-semibold text-paper shadow-glow-sm"
        >
          <RotateCcw size={14} aria-hidden="true" />
          Retry
        </button>
        <a
          href={issueUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="flex items-center gap-1.5 rounded-md border border-ink-700 px-3 py-2 text-sm text-paper/80 hover:border-ink-600"
        >
          Report broken stream
        </a>
        <Link to="/" className="flex items-center gap-1.5 rounded-md border border-ink-700 px-3 py-2 text-sm text-paper/80 hover:border-ink-600">
          <ArrowLeft size={14} aria-hidden="true" />
          Back to browse
        </Link>
      </div>
    </div>
  )
}
