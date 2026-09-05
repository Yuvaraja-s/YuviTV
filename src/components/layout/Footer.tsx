import { DEVELOPER } from '../../data/developer'
import { GithubIcon, LinkedinIcon } from '../ui/BrandIcons'

export function Footer() {
  return (
    <footer className="border-t border-ink-700 bg-ink-950 px-6 py-8 text-sm text-paper/70">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <a
          href={DEVELOPER.portfolio}
          target="_blank"
          rel="noreferrer noopener"
          className="group flex items-center gap-3 rounded-full py-1 pr-4 pl-1 transition-colors hover:bg-ink-800"
        >
          <span className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-2 ring-web-blue/70 transition-shadow group-hover:shadow-glow-sm">
            <img
              src={DEVELOPER.avatar}
              alt={`${DEVELOPER.name} headshot`}
              width={44}
              height={44}
              loading="lazy"
              className="h-11 w-11 rounded-full object-cover"
            />
          </span>
          <span className="text-left leading-tight">
            <span className="block text-xs uppercase tracking-wide text-paper/50">Developed by</span>
            <span className="block font-semibold text-paper group-hover:text-web-cyan">{DEVELOPER.name}</span>
          </span>
        </a>

        <div className="flex items-center gap-4">
          <a
            href={DEVELOPER.github}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`${DEVELOPER.name} on GitHub`}
            className="text-paper/60 transition-colors hover:text-web-cyan"
          >
            <GithubIcon size={20} />
          </a>
          <a
            href={DEVELOPER.linkedin}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`${DEVELOPER.name} on LinkedIn`}
            className="text-paper/60 transition-colors hover:text-web-cyan"
          >
            <LinkedinIcon size={20} />
          </a>
        </div>
      </div>

      <p className="mx-auto mt-6 max-w-6xl text-center text-xs text-paper/40 sm:text-left">
        YuviTV streams nothing itself — it links directly to publicly available channels indexed by{' '}
        <a
          href="https://github.com/iptv-org/iptv"
          target="_blank"
          rel="noreferrer noopener"
          className="underline decoration-dotted underline-offset-2 hover:text-web-cyan"
        >
          iptv-org
        </a>{' '}
        (unaffiliated). &copy; {new Date().getFullYear()} YuviTV.
      </p>
    </footer>
  )
}
