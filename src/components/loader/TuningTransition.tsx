import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import type { Channel } from '../../data/types'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

interface TuningTransitionProps {
  channel: Channel
}

/**
 * A compressed, one-shot "tuning in" flourish shown when a channel first
 * mounts (VideoPlayer is keyed by channel.id, so this remounts per switch).
 * Purely decorative — pointer-events-none throughout — and self-dismisses.
 */
export function TuningTransition({ channel }: TuningTransitionProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const scanRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (reducedMotion) {
      gsap.to(rootRef.current, { opacity: 0, duration: 0.2, delay: 0.1 })
      return
    }

    const tl = gsap.timeline()
    tl.set(scanRef.current, { top: '-20%' })
      .set(ringRef.current, { scale: 0.6, opacity: 1 })
      .to(rootRef.current, { opacity: 1, duration: 0.06 })
      .to(rootRef.current, { opacity: 0.4, duration: 0.05 })
      .to(rootRef.current, { opacity: 1, duration: 0.05 })
      .to(scanRef.current, { top: '120%', duration: 0.45, ease: 'power1.inOut' }, '<')
      .to(ringRef.current, { scale: 1.3, opacity: 0, duration: 0.4 }, '<')
      .to(rootRef.current, { opacity: 0, duration: 0.25 }, '-=0.1')

    return () => {
      tl.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={rootRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      <div ref={ringRef} className="absolute top-1/2 left-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-web-cyan" />
      <div ref={scanRef} className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-web-cyan/25 to-transparent" />
      <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1">
        {channel.logo && <img src={channel.logo} alt="" className="h-10 max-w-[8rem] object-contain" />}
        <p className="font-mono text-xs tracking-widest text-paper/80 uppercase">{channel.name}</p>
      </div>
    </div>
  )
}
