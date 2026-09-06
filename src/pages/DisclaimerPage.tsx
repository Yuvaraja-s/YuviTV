export function DisclaimerPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-10 text-paper/70 sm:px-6">
      <h1 className="font-display text-3xl tracking-wide text-paper">Disclaimer</h1>

      <p>
        YuviTV is an independent, non-commercial project. It browses and links to publicly available live-stream URLs
        indexed by the{' '}
        <a href="https://github.com/iptv-org/iptv" target="_blank" rel="noreferrer noopener" className="text-web-cyan hover:underline">
          iptv-org
        </a>{' '}
        community project. YuviTV is not affiliated with iptv-org or with any broadcaster listed in its catalog.
      </p>

      <p>
        YuviTV does not host, store, transcode, or proxy any video. There is no backend server at all — when you press
        play, your browser opens a connection directly to the original broadcaster's own server. YuviTV's role begins
        and ends at organizing links.
      </p>

      <p>
        YuviTV does not verify the licensing or regional availability of any individual stream. Availability, legality,
        and geo-restriction of a given channel in your location are between you and the broadcaster — not something this
        site controls or guarantees. Some streams may be geo-blocked, taken down, or simply offline at any given time;
        that reflects the source, not a fault of this site.
      </p>

      <p>
        If you are a rights holder and want a channel removed from YuviTV's catalog, please{' '}
        <a
          href="https://github.com/Yuvaraja-s/YuviTV/issues/new?labels=takedown-request&title=Takedown%20request%3A%20"
          target="_blank"
          rel="noreferrer noopener"
          className="text-web-cyan hover:underline"
        >
          open a GitHub issue
        </a>{' '}
        with the channel name and it will be excluded. The same applies to a broken or dead stream — please report it the
        same way so it can be fixed or removed.
      </p>
    </div>
  )
}
