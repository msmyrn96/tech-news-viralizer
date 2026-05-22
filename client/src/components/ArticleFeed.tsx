"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Flame, Calendar, Search, X } from "lucide-react"
import type { SortBy } from "@/lib/types"
import { fetchArticles } from "@/lib/api"
import { ArticleCard } from "./ArticleCard"
import FiltersPill from "./FiltersPill"

export function ArticleFeed() {
  const [sortBy, setSortBy] = useState<SortBy>("score")
  const [activeSource, setActiveSource] = useState<string | null>(null)
  const [minScore, setMinScore] = useState<number | null>(null)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const [debouncedQ, setDebouncedQ] = useState("")

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchInput.trim()), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: [
        "articles",
        sortBy,
        activeSource,
        minScore,
        activeTag,
        debouncedQ,
      ],
      queryFn: ({ pageParam }) =>
        fetchArticles({
          sort_by: sortBy,
          source: activeSource ?? undefined,
          limit: 20,
          page: pageParam,
          ...(minScore !== null && { min_score: minScore }),
          ...(activeTag && { tag: activeTag }),
          ...(debouncedQ && { q: debouncedQ }),
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

  return (
    <div className="flex flex-col gap-6">
      {/* Filter bar */}
      <div className="flex flex-col border-b border-zinc-800 pb-3">
        {/* Row 1: search + sort */}
        <div className="flex items-center gap-3 py-3 justify-between">
          <div className="relative w-2xl">
            <Search
              size={13}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search articles..."
              aria-label="Search articles"
              autoComplete="off"
              className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl pl-9 pr-9 py-3 text-[13px] text-zinc-200 placeholder:text-zinc-600 font-mono focus:outline-none focus:border-amber-400/40 focus:bg-zinc-800 transition-colors duration-150"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors duration-150 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <FiltersPill
              activeSource={activeSource}
              setActiveSource={setActiveSource}
              minScore={minScore}
              setMinScore={setMinScore}
              activeTag={activeTag}
              setActiveTag={setActiveTag}
            />
            <div className="flex items-center gap-1 bg-zinc-800/80 rounded-full p-1 border border-zinc-700/50 flex-shrink-0">
              <button
                onClick={() => setSortBy("score")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.1em] transition-all duration-150 cursor-pointer ${
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.1em] transition-all duration-150 cursor-pointer ${
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
                  No articles found
                </p>
                <p className="text-zinc-500 text-xs mt-1 max-w-xs leading-relaxed">
                  {debouncedQ
                    ? `No results for "${debouncedQ}". Try different keywords or adjust the filters.`
                    : "Try a lower virality threshold or a different source."}
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
