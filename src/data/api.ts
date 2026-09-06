const BASE = 'https://iptv-org.github.io/api'

export const ENDPOINTS = {
  channels: `${BASE}/channels.json`,
  streams: `${BASE}/streams.json`,
  feeds: `${BASE}/feeds.json`,
  countries: `${BASE}/countries.json`,
  regions: `${BASE}/regions.json`,
  categories: `${BASE}/categories.json`,
  languages: `${BASE}/languages.json`,
  logos: `${BASE}/logos.json`,
  blocklist: `${BASE}/blocklist.json`,
} as const

export type EndpointKey = keyof typeof ENDPOINTS

/**
 * Fetches one endpoint, reporting real bytes-received progress via
 * `onBytes` as the response streams in (falls back to a single jump to
 * 100% if the server omits Content-Length or streaming isn't available).
 */
async function fetchJsonWithProgress(url: string, onBytes: (loaded: number, total: number) => void): Promise<unknown> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)

  const total = Number(res.headers.get('content-length') ?? 0)
  if (!res.body || !total) {
    const json = await res.json()
    onBytes(total, total)
    return json
  }

  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let loaded = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    loaded += value.byteLength
    onBytes(loaded, total)
  }
  const bytes = new Uint8Array(loaded)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return JSON.parse(new TextDecoder().decode(bytes))
}

export interface FetchAllProgress {
  loadedBytes: number
  totalBytes: number
}

/** Fetches every endpoint in parallel, aggregating byte progress across all of them. */
export async function fetchAllRaw(onProgress: (p: FetchAllProgress) => void): Promise<Record<EndpointKey, unknown>> {
  const keys = Object.keys(ENDPOINTS) as EndpointKey[]
  const perEndpoint = new Map<EndpointKey, { loaded: number; total: number }>()
  for (const key of keys) perEndpoint.set(key, { loaded: 0, total: 0 })

  const report = () => {
    let loadedBytes = 0
    let totalBytes = 0
    for (const v of perEndpoint.values()) {
      loadedBytes += v.loaded
      totalBytes += v.total
    }
    onProgress({ loadedBytes, totalBytes })
  }

  const entries = await Promise.all(
    keys.map(async (key) => {
      const data = await fetchJsonWithProgress(ENDPOINTS[key], (loaded, total) => {
        perEndpoint.set(key, { loaded, total })
        report()
      })
      return [key, data] as const
    }),
  )

  return Object.fromEntries(entries) as Record<EndpointKey, unknown>
}
