'use client';

import { motion } from 'framer-motion';
import { Clock, ArrowUpRight } from '@phosphor-icons/react';
import type { Article } from '@/lib/types';
import { ViralityBadge } from './ViralityBadge';

function relativeTime(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const diffMs = Date.now() - d.getTime();
    const h = Math.floor(diffMs / 3_600_000);
    if (h < 1) return 'just now';
    if (h < 24) return `${h}h ago`;
    const days = Math.floor(h / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function readTime(seconds?: number): string {
  if (!seconds) return '';
  return `${Math.ceil(seconds / 60)} min`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8230;/g, '…')
    .replace(/&#038;/g, '&')
    .replace(/&[a-z]+;/gi, '')
    .trim();
}

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
  index?: number;
}

export function ArticleCard({ article, featured = false, index = 0 }: ArticleCardProps) {
  const score = article.virality_view?.score;
  const tags = article.virality_view?.tags ?? [];
  const time = relativeTime(article.published_at ?? undefined);
  const rt = readTime(article.read_time_seconds ?? undefined);
  const summary = article.summary ? stripHtml(article.summary) : '';

  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.38,
        delay: Math.min(index * 0.07, 0.5),
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -2, transition: { type: 'spring', stiffness: 400, damping: 30 } }}
      whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
      className={`group flex overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition-colors duration-200 hover:border-zinc-700 hover:bg-zinc-900/80 ${
        featured ? 'flex-col md:flex-row' : 'flex-col'
      }`}
    >
      {article.image_url && (
        <div
          className={`relative overflow-hidden flex-shrink-0 ${
            featured
              ? 'w-full md:w-[42%] aspect-video md:aspect-auto md:min-h-[240px]'
              : 'aspect-video w-full'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.image_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 to-transparent" />
        </div>
      )}

      <div
        className={`flex flex-col gap-3 p-5 flex-1 min-w-0 ${
          featured && article.image_url ? 'md:py-7 md:px-7 justify-center' : ''
        } ${featured && !article.image_url ? 'md:py-8 md:px-7' : ''}`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-[0.1em]">
            {article.source}
          </span>
          {score !== undefined && <ViralityBadge score={score} />}
        </div>

        <h2
          className={`font-semibold tracking-tight leading-snug text-zinc-50 transition-colors ${
            featured ? 'text-xl md:text-2xl' : 'text-[15px]'
          }`}
        >
          {article.title}
        </h2>

        {summary && (
          <p
            className={`text-[13px] text-zinc-500 leading-relaxed ${
              featured ? 'line-clamp-3' : 'line-clamp-2'
            }`}
          >
            {summary}
          </p>
        )}

        <div className="mt-auto pt-2 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {tags.slice(0, featured ? 4 : 3).map((tag) => (
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
            {time && <span>{time}</span>}
            <ArrowUpRight
              size={13}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-400"
            />
          </div>
        </div>
      </div>
    </motion.a>
  );
}
