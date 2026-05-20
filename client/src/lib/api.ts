import axios from "axios"
import type { Article, SortBy } from "./types"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://0.0.0.0:8000",
})

export interface FetchParams {
  source?: string
  sort_by?: SortBy
  limit?: number
  page?: number
}

export async function fetchArticles(
  params: FetchParams = {},
): Promise<Article[]> {
  const { data } = await api.get<Article[]>("/articles", {
    params: {
      ...(params.source && { source: params.source }),
      ...(params.sort_by && { sort_by: params.sort_by }),
      limit: params.limit ?? 20,
      ...(params.page && params.page > 1 && { page: params.page }),
    },
  })
  return data
}

export async function fetchSources(): Promise<string[]> {
  const { data } = await api.get<string[]>("/sources")
  return data
}
