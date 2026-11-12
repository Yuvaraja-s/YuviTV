/**
 * YuviTV stream proxy — optional, free-tier Cloudflare Worker.
 *
 * Some channels in the iptv-org catalog list a stream whose origin server
 * only serves it to requests carrying a specific Referer/User-Agent (the
 * same two headers a desktop player like VLC sends). A browser's own
 * <video>/hls.js can't set those on a media request, so without this proxy
 * those streams are excluded from in-page playback entirely (see
 * src/lib/streamCapabilities.ts) and offered instead as "open in VLC".
 *
 * This Worker is a thin, stateless pass-through: it forwards the request
 * with the headers the origin already expects, and — because an .m3u8
 * playlist's own URIs would otherwise point straight at the origin,
 * skipping the proxy for every subsequent segment — rewrites each URI it
 * contains to route back through this same Worker. It does not store,
 * transcode, inspect, or modify the media itself.
 *
 * Deploy: see README.md in this folder.
 */

const MANIFEST_EXTENSION = /\.m3u8(?:\?|$)/i
const MANIFEST_CONTENT_TYPE = /mpegurl/i
// A playlist is tiny text; this is only to reject something pathological
// (a misconfigured origin streaming raw video at this URL) before it's
// buffered into memory for rewriting.
const MAX_MANIFEST_BYTES = 5 * 1024 * 1024

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Range, Content-Type',
    'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
  }
}

function proxiedUrl(absoluteTargetUrl, selfBase, ua, ref, key) {
  const out = new URL(selfBase)
  out.searchParams.set('url', absoluteTargetUrl)
  if (ua) out.searchParams.set('ua', ua)
  if (ref) out.searchParams.set('ref', ref)
  if (key) out.searchParams.set('key', key)
  return out.toString()
}

/** Rewrites every URI reference in an HLS playlist — segment lines, variant
 * playlist lines, and URI="..." attributes on tags like EXT-X-KEY/EXT-X-MAP
 * — so each one routes back through this proxy instead of hitting the
 * origin directly (which would drop the headers on every request after
 * the first). */
function rewriteManifest(text, targetUrl, selfBase, ua, ref, key) {
  return text
    .split('\n')
    .map((line) => {
      const trimmed = line.trim()
      if (!trimmed) return line

      if (trimmed.startsWith('#')) {
        return line.replace(/URI="([^"]+)"/i, (_match, uri) => {
          const absolute = new URL(uri, targetUrl).toString()
          return `URI="${proxiedUrl(absolute, selfBase, ua, ref, key)}"`
        })
      }

      const absolute = new URL(trimmed, targetUrl).toString()
      return proxiedUrl(absolute, selfBase, ua, ref, key)
    })
    .join('\n')
}

async function handleStream(request, url, env) {
  const target = url.searchParams.get('url')
  if (!target) return new Response('Missing "url" parameter', { status: 400 })

  let targetUrl
  try {
    targetUrl = new URL(target)
  } catch {
    return new Response('Invalid "url" parameter', { status: 400 })
  }
  if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
    return new Response('Unsupported protocol', { status: 400 })
  }

  const ua = url.searchParams.get('ua') || undefined
  const ref = url.searchParams.get('ref') || undefined

  const upstreamHeaders = new Headers()
  if (ua) upstreamHeaders.set('User-Agent', ua)
  if (ref) upstreamHeaders.set('Referer', ref)
  const range = request.headers.get('Range')
  if (range) upstreamHeaders.set('Range', range)

  const upstream = await fetch(targetUrl.toString(), {
    headers: upstreamHeaders,
    redirect: 'follow',
  })

  const contentType = upstream.headers.get('content-type') || ''
  const isManifest = MANIFEST_CONTENT_TYPE.test(contentType) || MANIFEST_EXTENSION.test(targetUrl.pathname)

  if (isManifest) {
    const contentLength = Number(upstream.headers.get('content-length') || 0)
    if (contentLength && contentLength > MAX_MANIFEST_BYTES) {
      return new Response('Playlist too large', { status: 502 })
    }

    const text = await upstream.text()
    const selfBase = `${url.origin}${url.pathname}`
    const key = env.PROXY_KEY ? url.searchParams.get('key') || undefined : undefined
    const rewritten = rewriteManifest(text, targetUrl, selfBase, ua, ref, key)

    return new Response(rewritten, {
      status: upstream.status,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Cache-Control': 'no-store',
      },
    })
  }

  // Segment / key / anything else binary: stream through unchanged.
  const passthrough = new Headers(upstream.headers)
  for (const [k, v] of Object.entries(corsHeaders())) passthrough.set(k, v)
  // Cloudflare already decodes any upstream content-encoding before this
  // handler sees the body, so forwarding the original header would mislabel
  // an already-decoded body as still compressed.
  passthrough.delete('content-encoding')
  passthrough.delete('content-length')

  return new Response(upstream.body, { status: upstream.status, headers: passthrough })
}

export default {
  /** @param {Request} request @param {{ PROXY_KEY?: string }} env */
  async fetch(request, env) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() })
    }

    if (url.pathname !== '/stream') {
      return new Response('Not found', { status: 404 })
    }

    // Not a strong access boundary (this is a public static site, so the key
    // ships in its JS bundle to every visitor) — just enough to stop a
    // search crawler or opportunistic scanner that finds the bare Worker URL
    // from using it as a general-purpose open CORS proxy. Skipped entirely
    // if no PROXY_KEY secret was ever set.
    if (env.PROXY_KEY && url.searchParams.get('key') !== env.PROXY_KEY) {
      return new Response('Forbidden', { status: 403 })
    }

    try {
      return await handleStream(request, url, env)
    } catch (err) {
      return new Response(`Proxy error: ${err instanceof Error ? err.message : 'unknown'}`, { status: 502 })
    }
  },
}
