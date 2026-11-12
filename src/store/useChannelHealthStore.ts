import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type HealthStatus = 'unknown' | 'checking' | 'online' | 'offline'

interface HealthRecord {
  online: boolean
  checkedAt: number
}

// Past this age a result is treated as 'unknown' again so a channel that
// recovers (or goes down) eventually gets re-probed instead of staying
// pinned to a stale verdict forever.
const STALE_MS = 30 * 60 * 1000
// Unbounded growth would make the persisted blob grow for as long as someone
// keeps the app open and scrolls; capped well above what a single browsing
// session actually touches, oldest results dropped first.
const MAX_RECORDS = 4000

interface ChannelHealthState {
  results: Record<string, HealthRecord>
  checking: Record<string, true>
  getStatus: (id: string) => HealthStatus
  startChecking: (id: string) => void
  reportResult: (id: string, online: boolean) => void
}

export const useChannelHealthStore = create<ChannelHealthState>()(
  persist(
    (set, get) => ({
      results: {},
      checking: {},

      getStatus: (id) => {
        const state = get()
        if (state.checking[id]) return 'checking'
        const record = state.results[id]
        if (!record || Date.now() - record.checkedAt > STALE_MS) return 'unknown'
        return record.online ? 'online' : 'offline'
      },

      startChecking: (id) =>
        set((s) => ({ checking: { ...s.checking, [id]: true } })),

      reportResult: (id, online) =>
        set((s) => {
          const checking = { ...s.checking }
          delete checking[id]

          const entries = Object.entries(s.results)
          entries.push([id, { online, checkedAt: Date.now() }])
          const trimmed =
            entries.length > MAX_RECORDS
              ? entries.sort((a, b) => a[1].checkedAt - b[1].checkedAt).slice(entries.length - MAX_RECORDS)
              : entries

          return { checking, results: Object.fromEntries(trimmed) }
        }),
    }),
    {
      name: 'yuvitv-health',
      // `checking` is transient in-flight state from this session's probes —
      // persisting it would resurrect "checking" forever for any probe that
      // was still running when the tab closed.
      partialize: (s) => ({ results: s.results }),
    },
  ),
)
