"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Clock, ArrowUpRight, Activity } from "lucide-react"
import type { Article } from "@/lib/types"
import { ViralityBadge } from "./ViralityBadge"
import { ViralityReason } from "./ViralityReason"
import { readTime, relativeTime } from "@/lib/helpers"

interface ArticleCardProps {
  article?: Article
  featured?: boolean
}

export function ArticleCard({
  article,
  featured = false,
}: ArticleCardProps) {
  const shouldReduceMotion = useReducedMotion()
  const [imgLoaded, setImgLoaded] = useState(false)
  const { score, tags, reason } = article?.virality_view || {}
  const time = relativeTime(article?.published_at ?? undefined)
  const rt = readTime(article?.read_time_seconds ?? undefined)
  const image = article?.image_url

  return (
    <motion.a
      href={article?.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{
        duration: 0.28,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        y: shouldReduceMotion ? 0 : -2,
        transition: { type: "spring", stiffness: 400, damping: 30 },
      }}
      whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
      className={`group flex overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition-[border-color,box-shadow] duration-200 hover:border-zinc-700 hover:shadow-[0_0_0_1px_rgba(251,191,36,0.06),0_8px_24px_rgba(0,0,0,0.35)] ${
        featured ? "flex-col md:flex-row" : "flex-col"
      }`}
    >
      <div
        className={`relative overflow-hidden flex-shrink-0 ${
          featured
            ? "w-full md:w-[42%] aspect-video md:aspect-auto md:min-h-[240px]"
            : "aspect-video w-full"
        }`}
      >
        {image ? (
          <>
            <div className={`absolute inset-0 skeleton-shimmer transition-opacity duration-500 ${imgLoaded ? "opacity-0" : "opacity-100"}`} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt=""
              loading={featured ? "eager" : "lazy"}
              decoding="async"
              onLoad={() => setImgLoaded(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-[transform,opacity] duration-500 ease-out group-hover:scale-[1.03] ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            />
          </>
        ) : (
          <div className="absolute inset-0 w-full h-full bg-zinc-800 flex items-center justify-center">
            <div className="w-50 h-50 rounded-lg bg-amber-400 flex items-center justify-center flex-shrink-0">
              <Activity size={50} className="text-zinc-950" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-zinc-900/20 to-transparent transition-opacity duration-300 group-hover:opacity-60" />
      </div>

      <div
        className={`flex flex-col gap-3 p-5 flex-1 min-w-0 ${
          featured && article?.image_url ? "md:py-7 md:px-7 justify-center" : ""
        } ${featured && !article?.image_url ? "md:py-8 md:px-7" : ""}`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-[0.1em] transition-colors duration-200 group-hover:text-zinc-300">
            {article?.source}
          </span>
          {score !== undefined && <ViralityBadge score={score} />}
        </div>

        <h2
          className={`font-semibold tracking-tight leading-snug text-zinc-50 transition-colors ${
            featured ? "text-xl md:text-2xl" : "text-[15px]"
          }`}
        >
          <div dangerouslySetInnerHTML={{ __html: article?.title ?? "" }} />
        </h2>

        {reason && <ViralityReason reason={reason} />}

        <div className="mt-auto pt-2 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {tags?.slice(0, featured ? 4 : 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2.5 text-[11px] text-zinc-600 font-mono tabular-nums flex-shrink-0">
            {rt && (
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {rt}
              </span>
            )}
            {time && <span suppressHydrationWarning>{time}</span>}
            <ArrowUpRight
              size={13}
              className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform] duration-200 text-amber-400"
            />
          </div>
        </div>
      </div>
    </motion.a>
  )
}
