"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { Flame, Calendar, Search } from "lucide-react"
import type { SortBy } from "@/lib/types"
import { fetchArticles, fetchSources } from "@/lib/api"
import { ArticleCard } from "./ArticleCard"

export function ArticleFeed() {
  const [sortBy, setSortBy] = useState<SortBy>("score")
  const [activeSource, setActiveSource] = useState<string | null>(null)

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["articles", sortBy, activeSource],
      queryFn: ({ pageParam }) =>
        fetchArticles({
          sort_by: sortBy,
          source: activeSource ?? undefined,
          limit: 20,
          page: pageParam,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, _allPages, lastPageParam) =>
        lastPage.length === 20 ? lastPageParam + 1 : undefined,
      staleTime: 30_000,
    })

  const allArticles = useMemo(() => {
    const seen = new Set<number>()
    return (
      data?.pages.flat().filter(({ id }) => {
        if (seen.has(id)) return false
        seen.add(id)
        return true
      }) ?? []
    )
  }, [data])
  const [featured, ...rest] = allArticles

  const sentinelRef = useRef<HTMLDivElement>(null)
  const hasNextPageRef = useRef(hasNextPage)
  const isFetchingNextPageRef = useRef(isFetchingNextPage)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    isFetchingNextPageRef.current = isFetchingNextPage
    hasNextPageRef.current = hasNextPage

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPageRef.current &&
          !isFetchingNextPageRef.current
        ) {
          fetchNextPage()
        }
      },
      { rootMargin: "200px" },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [fetchNextPage, isFetchingNextPage, hasNextPage])

  const { data: sources, isLoading: isLoadingSources } = useQuery({
    queryKey: ["sources"],
    queryFn: fetchSources,
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-zinc-800">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveSource(null)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.1em] transition-all duration-150 active:scale-[0.97] ${
              activeSource === null
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
                    setActiveSource(source === activeSource ? null : source)
                  }
                  className={`px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.1em] transition-all duration-150 active:scale-[0.97] ${
                    activeSource === source
                      ? "bg-amber-400 text-zinc-950 font-semibold"
                      : "bg-zinc-800 text-zinc-400 font-medium hover:bg-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  {source}
                </button>
              ))}
        </div>

        <div className="flex items-center gap-1 bg-zinc-800/80 rounded-full p-1 border border-zinc-700/50">
          <button
            onClick={() => setSortBy("score")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.1em] transition-all duration-150 ${
              sortBy === "score"
                ? "bg-zinc-700 text-amber-400 font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                : "text-zinc-500 font-medium hover:text-zinc-200"
            }`}
          >
            <Flame size={11} />
            Top
          </button>
          <button
            onClick={() => setSortBy("published_at")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.1em] transition-all duration-150 ${
              sortBy === "published_at"
                ? "bg-zinc-700 text-amber-400 font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                : "text-zinc-500 font-medium hover:text-zinc-200"
            }`}
          >
            <Calendar size={11} />
            Latest
          </button>
        </div>
      </div>

      {/* Skeleton */}
      {isLoading && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden md:flex md:flex-row">
            <div className="skeleton-shimmer w-full md:w-[42%] aspect-video" />
            <div className="p-6 flex flex-col gap-3 flex-1">
              <div className="skeleton-shimmer h-3 rounded w-1/4" />
              <div className="skeleton-shimmer h-6 rounded w-4/5 mt-1" />
              <div className="skeleton-shimmer h-4 rounded w-full" />
              <div className="skeleton-shimmer h-4 rounded w-2/3" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden"
              >
                <div className="skeleton-shimmer aspect-video" />
                <div className="p-5 flex flex-col gap-3">
                  <div className="skeleton-shimmer h-3 rounded w-1/3" />
                  <div className="skeleton-shimmer h-5 rounded w-5/6" />
                  <div className="skeleton-shimmer h-3 rounded w-full" />
                  <div className="skeleton-shimmer h-3 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Articles */}
      {!isLoading && (
        <div className="animate-fade-in flex flex-col gap-6">
          {featured && <ArticleCard article={featured} featured />}

          {rest.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rest.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
              {isFetchingNextPage && (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i + "sk"}
                      className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden"
                    >
                      <div className="skeleton-shimmer aspect-video" />
                      <div className="p-5 flex flex-col gap-3">
                        <div className="skeleton-shimmer h-3 rounded w-1/3" />
                        <div className="skeleton-shimmer h-5 rounded w-5/6" />
                        <div className="skeleton-shimmer h-3 rounded w-full" />
                        <div className="skeleton-shimmer h-3 rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {allArticles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-28 text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Search size={22} className="text-zinc-500" />
              </div>
              <div>
                <p className="text-zinc-400 font-medium text-sm">
                  No articles yet
                </p>
                <p className="text-zinc-500 text-xs mt-1 max-w-xs leading-relaxed">
                  Articles will appear once the scraper runs. Check back in a
                  moment.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* All caught up */}
      {!hasNextPage && allArticles.length > 0 && !isLoading && (
        <div className="flex items-center gap-4 py-8">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-zinc-600 font-mono text-[10px] uppercase tracking-[0.15em]">
            all caught up
          </span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>
      )}

      {/* Scroll sentinel */}
      <div ref={sentinelRef} />
    </div>
  )
}
