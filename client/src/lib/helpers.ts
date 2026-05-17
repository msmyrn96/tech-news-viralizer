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
