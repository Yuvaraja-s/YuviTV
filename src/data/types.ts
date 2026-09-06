export interface Stream {
  url: string
  title: string
  quality: string | null
  labels: string[]
  /** True when the stream needs a Referer/User-Agent the browser can't set. */
  requiresHeaders: boolean
}

export interface Channel {
  id: string
  name: string
  altNames: string[]
  network: string | null
  country: string
  categories: string[]
  languages: string[]
  logo: string | null
  website: string | null
  streams: Stream[]
}

export interface Category {
  id: string
  name: string
}

export interface Language {
  code: string
  name: string
}

export interface Country {
  code: string
  name: string
}

export interface Region {
  code: string
  name: string
  countries: string[]
}

export interface Catalog {
  channels: Channel[]
  categories: Category[]
  languages: Language[]
  countries: Country[]
  regions: Region[]
  fetchedAt: number
}

export type LoadStage =
  | 'idle'
  | 'downloading'
  | 'joining'
  | 'saving'
  | 'ready'
  | 'error'

export interface LoadProgress {
  stage: LoadStage
  label: string
  /** 0-100, real byte progress while downloading; indeterminate afterwards. */
  pct: number | null
}
