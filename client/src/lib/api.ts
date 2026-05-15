import type { Article, SortBy } from "./types"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://0.0.0.0:8000"

export interface FetchParams {
  source?: string
  sort_by?: SortBy
  limit?: number
  page?: number
}

export async function fetchArticles(
  params: FetchParams = {},
): Promise<Article[]> {
  const q = new URLSearchParams()
  if (params.source) q.set("source", params.source)
  if (params.sort_by) q.set("sort_by", params.sort_by)
  q.set("limit", String(params.limit ?? 20))
  if (params.page && params.page > 1) q.set("page", String(params.page))

  const res = await fetch(`${BASE_URL}/articles?${q}`, {
    next: { revalidate: 30 },
  })

  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}
