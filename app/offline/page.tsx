import Link from 'next/link'

/**
 * Offline fallback page used by the service worker.
 */
export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-start justify-center gap-4 px-5 py-8">
      <h1 className="m-0 text-[1.6rem] font-semibold tracking-tight">You are offline</h1>
      <p className="m-0 text-muted">
        The app can still open cached pages. Reconnect to sync recent changes.
      </p>
      <Link
        href="/"
        className="inline-flex items-center rounded-md border border-panel-border bg-panel px-3 py-2 text-[0.92rem] font-semibold text-foreground no-underline hover:bg-surface-hover"
      >
        Back to tracker
      </Link>
    </main>
  )
}
