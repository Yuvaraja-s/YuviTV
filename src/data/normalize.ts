import {
  rawBlocklistSchema,
  rawCategoriesSchema,
  rawChannelsSchema,
  rawCountriesSchema,
  rawFeedsSchema,
  rawLanguagesSchema,
  rawLogosSchema,
  rawRegionsSchema,
  rawStreamsSchema,
  type RawCatalog,
} from './schema'
import type { Catalog, Channel, Stream } from './types'

/** Blocklist reasons we exclude for. Both are on-mission: nsfw for a public,
 * real-name-linked project; dmca because iptv-org already confirmed the
 * takedown, so serving the link ourselves would just repeat their mistake. */
const EXCLUDED_BLOCKLIST_REASONS = new Set(['nsfw', 'dmca'])

function parseRawCatalog(data: Record<string, unknown>): RawCatalog {
  return {
    channels: rawChannelsSchema.parse(data.channels),
    streams: rawStreamsSchema.parse(data.streams),
    feeds: rawFeedsSchema.parse(data.feeds),
    countries: rawCountriesSchema.parse(data.countries),
    regions: rawRegionsSchema.parse(data.regions),
    categories: rawCategoriesSchema.parse(data.categories),
    languages: rawLanguagesSchema.parse(data.languages),
    logos: rawLogosSchema.parse(data.logos),
    blocklist: rawBlocklistSchema.parse(data.blocklist),
  }
}

function pickBestLogo(logos: RawCatalog['logos'][number][]): string | null {
  const usable = logos.filter((l) => l.in_use && !l.feed)
  if (usable.length === 0) return logos[0]?.url ?? null
  const svg = usable.find((l) => l.format?.toUpperCase() === 'SVG')
  return (svg ?? usable[0]).url
}

/**
 * Joins the 9 raw iptv-org endpoints into one flat, playable channel list.
 * Runs inside the catalog worker so the ~26MB of combined JSON never blocks
 * the main thread. Hard-excludes NSFW/xxx/blocklisted/closed/streamless
 * channels — not a UI setting, see the plan's Legal/responsible-use section.
 */
export function normalizeCatalog(raw: Record<string, unknown>, fetchedAt: number): Catalog {
  const data = parseRawCatalog(raw)

  const streamsByChannel = new Map<string, RawCatalog['streams']>()
  for (const s of data.streams) {
    if (!s.channel) continue
    const list = streamsByChannel.get(s.channel) ?? []
    list.push(s)
    streamsByChannel.set(s.channel, list)
  }

  const languagesByChannel = new Map<string, string[]>()
  for (const f of data.feeds) {
    if (!f.is_main) continue
    languagesByChannel.set(f.channel, f.languages)
  }

  const logosByChannel = new Map<string, RawCatalog['logos']>()
  for (const l of data.logos) {
    if (!l.channel) continue
    const list = logosByChannel.get(l.channel) ?? []
    list.push(l)
    logosByChannel.set(l.channel, list)
  }

  const blockedChannelIds = new Set(
    data.blocklist.filter((b) => EXCLUDED_BLOCKLIST_REASONS.has(b.reason)).map((b) => b.channel),
  )

  const channels: Channel[] = []
  for (const c of data.channels) {
    if (c.is_nsfw) continue
    if (c.categories.includes('xxx')) continue
    if (c.closed) continue
    if (blockedChannelIds.has(c.id)) continue

    const rawStreams = streamsByChannel.get(c.id)
    if (!rawStreams || rawStreams.length === 0) continue

    const streams: Stream[] = rawStreams.map((s) => ({
      url: s.url,
      title: s.title,
      quality: s.quality,
      labels: s.labels,
      userAgent: s.user_agent,
      referrer: s.referrer,
    }))

    channels.push({
      id: c.id,
      name: c.name,
      altNames: c.alt_names,
      network: c.network,
      country: c.country,
      categories: c.categories,
      languages: languagesByChannel.get(c.id) ?? [],
      logo: pickBestLogo(logosByChannel.get(c.id) ?? []),
      website: c.website,
      streams,
    })
  }

  return {
    channels,
    categories: data.categories,
    languages: data.languages,
    countries: data.countries.map((c) => ({ code: c.code, name: c.name })),
    regions: data.regions,
    fetchedAt,
  }
}
