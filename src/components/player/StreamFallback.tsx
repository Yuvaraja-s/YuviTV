import { Copy, ExternalLink, Globe } from 'lucide-react'
import { useState } from 'react'
import type { Channel } from '../../data/types'
import { getRestrictedStreams } from '../../lib/streamCapabilities'

interface StreamFallbackProps {
  channel: Channel
}

/** Shown when every stream for this channel needs headers a browser can't
 * send — nothing here will ever play in-page, so we don't pretend to try. */
export function StreamFallback({ channel }: StreamFallbackProps) {
  const [copied, setCopied] = useState(false)
  const restricted = getRestrictedStreams(channel)
  const url = restricted[0]?.url

  const copyLink = async () => {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex aspect-video flex-col items-center justify-center gap-4 rounded-lg border border-ink-700 bg-ink-900 p-6 text-center">
      <Globe size={32} aria-hidden="true" className="text-paper/30" />
      <div>
        <p className="text-paper">This channel's stream needs a player that can send a custom header.</p>
        <p className="mt-1 text-sm text-paper/50">It won't play here, but VLC and similar apps can open it directly.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={copyLink}
          disabled={!url}
          className="flex items-center gap-1.5 rounded-md border border-ink-700 px-3 py-2 text-sm text-paper/80 hover:border-ink-600"
        >
          <Copy size={14} aria-hidden="true" />
          {copied ? 'Copied!' : 'Copy stream link'}
        </button>
        {channel.website && (
          <a
            href={channel.website}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-1.5 rounded-md border border-ink-700 px-3 py-2 text-sm text-paper/80 hover:border-ink-600"
          >
            <ExternalLink size={14} aria-hidden="true" />
            Official site
          </a>
        )}
      </div>
    </div>
  )
}
