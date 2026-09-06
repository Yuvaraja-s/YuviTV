import { create } from 'zustand'
import { getCachedCatalog } from '../data/db'
import type { Catalog, Category, Channel, Country, Language, LoadProgress, Region } from '../data/types'
import type { CatalogWorkerRequest, CatalogWorkerResponse } from '../workers/catalogWorker'

const CACHE_TTL_MS = 12 * 60 * 60 * 1000

type Status = 'idle' | 'loading' | 'ready' | 'error'

interface CatalogState {
  status: Status
  channels: Channel[]
  categories: Category[]
  languages: Language[]
  countries: Country[]
  regions: Region[]
  fetchedAt: number | null
  progress: LoadProgress
  error: string | null
  /** True while a fresh copy is being fetched behind an already-visible cached catalog. */
  revalidating: boolean
  init: () => void
  refresh: () => void
}

function runWorker(onMessage: (msg: CatalogWorkerResponse) => void) {
  const worker = new Worker(new URL('../workers/catalogWorker.ts', import.meta.url), { type: 'module' })
  worker.onmessage = (event: MessageEvent<CatalogWorkerResponse>) => {
    onMessage(event.data)
    if (event.data.type === 'done' || event.data.type === 'error') worker.terminate()
  }
  const request: CatalogWorkerRequest = { type: 'load' }
  worker.postMessage(request)
}

function applyCatalog(catalog: Catalog) {
  return {
    channels: catalog.channels,
    categories: catalog.categories,
    languages: catalog.languages,
    countries: catalog.countries,
    regions: catalog.regions,
    fetchedAt: catalog.fetchedAt,
  }
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  status: 'idle',
  channels: [],
  categories: [],
  languages: [],
  countries: [],
  regions: [],
  fetchedAt: null,
  progress: { stage: 'idle', label: '', pct: null },
  error: null,
  revalidating: false,

  init: () => {
    if (get().status !== 'idle') return
    set({ status: 'loading' })

    getCachedCatalog().then((cached) => {
      const fresh = cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS
      if (cached) {
        set({ status: 'ready', ...applyCatalog(cached), revalidating: !fresh })
      }

      if (fresh) return

      runWorker((msg) => {
        if (msg.type === 'progress') {
          set({ progress: msg.progress })
        } else if (msg.type === 'done') {
          set({ status: 'ready', ...applyCatalog(msg.catalog), revalidating: false, error: null })
        } else if (msg.type === 'error') {
          const hadData = get().channels.length > 0
          set({ status: hadData ? 'ready' : 'error', revalidating: false, error: msg.message })
        }
      })
    })
  },

  refresh: () => {
    set({ revalidating: true, error: null })
    runWorker((msg) => {
      if (msg.type === 'progress') {
        set({ progress: msg.progress })
      } else if (msg.type === 'done') {
        set({ status: 'ready', ...applyCatalog(msg.catalog), revalidating: false, error: null })
      } else if (msg.type === 'error') {
        set({ revalidating: false, error: msg.message })
      }
    })
  },
}))
