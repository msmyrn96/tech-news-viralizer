'use client';

import { useState, useEffect, useMemo } from 'react';
import { Flame, CalendarBlank, MagnifyingGlass } from '@phosphor-icons/react';
import type { Article, SortBy } from '@/lib/types';
import { fetchArticles } from '@/lib/api';
import { ArticleCard } from './ArticleCard';

interface ArticleFeedProps {
  initialArticles: Article[];
}

export function ArticleFeed({ initialArticles }: ArticleFeedProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [sortBy, setSortBy] = useState<SortBy>('score');
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const sources = useMemo(() => {
    const seen = new Set<string>();
    return initialArticles
      .map((a) => a.source)
      .filter((s) => {
        if (seen.has(s)) return false;
        seen.add(s);
        return true;
      });
  }, [initialArticles]);

  useEffect(() => {
    if (!isClient) return;
    setIsLoading(true);
    fetchArticles({
      sort_by: sortBy,
      source: activeSource ?? undefined,
      limit: 30,
    })
      .then(setArticles)
      .catch(() => setArticles([]))
      .finally(() => setIsLoading(false));
  }, [sortBy, activeSource, isClient]);

  const [featured, ...rest] = articles;

  return (
    <div className="flex flex-col gap-6">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-zinc-800">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveSource(null)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-all duration-150 ${
              activeSource === null
                ? 'bg-amber-400 text-zinc-950'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
            }`}
          >
            All
          </button>
          {sources.map((source) => (
            <button
              key={source}
              onClick={() =>
                setActiveSource(source === activeSource ? null : source)
              }
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-all duration-150 ${
                activeSource === source
                  ? 'bg-amber-400 text-zinc-950'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
              }`}
            >
              {source}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-zinc-800/80 rounded-full p-1 border border-zinc-700/50">
          <button
            onClick={() => setSortBy('score')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-all duration-150 ${
              sortBy === 'score'
                ? 'bg-zinc-700 text-amber-400 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Flame size={11} weight={sortBy === 'score' ? 'fill' : 'regular'} />
            Top
          </button>
          <button
            onClick={() => setSortBy('published_at')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-all duration-150 ${
              sortBy === 'published_at'
                ? 'bg-zinc-700 text-amber-400 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <CalendarBlank size={11} />
            Latest
          </button>
        </div>
      </div>

      {/* Skeleton */}
      {isLoading && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse overflow-hidden md:flex md:flex-row">
            <div className="w-full md:w-[42%] aspect-video bg-zinc-800" />
            <div className="p-6 flex flex-col gap-3 flex-1">
              <div className="h-3 bg-zinc-800 rounded w-1/4" />
              <div className="h-6 bg-zinc-800 rounded w-4/5 mt-1" />
              <div className="h-4 bg-zinc-800 rounded w-full" />
              <div className="h-4 bg-zinc-800 rounded w-2/3" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse overflow-hidden"
              >
                <div className="aspect-video bg-zinc-800" />
                <div className="p-5 flex flex-col gap-3">
                  <div className="h-3 bg-zinc-800 rounded w-1/3" />
                  <div className="h-5 bg-zinc-800 rounded w-5/6" />
                  <div className="h-3 bg-zinc-800 rounded w-full" />
                  <div className="h-3 bg-zinc-800 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Articles */}
      {!isLoading && (
        <>
          {featured && (
            <ArticleCard article={featured} featured index={0} />
          )}

          {rest.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rest.map((article, i) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  index={i + 1}
                />
              ))}
            </div>
          )}

          {articles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-28 text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <MagnifyingGlass size={22} className="text-zinc-600" />
              </div>
              <div>
                <p className="text-zinc-400 font-medium text-sm">No articles yet</p>
                <p className="text-zinc-600 text-xs mt-1 max-w-xs leading-relaxed">
                  Articles will appear once the scraper runs. Check back in a moment.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
