# Infinite Scroll Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-page article fetch with infinite scroll pagination — 20 articles per page, appended on scroll.

**Architecture:** `useInfiniteQuery` (TanStack Query v5) manages page accumulation and cache invalidation. A native `IntersectionObserver` watches a sentinel `<div>` at the bottom of the list and triggers `fetchNextPage()` when it enters the viewport. Filter/sort changes reset to page 1 automatically via `queryKey`.

**Tech Stack:** React 19, TanStack Query v5, Next.js App Router, Tailwind CSS

---

## File Map

| File | Change |
|---|---|
| `src/app/page.tsx` | Change initial fetch `limit` from `30` → `20` |
| `src/components/ArticleFeed.tsx` | Replace `useQuery` → `useInfiniteQuery`; add sentinel + observer; add bottom UI states |

---

### Task 1: Align server-side initial fetch to page size

**Files:**
- Modify: `src/app/page.tsx` (line 8)

- [ ] **Step 1: Update the limit**

In `src/app/page.tsx`, change:

```ts
const articles = await fetchArticles({ sort_by: "score", limit: 30 }).catch(
  () => [],
)
```

to:

```ts
const articles = await fetchArticles({ sort_by: "score", limit: 20 }).catch(
  () => [],
)
```

- [ ] **Step 2: Verify the page still builds**

```bash
cd /Users/smyrninio/Projects/tech-news-scrapper/client
npm run build
```

Expected: build completes with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: align server-side initial fetch to 20-article page size"
```

---

### Task 2: Replace `useQuery` with `useInfiniteQuery`

**Files:**
- Modify: `src/components/ArticleFeed.tsx`

- [ ] **Step 1: Update imports**

Replace the top of `ArticleFeed.tsx` (lines 1–8) with:

```tsx
"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Flame, Calendar, Search } from "lucide-react"
import type { Article, SortBy } from "@/lib/types"
import { fetchArticles } from "@/lib/api"
import { ArticleCard } from "./ArticleCard"
```

- [ ] **Step 2: Replace the hook and article derivation**

Replace the `useQuery` call and the `const [featured, ...rest] = articles` line (lines 18–36 in the original) with:

```tsx
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["articles", sortBy, activeSource],
    queryFn: ({ pageParam }) =>
      fetchArticles({
        sort_by: sortBy,
        source: activeSource ?? undefined,
        limit: 20,
        page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.length === 20 ? lastPageParam + 1 : undefined,
    initialData:
      sortBy === "score" && activeSource === null
        ? { pages: [initialArticles], pageParams: [1] }
        : undefined,
    staleTime: 30_000,
  })

  const allArticles = data?.pages.flat() ?? initialArticles
  const [featured, ...rest] = allArticles
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/smyrninio/Projects/tech-news-scrapper/client
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ArticleFeed.tsx
git commit -m "feat: swap useQuery for useInfiniteQuery in ArticleFeed"
```

---

### Task 3: Add IntersectionObserver sentinel and bottom UI states

**Files:**
- Modify: `src/components/ArticleFeed.tsx`

- [ ] **Step 1: Add the sentinel ref and observer**

After the `const [featured, ...rest] = allArticles` line, add:

```tsx
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])
```

- [ ] **Step 2: Add bottom UI states and sentinel div**

At the end of the JSX, after the closing `</>` of the `{!isLoading && (...)}` block but before the outer closing `</div>`, add:

```tsx
      {/* Loading next page */}
      {isFetchingNextPage && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
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
      )}

      {/* All caught up */}
      {!hasNextPage && allArticles.length > 0 && !isLoading && (
        <p className="text-center text-zinc-600 font-mono text-xs py-6">
          — all caught up —
        </p>
      )}

      {/* Scroll sentinel */}
      <div ref={sentinelRef} />
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/smyrninio/Projects/tech-news-scrapper/client
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Manual smoke test**

```bash
npm run dev
```

Open `http://localhost:3000`. Verify:
1. First 20 articles load immediately (SSR data, no flash)
2. Scrolling to the bottom triggers 3 skeleton cards, then the next 20 articles appear
3. Switching sort (Top / Latest) resets to first page
4. Switching source filter resets to first page
5. When no more articles exist, `— all caught up —` appears

- [ ] **Step 5: Commit**

```bash
git add src/components/ArticleFeed.tsx
git commit -m "feat: add infinite scroll with IntersectionObserver sentinel"
```
