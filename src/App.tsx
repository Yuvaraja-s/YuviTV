import { MotionConfig, motion } from 'framer-motion'
import { Footer } from './components/layout/Footer'
import { Logo } from './components/ui/Logo'

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col">
        <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative flex h-28 w-28 items-center justify-center"
          >
            <span
              aria-hidden="true"
              className="animate-radar-sweep absolute inset-0 rounded-full border-t-2 border-web-cyan/60"
            />
            <Logo size={88} glow />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          >
            <h1 className="font-display text-5xl tracking-wide text-paper sm:text-6xl">
              Yuvi<span className="text-web-red">TV</span>
            </h1>
            <p className="mx-auto mt-4 max-w-md font-mono text-sm tracking-wide text-web-cyan uppercase">
              Signal acquisition in progress
            </p>
            <p className="mx-auto mt-3 max-w-lg text-paper/60">
              A free, open browser for live IPTV channels from around the world — filterable by language,
              region, and category. The full channel catalog and player are coming online soon.
            </p>
          </motion.div>
        </main>
        <Footer />
      </div>
    </MotionConfig>
  )
}

export default App
