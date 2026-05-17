import { Activity } from "lucide-react"

interface NavProps {
  articleCount?: number
}

export function Nav({ articleCount }: NavProps) {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-13 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center flex-shrink-0">
            <Activity size={13} className="text-zinc-950" />
          </div>
          <span className="text-sm font-semibold tracking-[0.05em] text-zinc-50 uppercase">
            Viralizer
          </span>
          {articleCount !== undefined && articleCount > 0 && (
            <span className="font-mono text-[11px] text-zinc-600 tabular-nums">
              {articleCount} articles
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-[11px] text-zinc-600 font-mono hidden sm:block">
            AI-ranked tech feed
          </span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          </span>
        </div>
      </div>
    </nav>
  )
}
