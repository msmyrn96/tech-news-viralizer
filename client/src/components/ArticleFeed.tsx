"use client"

import { useState, useEffect, useMemo } from "react"
import { Flame, CalendarBlank, MagnifyingGlass } from "@phosphor-icons/react"
import type { Article, SortBy } from "@/lib/types"
import { fetchArticles } from "@/lib/api"
import { ArticleCard } from "./ArticleCard"

interface ArticleFeedProps {
  initialArticles: Article[]
}

export function ArticleFeed({ initialArticles }: ArticleFeedProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles)
  const [sortBy, setSortBy] = useState<SortBy>("score")
  const [activeSource, setActiveSource] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const sources = useMemo(() => {
    const seen = new Set<string>()
    return initialArticles
      .map((a) => a.source)
      .filter((s) => {
        if (seen.has(s)) return false
        seen.add(s)
        return true
      })
  }, [initialArticles])

  useEffect(() => {
    if (!isClient) return
    setIsLoading(true)
    fetchArticles({
      sort_by: sortBy,
      source: activeSource ?? undefined,
      limit: 30,
    })
      .then(setArticles)
      .catch(() =>
        setArticles([
          {
            id: 22,
            title:
              "Google says criminal hackers used AI to find a major software flaw",
            source: "Hacker News",
            url: "https://www.nytimes.com/2026/05/11/us/politics/google-hackers-attack-ai.html",
            summary:
              '\u003Ca href="https://news.ycombinator.com/item?id=48094641"\u003EComments\u003C/a\u003E',
            published_at: "Mon, 11 May 2026 13:20:14 +0000",
            read_time_seconds: null,
            image_url: null,
            virality_view: {
              score: 89,
              reason:
                "A claim that criminal hackers used AI to uncover a major software flaw combines cybersecurity, AI hype, and criminal activity, making it highly newsworthy and likely to spread quickly.",
              tags: ["AI security", "cybercrime", "vulnerability"],
            },
          },
          {
            id: 21,
            title: "TanStack NPM Packages Compromised",
            source: "Hacker News",
            url: "https://github.com/TanStack/router/issues/7383",
            summary:
              '\u003Ca href="https://news.ycombinator.com/item?id=48100706"\u003EComments\u003C/a\u003E',
            published_at: "Mon, 11 May 2026 21:08:25 +0000",
            read_time_seconds: null,
            image_url: null,
            virality_view: {
              score: 88,
              reason:
                "A compromise of widely used TanStack npm packages is highly actionable, security-focused, and likely to spread quickly among developers due to potential supply-chain impact and urgency.",
              tags: ["security", "supply-chain", "npm"],
            },
          },
          {
            id: 87,
            title: "Tesla’s Latest Recall? Wheels May Fall Off Cybertrucks",
            source: "Wired",
            url: "https://www.wired.com/story/the-latest-tesla-recall-wheels-may-fall-off-cybertrucks/",
            summary:
              "In what is the 11th Cybertruck recall, certain models of Elon Musk’s embattled pickup could experience a sudden, unexpected wheel separation, thanks to the wrong grease and loose nuts.",
            published_at: "Fri, 08 May 2026 18:12:42 +0000",
            read_time_seconds: null,
            image_url: null,
            virality_view: {
              score: 88,
              reason:
                "A dramatic safety flaw involving wheels potentially falling off a high-profile Tesla vehicle is highly alarming, highly shareable, and likely to draw broad media attention and public backlash.",
              tags: ["Tesla", "Cybertruck", "Recall"],
            },
          },
          {
            id: 60,
            title:
              "Live updates from Elon Musk and Sam Altman’s court battle over the future of OpenAI",
            source: "The Verge",
            url: "https://www.theverge.com/tech/917225/sam-altman-elon-musk-openai-lawsuit",
            summary:
              "Sam Altman and Elon Musk are facing off in a high-stakes trial that could alter the future of OpenAI and its most well-known product, ChatGPT. In 2024, Musk filed a lawsuit accusing OpenAI of abandoning its founding mission of developing AI to benefit humanity and shifting focus to boosting profits instead. Elon Musk, his financial [&#8230;]",
            published_at: "2026-05-11T11:27:12-04:00",
            read_time_seconds: null,
            image_url:
              "https://platform.theverge.com/wp-content/uploads/sites/2/2026/04/268474_musk_vs_altman_CVirginia.jpg?quality=90&#038;strip=all&#038;crop=0,0,100,100",
            virality_view: {
              score: 88,
              reason:
                "A courtroom clash between Elon Musk and Sam Altman over OpenAI’s mission and ChatGPT’s future has major celebrity, controversy, and AI-industry stakes that make it highly shareable and potentially breaking-news-worthy.",
              tags: ["Elon Musk", "OpenAI trial", "ChatGPT"],
            },
          },
          {
            id: 137,
            title:
              "Google announces its first-ever discovery of a zero-day exploit made with AI",
            source: "Engadget",
            url: "https://www.engadget.com/2170002/google-announces-its-first-ever-discovery-of-a-zero-day-exploit-made-with-ai/",
            summary:
              'The Google Threat Intelligence Group said its proactive measures stopped a "mass exploitation event."',
            published_at: "Mon, 11 May 2026 18:11:07 +0000",
            read_time_seconds: null,
            image_url:
              "https://www.engadget.com/img/gallery/google-announces-its-first-ever-discovery-of-a-zero-day-exploit-made-with-ai/intro-1778522994.jpg",
            virality_view: {
              score: 87,
              reason:
                "A first-ever AI-made zero-day exploit tied to a thwarted mass exploitation event combines novelty, urgency, and high security stakes, making it highly likely to spread as breaking tech news.",
              tags: ["AI security", "zero-day", "mass exploitation"],
            },
          },
        ]),
      )
      .finally(() => setIsLoading(false))
  }, [sortBy, activeSource, isClient])

  const [featured, ...rest] = articles

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
          {sources.map((source) => (
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
            <Flame size={11} weight={sortBy === "score" ? "fill" : "regular"} />
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
          {featured && <ArticleCard article={featured} featured index={0} />}

          {rest.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rest.map((article, i) => (
                <ArticleCard key={article.id} article={article} index={i + 1} />
              ))}
            </div>
          )}

          {articles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-28 text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <MagnifyingGlass size={22} className="text-zinc-500" />
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
        </>
      )}
    </div>
  )
}
