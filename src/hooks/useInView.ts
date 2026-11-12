import { useEffect, useRef, useState, type RefObject } from 'react'

/** Fires once a referenced element first scrolls into (near) view, then
 * disconnects — a one-shot lazy trigger, same idea as `loading="lazy"`. */
export function useInView<T extends Element>(options?: IntersectionObserverInit): { ref: RefObject<T | null>; inView: boolean } {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (inView) return
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true)
    }, options)
    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])

  return { ref, inView }
}
