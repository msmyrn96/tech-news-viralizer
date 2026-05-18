# Infinite Scroll Pagination — Design Spec

**Date:** 2026-05-18  
**Status:** Approved  

---

## Overview

Add infinite scroll pagination to `ArticleFeed`. Articles load in batches of 20. When the user scrolls to the bottom, the next page is fetched and appended. Sorting and source filtering reset to page 1 automatically.

---

## Data Layer

### Hook change
Replace `useQuery` with `useInfiniteQuery` in `ArticleFeed.tsx`.

```ts
useInfiniteQuery({
  queryKey: ["articles", sortBy, activeSource],
  queryFn: ({ pageParam }) =>
    fetchArticles({ sort_by: sortBy, source: activeSource ?? undefined, limit: 20, page: pageParam }),
  initialPageParam: 1,
  getNextPageParam: (lastPage, _, lastPageParam) =>
    lastPage.length === 20 ? lastPageParam + 1 : undefined,
  initialData: { pages: [initialArticles], pageParams: [1] },
  staleTime: 30_000,
})
```

### "Has more" detection
`getNextPageParam` returns `undefined` (no more pages) when the last page contains fewer than 20 articles. If it returns exactly 20, the next page number is returned.

### Filter/sort reset
Because `sortBy` and `activeSource` are part of the `queryKey`, changing either resets the query to page 1 automatically — no manual reset needed.

### `api.ts`
No changes required. `fetchArticles` already accepts a `page` param.

### `initialData`
The SSR `initialArticles` (first 20 articles fetched server-side) seed the query as the first page, keeping the first render instant:

```ts
initialData: { pages: [initialArticles], pageParams: [1] }
```

---

## Scroll Detection

A sentinel `<div ref={sentinelRef} />` is placed at the end of the article list. A `useEffect` creates a native `IntersectionObserver` that triggers `fetchNextPage()` when:
- The sentinel enters the viewport, AND
- `hasNextPage` is `true`, AND
- `isFetchingNextPage` is `false`

The observer is disconnected on unmount and re-created when `hasNextPage` or `isFetchingNextPage` change.

All accumulated articles are derived by flattening pages:
```ts
const allArticles = data?.pages.flat() ?? initialArticles
```

The featured article is `allArticles[0]`; the grid renders `allArticles.slice(1)`.

---

## UI States

| State | Condition | UI |
|---|---|---|
| Loading next page | `isFetchingNextPage === true` | Row of 3 `animate-pulse` skeleton cards |
| All caught up | `!hasNextPage && allArticles.length > 0` | Centered `— all caught up —` in `text-zinc-600 font-mono text-xs` |
| Empty | `allArticles.length === 0 && !isLoading` | Existing empty state (Search icon) unchanged |
| Initial load | `isLoading === true` | Existing skeleton unchanged |

The sentinel `<div>` is always rendered below these states — invisible, just for observation.

---

## Files Changed

| File | Change |
|---|---|
| `src/components/ArticleFeed.tsx` | Replace `useQuery` → `useInfiniteQuery`; add sentinel ref + observer; update article derivation and UI states |
| `src/app/page.tsx` | Change initial fetch `limit` from `30` → `20` to match page size |

---

## Out of Scope

- Backend changes (API already supports pagination)
- Scroll restoration on back-navigation
- Virtualization / windowing
