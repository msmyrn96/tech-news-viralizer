import axios from "axios"
import type { Article, SortBy } from "./types"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  paramsSerializer: (params) => {
    const parts: string[] = []
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        value.forEach((v) => parts.push(`${key}=${encodeURIComponent(v)}`))
      } else if (value !== undefined && value !== null) {
        parts.push(`${key}=${encodeURIComponent(value)}`)
      }
    }
    return parts.join("&")
  },
})

export interface FetchParams {
  sources?: string[]
  sort_by?: SortBy
  limit?: number
  page?: number
  min_score?: number
  q?: string
  tag?: string
}

export async function fetchArticles(
  params: FetchParams = {},
): Promise<Article[]> {
  const { sources, sort_by, limit = 20, page, min_score, q, tag } = params

  const { data } = await api.get<Article[]>("/articles", {
    params: {
      ...(sources && { sources }),
      ...(sort_by && { sort_by }),
      limit: limit ?? 20,
      ...(page && page > 1 && { page }),
      ...(min_score !== undefined && { min_score: min_score }),
      ...(q && { q: q }),
      ...(tag && { tag: tag }),
    },
  })
  return data
}

export async function fetchSources(): Promise<string[]> {
  const { data } = await api.get<string[]>("/sources")
  return data
}

export async function fetchTopTags(): Promise<string[]> {
  const { data } = await api.get<string[]>("/tags")
  return data
}
