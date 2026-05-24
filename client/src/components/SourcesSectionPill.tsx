import { fetchSources } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

type SourcesSectionPillProps = {
  activeSources: string[] | null
  setActiveSources: (sources: string[] | null) => void
}

const SourcesSectionPill = ({
  activeSources,
  setActiveSources,
}: SourcesSectionPillProps) => {
  const { data: sources, isLoading: isLoadingSources } = useQuery({
    queryKey: ["sources"],
    queryFn: fetchSources,
  })

  const hasSources = activeSources !== null && activeSources.length > 0

  return (
    <div className="py-3">
      <div className="w-16 flex-shrink-0 text-right text-[12px] font-mono text-zinc-500 uppercase tracking-[0.12em] mb-2">
        sources
      </div>
      <div className="flex items-center gap-2 flex-wrap max-w-2xl">
        <button
          onClick={() => setActiveSources(null)}
          className={`px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.1em] transition-all duration-150 active:scale-[0.97] cursor-pointer ${
            !hasSources
              ? "bg-amber-400 text-zinc-950 font-semibold"
              : "bg-zinc-800 text-zinc-400 font-medium hover:bg-zinc-700 hover:text-zinc-200"
          }`}
        >
          All
        </button>
        {isLoadingSources
          ? [16, 20, 14, 22, 18].map((w, i) => (
              <div
                key={i}
                className="skeleton-shimmer rounded-full h-7"
                style={{ width: `${w * 4}px` }}
              />
            ))
          : (sources ?? []).map((source) => (
              <button
                key={source}
                onClick={() =>
                  setActiveSources(
                    activeSources?.includes(source)
                      ? activeSources.filter((s) => s !== source)
                      : [...(activeSources ?? []), source],
                  )
                }
                className={`px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.1em] transition-all duration-150 active:scale-[0.97] cursor-pointer ${
                  activeSources?.includes(source)
                    ? "bg-amber-400 text-zinc-950 font-semibold"
                    : "bg-zinc-800 text-zinc-400 font-medium hover:bg-zinc-700 hover:text-zinc-200"
                }`}
              >
                {source}
              </button>
            ))}
      </div>
    </div>
  )
}

export default SourcesSectionPill
