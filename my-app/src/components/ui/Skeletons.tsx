export function TrackListSkeleton() {
  return (
    <div className="space-y-2 w-full animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center justify-between rounded-xl border border-zinc-900 bg-zinc-950/20 p-3">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-zinc-900" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-zinc-900" />
              <div className="h-3 w-20 rounded bg-zinc-900" />
            </div>
          </div>
          <div className="hidden md:flex gap-4">
            <div className="h-4 w-16 rounded bg-zinc-900" />
            <div className="h-4 w-12 rounded bg-zinc-900" />
          </div>
          <div className="h-8 w-20 rounded-lg bg-zinc-900" />
        </div>
      ))}
    </div>
  )
}

export function GridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3 w-full animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3 rounded-xl border border-zinc-900 bg-zinc-950/20 p-4">
          <div className="h-4 w-24 rounded bg-zinc-900" />
          <div className="space-y-2 pt-2">
            <div className="h-10 rounded bg-zinc-900" />
            <div className="h-10 rounded bg-zinc-900" />
            <div className="h-10 rounded bg-zinc-900" />
          </div>
        </div>
      ))}
    </div>
  )
}