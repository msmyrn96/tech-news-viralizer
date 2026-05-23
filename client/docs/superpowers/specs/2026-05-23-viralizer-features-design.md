# Viralizer Feature Expansion — Design Spec
_Date: 2026-05-23_

## Overview

Add user accounts, bookmarks, personalization, and a daily digest to Viralizer. The approach is auth-first: everything else builds on top of a stable user identity layer. The product stays zero-friction for anonymous users — all existing features remain fully accessible without an account.

---

## 1. Auth

### Mechanism
- **Google OAuth** as the primary sign-in method (one-click, no password to manage)
- **Email + magic link** as the fallback (no password, just an email)
- No username/password — reduces friction and eliminates password reset flows

### Backend (FastAPI)
- New `users` table: `id`, `email`, `name`, `avatar_url`, `created_at`
- JWT access tokens (short-lived, 15 min) + refresh tokens (httpOnly cookie, 7 days)
- `POST /auth/google` — exchange Google OAuth code for tokens
- `POST /auth/magic-link` — send magic link email
- `GET /auth/magic-link/verify?token=` — verify token, return JWT
- `POST /auth/refresh` — rotate refresh token
- `POST /auth/logout` — invalidate refresh token

### Frontend
- Nav gets **Sign In** button (anonymous) or **avatar** (signed in)
- Clicking Sign In opens a modal: "Continue with Google" + magic link email field
- Auth state lives in a React context (`AuthProvider`) wrapping the app
- Access token stored in memory (not localStorage); refresh token in httpOnly cookie
- Silent refresh on app load via `GET /auth/refresh`

---

## 2. Bookmarks

### Backend
- New `bookmarks` table: `user_id`, `article_id`, `saved_at` (unique constraint on both)
- `POST /bookmarks/:article_id` — save (requires auth)
- `DELETE /bookmarks/:article_id` — unsave (requires auth)
- `GET /bookmarks` — return saved articles as `Article[]` (paginated, same shape as `/articles`)

### Frontend
- Bookmark icon on every `ArticleCard` (bottom-right, appears on hover for signed-in users)
- Clicking bookmark without auth triggers the sign-in modal with context: "Sign in to save articles"
- `/bookmarks` page — same `ArticleFeed` layout, filtered to saved articles, with an "empty state" for zero bookmarks
- Nav gets a bookmark icon link when signed in
- Optimistic UI: icon toggles instantly, rolls back on error

---

## 3. Personalization

### What it covers
- **Mute sources** — hide all articles from a given source
- **Follow tags** — boost articles matching followed tags in the feed ranking
- **"For You" feed tab** — a personalized view, separate from the global feed

### Backend
- New `user_preferences` table: `user_id`, `muted_sources` (JSON array), `followed_tags` (JSON array)
- `GET /preferences` — return current preferences
- `PUT /preferences` — update muted sources and/or followed tags
- `/articles` endpoint gains optional `personalized=true` query param: when set and user is authenticated, applies mute/boost logic server-side

### Frontend
- Preferences page (`/settings`) — toggle sources on/off, manage followed tags
- Feed gains a **Global / For You** tab toggle (shown only to signed-in users)
- "For You" tab uses `personalized=true` param — same infinite scroll, same filters
- Muted sources are also hidden from the sources filter pill

---

## 4. Daily Digest

### What it is
A daily email (sent at user-configured time, default 8am) containing the top 10 articles from the past 24 hours, filtered by the user's followed tags and excluding muted sources.

### Backend
- `digest_preferences` stored in `user_preferences`: `digest_enabled` (bool), `digest_time` (HH:MM UTC), `digest_timezone`
- `PUT /preferences` already covers this (same endpoint)
- Cron job (daily, runs per-user based on their `digest_time`): query top articles, render HTML email, send via Resend (or SendGrid)
- Email template: Viralizer brand, top 10 cards with virality score + summary + link

### Frontend
- Digest toggle in `/settings` — on/off + time picker
- Confirmation email on first enable

---

## 5. Additional Features (non-auth)

### Keyboard Navigation
- `j` / `k` — move focus down/up through article cards
- `o` — open focused article in new tab
- `b` — bookmark focused article (prompts sign-in if not authenticated)
- `?` — show keyboard shortcut overlay
- Implemented via a global `useKeyboardNav` hook; focused card gets a visible ring

### Time Range Filter
- New filter option in `FiltersPill`: **24h / 7d / 30d / All time**
- Maps to `published_after` query param on `/articles`
- Default: All time (preserves existing behavior)

### More Sources
Priority additions: **Ars Technica**, **Wired**, **MIT Technology Review**, **Lobsters**, **Reddit r/technology**
- Backend scraper additions only — no frontend changes needed
- Each new source gets an entry in `sourceImageMapper`

### Trending Topics Bar
- A horizontal scrollable bar below the filter row showing the top 10 tags by article count in the last 24 hours
- Clicking a tag applies it as a filter (same as the tags filter pill)
- Data from a new `GET /tags/trending?hours=24&limit=10` endpoint
- Cached aggressively (5 min TTL) — low-cost to add, high signal value

---

## Data Model Summary

```
users
  id, email, name, avatar_url, created_at

bookmarks
  user_id → users.id
  article_id → articles.id
  saved_at

user_preferences
  user_id → users.id (1:1)
  muted_sources: string[]
  followed_tags: string[]
  digest_enabled: bool
  digest_time: string (HH:MM)
  digest_timezone: string
```

---

## Build Order

1. **Auth** — foundation for everything
2. **Bookmarks** — first user-facing win, validates the auth flow
3. **Personalization** — settings page, mute/follow, For You tab
4. **Digest** — email infra, cron job, preferences UI
5. **Keyboard nav + time range filter** — fast wins, no auth dependency
6. **More sources** — backend only
7. **Trending topics bar** — new endpoint + frontend strip
