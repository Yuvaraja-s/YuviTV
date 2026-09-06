import { MotionConfig } from 'framer-motion'
import { useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { BootLoader } from './components/loader/BootLoader'
import { Footer } from './components/layout/Footer'
import { Navbar } from './components/layout/Navbar'
import { SkipToContent } from './components/layout/SkipToContent'
import { OfflineBanner } from './components/ui/OfflineBanner'
import { UpdateToast } from './components/ui/UpdateToast'
import { AboutPage } from './pages/AboutPage'
import { DisclaimerPage } from './pages/DisclaimerPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { WatchPage } from './pages/WatchPage'
import { useCatalogStore } from './store/useCatalogStore'

function App() {
  const init = useCatalogStore((s) => s.init)

  useEffect(() => {
    init()
  }, [init])

  return (
    <MotionConfig reducedMotion="user">
      <BootLoader />
      <HashRouter>
        <div className="flex min-h-screen flex-col">
          <SkipToContent />
          <OfflineBanner />
          <Navbar />
          <main id="main-content" className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/watch/:channelId" element={<WatchPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/disclaimer" element={<DisclaimerPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <UpdateToast />
      </HashRouter>
    </MotionConfig>
  )
}

export default App
