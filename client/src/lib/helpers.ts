import { Flame, LucideIcon, TrendingUp, Zap } from "lucide-react"

export function relativeTime(dateStr?: string): string {
  if (!dateStr) return ""
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ""
    const diffMs = Date.now() - d.getTime()
    const h = Math.floor(diffMs / 3_600_000)
    if (h < 1) return "just now"
    if (h < 24) return `${h}h ago`
    const days = Math.floor(h / 24)
    if (days < 7) return `${days}d ago`
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  } catch {
    return ""
  }
}

export function readTime(seconds?: number): string {
  if (!seconds) return ""
  return `${Math.ceil(seconds / 60)} min`
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#8230;/g, "…")
    .replace(/&#038;/g, "&")
    .replace(/&[a-z]+;/gi, "")
    .trim()
}

export const sourceImageMapper: Record<string, string> = {
  TechCrunch: "/images/techcrunch.webp",
  "Hacker News": "/images/hackernews.jpg",
  ZDNet: "/images/zdnet.jpg",
  "The Atlantic": "/images/theatlantic.png",
}

export const SCORE_BUCKETS: {
  label: string
  min: number | null
  Icon: LucideIcon | null
}[] = [
  { label: "All", min: null, Icon: null },
  { label: "Rising", min: 50, Icon: TrendingUp },
  { label: "Hot", min: 70, Icon: Flame },
  { label: "Viral", min: 90, Icon: Zap },
]

export function checkTagHash(tag: string): string {
  return tag.startsWith("#") ? tag : `#${tag}`
}
