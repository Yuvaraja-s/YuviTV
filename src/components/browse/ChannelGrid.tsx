import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'
import type { Channel } from '../../data/types'
import { useElementWidth } from '../../hooks/useElementWidth'
import { ChannelCard } from './ChannelCard'

const MIN_CARD_WIDTH = 200
const GAP = 16
const CARD_HEIGHT = 190

interface ChannelGridProps {
  channels: Channel[]
}

/** Row-based window virtualization: only rows near the viewport ever mount,
 * so a ~10k-channel catalog stays smooth. Column count is derived from real
 * container width rather than a fixed breakpoint, so it scales cleanly
 * between phone (1 column) and ultrawide (6+) alike. */
export function ChannelGrid({ channels }: ChannelGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const width = useElementWidth(containerRef)
  const columns = Math.max(1, Math.floor((width + GAP) / (MIN_CARD_WIDTH + GAP)))
  const rowCount = Math.ceil(channels.length / columns)

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => CARD_HEIGHT + GAP,
    overscan: 4,
    scrollMargin: containerRef.current?.offsetTop ?? 0,
  })

  const items = virtualizer.getVirtualItems()

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
      {items.map((row) => {
        const start = row.index * columns
        const rowChannels = channels.slice(start, start + columns)
        return (
          <div
            key={row.key}
            data-index={row.index}
            ref={virtualizer.measureElement}
            className="absolute top-0 left-0 grid w-full gap-4"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              transform: `translateY(${row.start - virtualizer.options.scrollMargin}px)`,
            }}
          >
            {rowChannels.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} />
            ))}
          </div>
        )
      })}
    </div>
  )
}
