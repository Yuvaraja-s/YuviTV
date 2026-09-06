import { fetchAllRaw } from '../data/api'
import { setCachedCatalog } from '../data/db'
import { normalizeCatalog } from '../data/normalize'
import type { LoadProgress } from '../data/types'

export type CatalogWorkerRequest = { type: 'load' }

export type CatalogWorkerResponse =
  | { type: 'progress'; progress: LoadProgress }
  | { type: 'done'; catalog: import('../data/types').Catalog }
  | { type: 'error'; message: string }

function post(message: CatalogWorkerResponse) {
  ;(self as unknown as Worker).postMessage(message)
}

self.onmessage = async (event: MessageEvent<CatalogWorkerRequest>) => {
  if (event.data.type !== 'load') return

  try {
    post({ type: 'progress', progress: { stage: 'downloading', label: 'Acquiring channel data…', pct: 0 } })

    const raw = await fetchAllRaw(({ loadedBytes, totalBytes }) => {
      const pct = totalBytes > 0 ? Math.min(99, Math.round((loadedBytes / totalBytes) * 100)) : null
      post({ type: 'progress', progress: { stage: 'downloading', label: 'Acquiring channel data…', pct } })
    })

    post({ type: 'progress', progress: { stage: 'joining', label: 'Decoding signals…', pct: null } })
    const catalog = normalizeCatalog(raw as Record<string, unknown>, Date.now())

    post({ type: 'progress', progress: { stage: 'saving', label: 'Syncing catalog…', pct: null } })
    await setCachedCatalog(catalog)

    post({ type: 'progress', progress: { stage: 'ready', label: 'Catalog ready', pct: 100 } })
    post({ type: 'done', catalog })
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : 'Failed to load catalog' })
  }
}
