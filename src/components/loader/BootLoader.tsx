import { AnimatePresence, motion } from 'framer-motion'
import gsap from 'gsap'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useMinDelay } from '../../hooks/useMinDelay'
import { useCatalogStore } from '../../store/useCatalogStore'
import { Logo } from '../ui/Logo'

const SignalField = lazy(() => import('../three/SignalField'))

type Phase = 'loading' | 'lockon' | 'done'

const TICKS = Array.from({ length: 12 })

/**
 * "Signal Acquisition" — the app's real boot sequence, gated on the actual
 * catalog fetch (see useCatalogStore), not a fake timer. Self-contained: it
 * mounts once near the root and hides itself via its own AnimatePresence
 * once the catalog is genuinely ready, so nothing else needs to coordinate
 * with it.
 */
export function BootLoader() {
  const status = useCatalogStore((s) => s.status)
  const progress = useCatalogStore((s) => s.progress)
  const error = useCatalogStore((s) => s.error)
  const refresh = useCatalogStore((s) => s.refresh)
  const reducedMotion = usePrefersReducedMotion()
  const minDelayDone = useMinDelay(900)

  const [phase, setPhase] = useState<Phase>('loading')
  const dialRef = useRef<HTMLDivElement>(null)
  const ticksRef = useRef<HTMLDivElement>(null)

  const dataReady = status === 'ready' && minDelayDone

  useEffect(() => {
    if (!dataReady || phase !== 'loading') return

    if (reducedMotion) {
      setPhase('done')
      return
    }

    const tl = gsap.timeline({ onComplete: () => setPhase('done') })
    tl.to(dialRef.current, { x: -3, duration: 0.035 })
      .to(dialRef.current, { x: 3, duration: 0.035 })
      .to(dialRef.current, { x: -2, duration: 0.035 })
      .to(dialRef.current, { x: 0, duration: 0.035 })
      .to(ticksRef.current, { color: '#4de3ff', duration: 0.15 }, '<')
      .to(dialRef.current, { scale: 1.08, duration: 0.15 }, '<')
      .to(dialRef.current, { scale: 1, duration: 0.25 })

    return () => {
      tl.kill()
    }
  }, [dataReady, phase, reducedMotion])

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          exit={reducedMotion ? { opacity: 0 } : { clipPath: 'circle(0% at 50% 50%)' }}
          transition={{ duration: reducedMotion ? 0.3 : 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 overflow-hidden bg-ink-950"
        >
          {!reducedMotion && (
            <div className="absolute inset-0 opacity-40">
              <Suspense fallback={null}>
                <SignalField />
              </Suspense>
            </div>
          )}

          <div ref={dialRef} className="relative flex h-40 w-40 items-center justify-center">
            <div ref={ticksRef} className="absolute inset-0 text-paper/30">
              {TICKS.map((_, i) => (
                <span
                  key={i}
                  className="absolute top-1/2 left-1/2 h-2.5 w-0.5 -translate-x-1/2 bg-current"
                  style={{ transform: `rotate(${i * 30}deg) translateY(-72px)` }}
                />
              ))}
            </div>

            {!reducedMotion && (
              <div
                aria-hidden="true"
                className="animate-radar-sweep absolute inset-3 rounded-full opacity-70"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0%, rgba(228,18,58,0.9) 6%, transparent 22%)',
                }}
              />
            )}

            <div className="absolute inset-6 rounded-full border border-web-blue/40" />
            <Logo size={72} glow={!reducedMotion} />
          </div>

          <div className="flex w-64 flex-col items-center gap-3">
            <p role="status" aria-live="polite" aria-busy={status === 'loading'} className="font-mono text-xs tracking-widest text-web-cyan uppercase">
              {error && status !== 'ready' ? 'Signal lost' : progress.label || 'Booting…'}
            </p>

            {error && status !== 'ready' ? (
              <button
                type="button"
                onClick={refresh}
                className="rounded-md bg-web-red px-4 py-2 text-sm font-semibold text-paper shadow-glow-sm"
              >
                Retry
              </button>
            ) : (
              <div className="h-1 w-full overflow-hidden rounded-full bg-ink-800">
                <div
                  className="h-full bg-gradient-to-r from-web-red to-web-cyan transition-all duration-300"
                  style={{ width: `${progress.pct ?? 100}%` }}
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
