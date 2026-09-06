/**
 * Cross-browser fullscreen helpers.
 *
 * The standard Fullscreen API (`Element.requestFullscreen`) isn't universal
 * on mobile: iOS Safari doesn't implement it for arbitrary elements at all —
 * only `<video>` gets native fullscreen there, through the older, video-only
 * `webkitEnterFullscreen`/`webkitExitFullscreen` API with its own
 * `webkitbeginfullscreen`/`webkitendfullscreen` events instead of
 * `fullscreenchange`. Older WebKit-based browsers also need the vendor-
 * prefixed `webkitRequestFullscreen`/`webkitExitFullscreen`/
 * `webkitFullscreenElement` forms of the *standard* API. This module tries
 * every path a real device might need instead of only the modern standard
 * one, and reports honestly when none of them exist so the UI can hide the
 * control rather than show a button that silently does nothing.
 */

interface WebkitDocument extends Document {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void> | void
  webkitCancelFullScreen?: () => Promise<void> | void
}

interface WebkitFullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void
  webkitEnterFullscreen?: () => void
  webkitExitFullscreen?: () => void
  webkitDisplayingFullscreen?: boolean
}

export function getFullscreenElement(): Element | null {
  const doc = document as WebkitDocument
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null
}

export function isFullscreenSupported(video: HTMLVideoElement | null): boolean {
  if (document.fullscreenEnabled) return true
  if ((document as WebkitDocument).webkitExitFullscreen) return true
  // iOS Safari: only the <video> element itself can go fullscreen.
  return Boolean(video && (video as WebkitFullscreenElement).webkitEnterFullscreen)
}

export async function enterFullscreen(container: HTMLElement, video: HTMLVideoElement | null): Promise<void> {
  const el = container as WebkitFullscreenElement
  if (el.requestFullscreen) {
    await el.requestFullscreen()
    return
  }
  if (el.webkitRequestFullscreen) {
    await el.webkitRequestFullscreen()
    return
  }
  const webkitVideo = video as WebkitFullscreenElement | null
  if (webkitVideo?.webkitEnterFullscreen) {
    webkitVideo.webkitEnterFullscreen()
    return
  }
  throw new Error('Fullscreen is not supported on this device')
}

export async function exitFullscreen(video: HTMLVideoElement | null): Promise<void> {
  const doc = document as WebkitDocument
  if (document.exitFullscreen) {
    await document.exitFullscreen()
    return
  }
  if (doc.webkitExitFullscreen) {
    await doc.webkitExitFullscreen()
    return
  }
  if (doc.webkitCancelFullScreen) {
    await doc.webkitCancelFullScreen()
    return
  }
  const webkitVideo = video as WebkitFullscreenElement | null
  webkitVideo?.webkitExitFullscreen?.()
}
