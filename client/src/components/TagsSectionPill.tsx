import { fetchTopTags } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

const TagsSectionPill = ({
  activeTag,
  setActiveTag,
}: {
  activeTag: string | null
  setActiveTag: (tag: string | null) => void
}) => {
  const { data: topTags, isLoading: isLoadingTags } = useQuery({
    queryKey: ["tags"],
    queryFn: fetchTopTags,
  })

  return (
    <div className="py-3">
      <span className="w-16 flex-shrink-0 text-right text-[12px] font-mono text-zinc-500 uppercase tracking-[0.12em]">
        tags
      </span>
      <div className="flex items-center gap-2 flex-wrap flex-1">
        {isLoadingTags
          ? [14, 18, 12, 16, 20].map((w, i) => (
              <div
                key={i}
                className="skeleton-shimmer rounded-full h-7"
                style={{ width: `${w * 4}px` }}
              />
            ))
          : (topTags ?? []).map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.1em] transition-all duration-150 active:scale-[0.97] cursor-pointer ${
                  activeTag === tag
                    ? "bg-amber-400 text-zinc-950 font-semibold"
                    : "bg-zinc-800 text-zinc-400 font-medium hover:bg-zinc-700 hover:text-zinc-200"
                }`}
              >
                {tag}
              </button>
            ))}
      </div>
    </div>
  )
}

export default TagsSectionPill
