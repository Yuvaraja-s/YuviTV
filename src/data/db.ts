import { createStore, get, set } from 'idb-keyval'
import type { Catalog } from './types'

// Own IndexedDB store (not localStorage) — the catalog is ~10-15MB of
// normalized JSON, well past localStorage's ~5-10MB origin quota.
const store = createStore('yuvitv-catalog', 'kv')

const CATALOG_KEY = 'catalog'

export async function getCachedCatalog(): Promise<Catalog | undefined> {
  return get<Catalog>(CATALOG_KEY, store)
}

export async function setCachedCatalog(catalog: Catalog): Promise<void> {
  await set(CATALOG_KEY, catalog, store)
}
