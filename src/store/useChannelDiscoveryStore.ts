import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// iptv-org's own data has no "date added" field, so "new" is defined
// relative to this browser: a channel id that wasn't in the catalog the
// last time this store saw it, first observed at the timestamp recorded
// here. The very first catalog this store ever sees is a baseline, not a
// pile of "new" channels — see reconcile().
const NEW_WINDOW_MS = 14 * 24 * 60 * 60 * 1000

interface DiscoveryState {
  /** channel id -> first-seen timestamp, or 0 for baseline (pre-existing,
   * never "new"). Rebuilt on every reconcile to track only ids currently in
   * the catalog, so this never grows past the catalog's own size. */
  firstSeenAt: Record<string, number>
  seeded: boolean
  reconcile: (channelIds: string[]) => void
  isNew: (id: string) => boolean
}

export const useChannelDiscoveryStore = create<DiscoveryState>()(
  persist(
    (set, get) => ({
      firstSeenAt: {},
      seeded: false,

      reconcile: (channelIds) =>
        set((s) => {
          if (!s.seeded) {
            const baseline: Record<string, number> = {}
            for (const id of channelIds) baseline[id] = 0
            return { firstSeenAt: baseline, seeded: true }
          }

          const now = Date.now()
          const next: Record<string, number> = {}
          for (const id of channelIds) {
            next[id] = id in s.firstSeenAt ? s.firstSeenAt[id] : now
          }
          return { firstSeenAt: next }
        }),

      isNew: (id) => {
        const seenAt = get().firstSeenAt[id]
        return Boolean(seenAt) && Date.now() - seenAt < NEW_WINDOW_MS
      },
    }),
    { name: 'yuvitv-discovery' },
  ),
)
