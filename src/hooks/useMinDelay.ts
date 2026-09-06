import { useEffect, useState } from 'react'

/** True once at least `ms` has elapsed since mount — used to give a loader
 * a floor duration so it never flashes on a fast/cached load. */
export function useMinDelay(ms: number) {
  const [elapsed, setElapsed] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setElapsed(true), ms)
    return () => clearTimeout(t)
  }, [ms])
  return elapsed
}
