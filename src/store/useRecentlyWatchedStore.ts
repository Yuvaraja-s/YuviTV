import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const MAX_RECENTS = 20

interface RecentlyWatchedState {
  ids: string[]
  push: (id: string) => void
}

export const useRecentlyWatchedStore = create<RecentlyWatchedState>()(
  persist(
    (set) => ({
      ids: [],
      push: (id) =>
        set((s) => ({
          ids: [id, ...s.ids.filter((x) => x !== id)].slice(0, MAX_RECENTS),
        })),
    }),
    { name: 'yuvitv-recently-watched' },
  ),
)
