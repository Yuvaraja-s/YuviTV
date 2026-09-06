import { z } from 'zod'

/**
 * Schemas cover only the fields YuviTV actually reads. iptv-org's dataset
 * has more columns than this; validating a subset is enough to catch a
 * breaking upstream shape change without being brittle about fields we
 * don't use. Verified against live payloads from iptv-org.github.io/api/.
 */

export const rawChannelSchema = z.object({
  id: z.string(),
  name: z.string(),
  alt_names: z.array(z.string()).default([]),
  network: z.string().nullable().default(null),
  country: z.string(),
  categories: z.array(z.string()).default([]),
  is_nsfw: z.boolean().default(false),
  closed: z.string().nullable().default(null),
  website: z.string().nullable().default(null),
})
export type RawChannel = z.infer<typeof rawChannelSchema>

export const rawStreamSchema = z.object({
  channel: z.string().nullable().default(null),
  feed: z.string().nullable().default(null),
  title: z.string(),
  url: z.string(),
  quality: z.string().nullable().default(null),
  labels: z.array(z.string()).default([]),
  user_agent: z.string().nullable().default(null),
  referrer: z.string().nullable().default(null),
})
export type RawStream = z.infer<typeof rawStreamSchema>

export const rawFeedSchema = z.object({
  channel: z.string(),
  id: z.string(),
  is_main: z.boolean().default(false),
  languages: z.array(z.string()).default([]),
  format: z.string().nullable().default(null),
})
export type RawFeed = z.infer<typeof rawFeedSchema>

export const rawCountrySchema = z.object({
  name: z.string(),
  code: z.string(),
  languages: z.array(z.string()).default([]),
  flag: z.string().optional(),
})
export type RawCountry = z.infer<typeof rawCountrySchema>

export const rawRegionSchema = z.object({
  code: z.string(),
  name: z.string(),
  countries: z.array(z.string()).default([]),
})
export type RawRegion = z.infer<typeof rawRegionSchema>

export const rawCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
})
export type RawCategory = z.infer<typeof rawCategorySchema>

export const rawLanguageSchema = z.object({
  code: z.string(),
  name: z.string(),
})
export type RawLanguage = z.infer<typeof rawLanguageSchema>

export const rawLogoSchema = z.object({
  channel: z.string().nullable().default(null),
  feed: z.string().nullable().default(null),
  in_use: z.boolean().default(true),
  format: z.string().nullable().default(null),
  url: z.string(),
})
export type RawLogo = z.infer<typeof rawLogoSchema>

export const rawBlocklistEntrySchema = z.object({
  channel: z.string(),
  reason: z.string(),
})
export type RawBlocklistEntry = z.infer<typeof rawBlocklistEntrySchema>

export const rawChannelsSchema = z.array(rawChannelSchema)
export const rawStreamsSchema = z.array(rawStreamSchema)
export const rawFeedsSchema = z.array(rawFeedSchema)
export const rawCountriesSchema = z.array(rawCountrySchema)
export const rawRegionsSchema = z.array(rawRegionSchema)
export const rawCategoriesSchema = z.array(rawCategorySchema)
export const rawLanguagesSchema = z.array(rawLanguageSchema)
export const rawLogosSchema = z.array(rawLogoSchema)
export const rawBlocklistSchema = z.array(rawBlocklistEntrySchema)

export interface RawCatalog {
  channels: RawChannel[]
  streams: RawStream[]
  feeds: RawFeed[]
  countries: RawCountry[]
  regions: RawRegion[]
  categories: RawCategory[]
  languages: RawLanguage[]
  logos: RawLogo[]
  blocklist: RawBlocklistEntry[]
}
