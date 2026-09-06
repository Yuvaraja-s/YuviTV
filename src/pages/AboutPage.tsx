import { Link } from 'react-router-dom'
import { DEVELOPER } from '../data/developer'
import { GithubIcon, LinkedinIcon } from '../components/ui/BrandIcons'
import { Logo } from '../components/ui/Logo'

export function AboutPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <Logo size={44} />
        <h1 className="font-display text-3xl tracking-wide text-paper">
          About Yuvi<span className="text-web-red-text">TV</span>
        </h1>
      </div>

      <p className="text-paper/70">
        YuviTV is a free, open browser for live IPTV channels, built on the public catalog maintained by{' '}
        <a href="https://github.com/iptv-org/iptv" target="_blank" rel="noreferrer noopener" className="text-web-cyan underline underline-offset-2">
          iptv-org
        </a>
        . It doesn't stream, host, or transcode any video itself — every play button links your browser directly to the
        original broadcaster's own stream. YuviTV is just the map, not the territory: filterable by language, country, and
        category, across roughly ten thousand playable channels worldwide.
      </p>

      <p className="text-paper/70">
        Because the catalog is community-sourced and public, some streams won't play — a broadcaster may require headers
        browsers can't send, or a link may have gone stale. See the{' '}
        <Link to="/disclaimer" className="text-web-cyan underline underline-offset-2">
          disclaimer
        </Link>{' '}
        for how that's handled.
      </p>

      <div className="rounded-lg border border-ink-700 bg-ink-900 p-5">
        <a href={DEVELOPER.portfolio} target="_blank" rel="noreferrer noopener" className="group flex items-center gap-3">
          <img
            src={DEVELOPER.avatar}
            alt={`${DEVELOPER.name} headshot`}
            width={56}
            height={56}
            className="h-14 w-14 rounded-full object-cover ring-2 ring-web-blue/70"
          />
          <span>
            <span className="block text-xs tracking-wide text-paper/50 uppercase">Developed by</span>
            <span className="block font-semibold text-paper group-hover:text-web-cyan">{DEVELOPER.name}</span>
            <span className="block text-sm text-paper/50">{DEVELOPER.role}</span>
          </span>
        </a>
        <div className="mt-4 flex gap-4">
          <a href={DEVELOPER.github} target="_blank" rel="noreferrer noopener" aria-label={`${DEVELOPER.name} on GitHub`} className="text-paper/60 hover:text-web-cyan">
            <GithubIcon size={20} />
          </a>
          <a href={DEVELOPER.linkedin} target="_blank" rel="noreferrer noopener" aria-label={`${DEVELOPER.name} on LinkedIn`} className="text-paper/60 hover:text-web-cyan">
            <LinkedinIcon size={20} />
          </a>
        </div>
      </div>
    </div>
  )
}
