export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card text-2xl">
        ★
      </div>
      <h1 className="text-xl font-semibold text-foreground">You&apos;re offline</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Gacha Tracker needs a network connection to load the latest banners and news.
        Reconnect and reload the page.
      </p>
      <a
        href="/"
        className="mt-6 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
      >
        Try again
      </a>
    </main>
  );
}
