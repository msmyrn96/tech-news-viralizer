# Supabase + FastAPI Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Supabase Auth (Google OAuth + magic link) to Viralizer, with JWT verification in FastAPI and a bookmarks feature as the first user-gated feature.

**Architecture:** The Supabase client handles all auth flows (Google OAuth, magic link) client-side. Sessions are stored in httpOnly cookies via `@supabase/ssr`. FastAPI verifies Supabase-issued JWTs on protected endpoints using the project's JWT secret. The frontend uses `proxy.ts` (Next.js 16 convention — `middleware.ts` is deprecated) to protect the `/bookmarks` route.

**Tech Stack:** `@supabase/ssr`, `@supabase/supabase-js`, `python-jose[cryptography]`, Next.js 16 App Router, FastAPI, psycopg2, Supabase Postgres

---

## File Map

**New files — server:**
- `server/api/auth.py` — `get_current_user` FastAPI dependency (JWT verification)
- `server/api/bookmarks.py` — bookmark CRUD router

**Modified files — server:**
- `server/shared/database.py` — add bookmark DB functions + `init_db` migration
- `server/api/main.py` — register bookmarks router, update CORS
- `server/requirements.txt` — add `python-jose[cryptography]`

**New files — client:**
- `src/lib/supabase/server.ts` — server-side Supabase client factory
- `src/lib/supabase/client.ts` — browser-side Supabase client singleton
- `src/app/auth/callback/route.ts` — OAuth / magic-link exchange handler
- `src/components/AuthModal.tsx` — sign-in modal (Google + magic link)
- `src/components/AuthButton.tsx` — nav auth button / avatar (client component)
- `src/components/BookmarkButton.tsx` — bookmark toggle on article cards
- `src/app/bookmarks/page.tsx` — saved articles page shell
- `src/components/BookmarksFeed.tsx` — bookmarks feed (client, fetches via API)
- `proxy.ts` (project root — NOT inside `src/`) — route protection

**Modified files — client:**
- `src/components/Nav.tsx` — add `<AuthButton />`
- `src/components/ArticleCard.tsx` — add `<BookmarkButton />`
- `src/lib/api.ts` — add bookmark API calls with auth header
- `src/app/layout.tsx` — no change needed (no global provider required)

---

## Task 1: Install dependencies

**Files:**
- Modify: `server/requirements.txt`
- Run: `npm install` in `client/`

- [ ] **Step 1: Add python-jose to server requirements**

In `server/requirements.txt`, add this line (keep alphabetical order near `pydantic`):
```
python-jose[cryptography]==3.5.0
```

- [ ] **Step 2: Install python-jose in the server virtualenv**

Run from `server/`:
```bash
cd /Users/smyrninio/Projects/tech-news-scrapper/server
.venv/bin/pip install "python-jose[cryptography]==3.5.0"
```
Expected output: `Successfully installed python-jose-3.5.0`

- [ ] **Step 3: Install Supabase client packages in the frontend**

Run from `client/`:
```bash
cd /Users/smyrninio/Projects/tech-news-scrapper/client
npm install @supabase/supabase-js @supabase/ssr
```
Expected: both packages added to `package.json` dependencies.

- [ ] **Step 4: Commit**

```bash
git add server/requirements.txt client/package.json client/package-lock.json
git commit -m "feat: install supabase and python-jose auth dependencies"
```

---

## Task 2: Set up Supabase project and environment variables

**Files:**
- Create: `client/.env.local`
- Modify: `server/.env`

- [ ] **Step 1: Enable Google OAuth in Supabase dashboard**

1. Go to your Supabase project → Authentication → Providers → Google
2. Enable it and add your Google OAuth credentials (Client ID + Secret from Google Cloud Console)
3. Set the redirect URL in Google Cloud Console to: `https://<your-supabase-project>.supabase.co/auth/v1/callback`

- [ ] **Step 2: Get Supabase credentials**

In the Supabase dashboard → Settings → API, copy:
- **Project URL** (e.g. `https://qcnqjtzbfaofttjpepli.supabase.co`)
- **anon / public key**
- **JWT Secret** (Settings → API → JWT Settings → JWT Secret)

- [ ] **Step 3: Create client/.env.local**

```bash
# client/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://qcnqjtzbfaofttjpepli.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

- [ ] **Step 4: Add JWT secret to server/.env**

Append to `server/.env`:
```bash
SUPABASE_JWT_SECRET=<your-jwt-secret>
```

- [ ] **Step 5: Verify .gitignore covers .env.local**

```bash
grep -n "env.local\|\.env" /Users/smyrninio/Projects/tech-news-scrapper/client/.gitignore
```
If `.env.local` is not listed, add it. Never commit secrets.

---

## Task 3: Database migration — bookmarks table

**Files:**
- Modify: `server/shared/database.py` — update `init_db()` to create bookmarks table

- [ ] **Step 1: Update init_db to create bookmarks table**

In `server/shared/database.py`, replace the `init_db` function with:

```python
def init_db() -> None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute('''
                CREATE TABLE IF NOT EXISTS articles (
                    id SERIAL PRIMARY KEY,
                    title TEXT NOT NULL,
                    source TEXT NOT NULL,
                    url TEXT NOT NULL UNIQUE,
                    summary TEXT,
                    published_at TEXT,
                    read_time_seconds INTEGER,
                    image_url TEXT,
                    virality_view JSONB
                )
            ''')
            cur.execute('''
                CREATE TABLE IF NOT EXISTS bookmarks (
                    id SERIAL PRIMARY KEY,
                    user_id UUID NOT NULL,
                    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
                    saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    UNIQUE(user_id, article_id)
                )
            ''')
            cur.execute('''
                CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx ON bookmarks(user_id)
            ''')
```

- [ ] **Step 2: Run init_db to apply migration**

```bash
cd /Users/smyrninio/Projects/tech-news-scrapper/server
.venv/bin/python -c "
from dotenv import load_dotenv; load_dotenv()
from shared.database import init_db
init_db()
print('Migration applied')
"
```
Expected output: `Migration applied`

- [ ] **Step 3: Commit**

```bash
git add server/shared/database.py
git commit -m "feat: add bookmarks table migration"
```

---

## Task 4: Backend — JWT verification dependency

**Files:**
- Create: `server/api/auth.py`

- [ ] **Step 1: Create server/api/auth.py**

```python
import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel

_bearer = HTTPBearer(auto_error=False)


class AuthUser(BaseModel):
    id: str
    email: str | None = None


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> AuthUser:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    secret = os.environ["SUPABASE_JWT_SECRET"]
    try:
        payload = jwt.decode(
            credentials.credentials,
            secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    return AuthUser(id=user_id, email=payload.get("email"))


def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> AuthUser | None:
    if credentials is None:
        return None
    try:
        return get_current_user(credentials)
    except HTTPException:
        return None
```

- [ ] **Step 2: Smoke-test the import**

```bash
cd /Users/smyrninio/Projects/tech-news-scrapper/server
.venv/bin/python -c "from api.auth import get_current_user, AuthUser; print('OK')"
```
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add server/api/auth.py
git commit -m "feat: add Supabase JWT verification dependency"
```

---

## Task 5: Backend — bookmark database functions

**Files:**
- Modify: `server/shared/database.py`

- [ ] **Step 1: Add bookmark functions to database.py**

Append these functions at the end of `server/shared/database.py`:

```python
def get_bookmark_ids(user_id: str) -> set[int]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT article_id FROM bookmarks WHERE user_id = %s",
                (user_id,),
            )
            return {row[0] for row in cur.fetchall()}


def add_bookmark(user_id: str, article_id: int) -> bool:
    """Returns True if inserted, False if already existed."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO bookmarks (user_id, article_id)
                VALUES (%s, %s)
                ON CONFLICT (user_id, article_id) DO NOTHING
                RETURNING id
                """,
                (user_id, article_id),
            )
            return cur.fetchone() is not None


def remove_bookmark(user_id: str, article_id: int) -> bool:
    """Returns True if deleted, False if it didn't exist."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM bookmarks WHERE user_id = %s AND article_id = %s RETURNING id",
                (user_id, article_id),
            )
            return cur.fetchone() is not None


def fetch_bookmarked_articles(user_id: str, limit: int = 20, page: int = 1) -> list[Article]:
    with get_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            offset = (page - 1) * limit
            cur.execute(
                """
                SELECT a.* FROM articles a
                JOIN bookmarks b ON b.article_id = a.id
                WHERE b.user_id = %s
                ORDER BY b.saved_at DESC
                LIMIT %s OFFSET %s
                """,
                (user_id, limit, offset),
            )
            return [Article(**dict(row)) for row in cur.fetchall()]
```

- [ ] **Step 2: Verify import**

```bash
cd /Users/smyrninio/Projects/tech-news-scrapper/server
.venv/bin/python -c "
from dotenv import load_dotenv; load_dotenv()
from shared.database import add_bookmark, remove_bookmark, fetch_bookmarked_articles, get_bookmark_ids
print('OK')
"
```
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add server/shared/database.py
git commit -m "feat: add bookmark database functions"
```

---

## Task 6: Backend — bookmark API router + wire into main

**Files:**
- Create: `server/api/bookmarks.py`
- Modify: `server/api/main.py`

- [ ] **Step 1: Create server/api/bookmarks.py**

```python
from fastapi import APIRouter, Depends, HTTPException, status
from shared.models import Article
from shared.database import add_bookmark, remove_bookmark, fetch_bookmarked_articles
from api.auth import AuthUser, get_current_user

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])


@router.get("", response_model=list[Article])
def list_bookmarks(
    limit: int = 20,
    page: int = 1,
    user: AuthUser = Depends(get_current_user),
):
    return fetch_bookmarked_articles(user.id, limit=limit, page=page)


@router.post("/{article_id}", status_code=status.HTTP_201_CREATED)
def save_bookmark(article_id: int, user: AuthUser = Depends(get_current_user)):
    inserted = add_bookmark(user.id, article_id)
    if not inserted:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already bookmarked")
    return {"article_id": article_id}


@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bookmark(article_id: int, user: AuthUser = Depends(get_current_user)):
    deleted = remove_bookmark(user.id, article_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bookmark not found")
```

- [ ] **Step 2: Register bookmarks router in main.py**

In `server/api/main.py`, add after the existing imports:

```python
from api.bookmarks import router as bookmarks_router
```

And after `app = FastAPI(lifespan=lifespan)` and the CORS middleware, add:

```python
app.include_router(bookmarks_router)
```

The full updated `main.py`:

```python
from dotenv import load_dotenv
load_dotenv()

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from shared.models import Article, SortBy
from shared.database import fetch_articles, fetch_single_article, init_db
from api.bookmarks import router as bookmarks_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)

_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)

app.include_router(bookmarks_router)


@app.get("/articles", response_model=list[Article])
async def get_articles(
    source: str | None = None,
    sort_by: SortBy = SortBy.score,
    limit: int = Query(default=20, ge=1, le=100),
    page: int = Query(default=1, ge=1),
    min_score: int | None = Query(default=None, ge=0, le=100),
    q: str | None = Query(default=None, min_length=1, max_length=200),
    tag: str | None = Query(default=None, min_length=1, max_length=100),
):
    return fetch_articles(source=source, sort_by=sort_by.value, limit=limit, page=page, min_score=min_score, q=q, tag=tag)


@app.get("/articles/{article_id}", response_model=Article)
async def get_article(article_id: int):
    return fetch_single_article(article_id)

@app.get("/sources", response_model=list[str])
async def get_sources():
    from shared.database import fetch_sources
    return fetch_sources()

@app.get("/tags", response_model=list[str])
async def get_tags():
    from shared.database import fetch_top_tags
    return fetch_top_tags()
```

- [ ] **Step 3: Start the server and verify routes exist**

```bash
cd /Users/smyrninio/Projects/tech-news-scrapper/server
.venv/bin/fastapi dev api/main.py &
sleep 3
curl -s http://localhost:8000/openapi.json | python3 -c "
import json, sys
paths = json.load(sys.stdin)['paths']
for p in paths: print(p)
"
```
Expected output includes:
```
/bookmarks
/bookmarks/{article_id}
```

Kill the background server: `kill %1`

- [ ] **Step 4: Commit**

```bash
git add server/api/bookmarks.py server/api/main.py
git commit -m "feat: add bookmark CRUD endpoints with Supabase JWT auth"
```

---

## Task 7: Frontend — Supabase client utilities

**Files:**
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/client.ts`

- [ ] **Step 1: Create src/lib/supabase/server.ts**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from a Server Component — safe to ignore
          }
        },
      },
    }
  )
}
```

- [ ] **Step 2: Create src/lib/supabase/client.ts**

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 3: Verify TypeScript compilation**

```bash
cd /Users/smyrninio/Projects/tech-news-scrapper/client
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors related to the new files.

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase/
git commit -m "feat: add Supabase server and browser client utilities"
```

---

## Task 8: Frontend — auth callback route

**Files:**
- Create: `src/app/auth/callback/route.ts`

- [ ] **Step 1: Create src/app/auth/callback/route.ts**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/`)
}
```

- [ ] **Step 2: Register redirect URL in Supabase dashboard**

In Supabase → Authentication → URL Configuration → Redirect URLs, add:
```
http://localhost:3000/auth/callback
```
(Add your production URL too when deploying.)

- [ ] **Step 3: Commit**

```bash
git add src/app/auth/callback/route.ts
git commit -m "feat: add auth callback route for OAuth and magic link"
```

---

## Task 9: Frontend — proxy.ts route protection

**Files:**
- Create: `proxy.ts` (at `client/proxy.ts` — project root level, same level as `next.config.ts`)

- [ ] **Step 1: Create proxy.ts**

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const protectedPaths = ['/bookmarks']
  const isProtected = protectedPaths.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  )

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Step 2: Commit**

```bash
git add proxy.ts
git commit -m "feat: add proxy.ts to protect /bookmarks route"
```

---

## Task 10: Frontend — AuthModal component

**Files:**
- Create: `src/components/AuthModal.tsx`

- [ ] **Step 1: Create src/components/AuthModal.tsx**

```typescript
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Chrome } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

interface AuthModalProps {
  open: boolean
  onClose: () => void
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createSupabaseBrowserClient()

  async function handleGoogle() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  function handleClose() {
    setSent(false)
    setEmail('')
    setError(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] p-6"
          >
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center">
                <span className="text-zinc-950 text-xs font-bold">V</span>
              </div>
              <span className="text-sm font-semibold tracking-[0.05em] text-zinc-50 uppercase">
                Viralizer
              </span>
            </div>

            {sent ? (
              <div className="text-center py-4">
                <p className="text-zinc-200 font-medium text-sm mb-1">Check your email</p>
                <p className="text-zinc-500 text-xs leading-relaxed">
                  We sent a sign-in link to <span className="text-zinc-300">{email}</span>
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleGoogle}
                  disabled={loading}
                  className="flex items-center justify-center gap-2.5 w-full py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm font-medium hover:bg-zinc-700 hover:border-zinc-600 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Chrome size={15} />
                  Continue with Google
                </button>

                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-zinc-800" />
                  <span className="text-zinc-600 font-mono text-[10px] uppercase tracking-[0.1em]">or</span>
                  <div className="flex-1 h-px bg-zinc-800" />
                </div>

                <form onSubmit={handleMagicLink} className="flex flex-col gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoFocus
                    className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-3.5 py-2.5 text-[13px] text-zinc-200 placeholder:text-zinc-600 font-mono focus:outline-none focus:border-amber-400/40 focus:bg-zinc-800 transition-colors duration-150"
                  />
                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-amber-400 text-zinc-950 text-sm font-semibold hover:bg-amber-300 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Mail size={13} />
                    Send magic link
                  </button>
                </form>

                {error && (
                  <p className="text-red-400 text-xs font-mono text-center">{error}</p>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AuthModal.tsx
git commit -m "feat: add AuthModal with Google OAuth and magic link"
```

---

## Task 11: Frontend — AuthButton + Nav update

**Files:**
- Create: `src/components/AuthButton.tsx`
- Modify: `src/components/Nav.tsx`

- [ ] **Step 1: Create src/components/AuthButton.tsx**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { LogOut, Bookmark } from 'lucide-react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { AuthModal } from './AuthModal'

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [supabase.auth])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setShowMenu(false)
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.1em] bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-all duration-150"
        >
          Sign in
        </button>
        <AuthModal open={showModal} onClose={() => setShowModal(false)} />
      </>
    )
  }

  const initials = user.email?.slice(0, 2).toUpperCase() ?? 'U'
  const avatar = user.user_metadata?.avatar_url as string | undefined

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu((v) => !v)}
        className="flex items-center justify-center w-7 h-7 rounded-full overflow-hidden border border-zinc-700 hover:border-zinc-500 transition-colors duration-150"
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt={initials} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[10px] font-bold text-zinc-300 bg-zinc-800 w-full h-full flex items-center justify-center">
            {initials}
          </span>
        )}
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-9 z-40 w-40 bg-zinc-900 border border-zinc-800 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.5)] overflow-hidden">
            <Link
              href="/bookmarks"
              onClick={() => setShowMenu(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-mono text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors duration-150"
            >
              <Bookmark size={12} />
              Saved articles
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-[12px] font-mono text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors duration-150"
            >
              <LogOut size={12} />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Update Nav.tsx to add AuthButton**

Replace the contents of `src/components/Nav.tsx`:

```typescript
import { Activity } from "lucide-react"
import { AuthButton } from "./AuthButton"

interface NavProps {
  articleCount?: number
}

export function Nav({ articleCount }: NavProps) {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-13 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center flex-shrink-0">
            <Activity size={13} className="text-zinc-950" />
          </div>
          <span className="text-sm font-semibold tracking-[0.05em] text-zinc-50 uppercase">
            Viralizer
          </span>
          {articleCount !== undefined && articleCount > 0 && (
            <span className="font-mono text-[11px] text-zinc-600 tabular-nums">
              {articleCount} articles
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-zinc-600 font-mono hidden sm:block">
            AI-ranked global feed
          </span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          </span>
          <AuthButton />
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/AuthButton.tsx src/components/Nav.tsx
git commit -m "feat: add AuthButton to Nav with sign in modal and user menu"
```

---

## Task 12: Frontend — bookmark API calls in api.ts

**Files:**
- Modify: `src/lib/api.ts`

- [ ] **Step 1: Add bookmark functions to api.ts**

Replace the full contents of `src/lib/api.ts`:

```typescript
import axios from "axios"
import type { Article, SortBy } from "./types"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
})

export interface FetchParams {
  source?: string
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
  const { source, sort_by, limit = 20, page, min_score, q, tag } = params

  const { data } = await api.get<Article[]>("/articles", {
    params: {
      ...(source && { source }),
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

export async function fetchBookmarks(
  token: string,
  params: { limit?: number; page?: number } = {},
): Promise<Article[]> {
  const { data } = await api.get<Article[]>("/bookmarks", {
    headers: { Authorization: `Bearer ${token}` },
    params,
  })
  return data
}

export async function addBookmark(token: string, articleId: number): Promise<void> {
  await api.post(`/bookmarks/${articleId}`, null, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function removeBookmark(token: string, articleId: number): Promise<void> {
  await api.delete(`/bookmarks/${articleId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/api.ts
git commit -m "feat: add bookmark API calls to api.ts"
```

---

## Task 13: Frontend — BookmarkButton component

**Files:**
- Create: `src/components/BookmarkButton.tsx`

- [ ] **Step 1: Create src/components/BookmarkButton.tsx**

```typescript
'use client'

import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { addBookmark, removeBookmark } from '@/lib/api'

interface BookmarkButtonProps {
  articleId: number
  initialSaved?: boolean
  onAuthRequired: () => void
}

export function BookmarkButton({ articleId, initialSaved = false, onAuthRequired }: BookmarkButtonProps) {
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)
  const supabase = createSupabaseBrowserClient()

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    if (!token) {
      onAuthRequired()
      return
    }

    setLoading(true)
    const next = !saved
    setSaved(next)

    try {
      if (next) {
        await addBookmark(token, articleId)
      } else {
        await removeBookmark(token, articleId)
      }
    } catch {
      setSaved(!next)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label={saved ? 'Remove bookmark' : 'Save article'}
      className={`flex items-center justify-center w-6 h-6 rounded-md transition-all duration-150 disabled:opacity-50 ${
        saved
          ? 'text-amber-400 bg-amber-400/10'
          : 'text-zinc-600 opacity-0 group-hover:opacity-100 hover:text-zinc-300 hover:bg-zinc-800'
      }`}
    >
      <Bookmark size={12} fill={saved ? 'currentColor' : 'none'} />
    </button>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BookmarkButton.tsx
git commit -m "feat: add BookmarkButton component with optimistic toggle"
```

---

## Task 14: Frontend — wire BookmarkButton into ArticleCard

**Files:**
- Modify: `src/components/ArticleCard.tsx`
- Modify: `src/components/ArticleFeed.tsx`

- [ ] **Step 1: Update ArticleCard to accept and render BookmarkButton**

The `ArticleCard` needs to accept an `onAuthRequired` prop and render `BookmarkButton`. Replace `src/components/ArticleCard.tsx`:

```typescript
"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Clock, ArrowUpRight } from "lucide-react"
import type { Article } from "@/lib/types"
import { ViralityBadge } from "./ViralityBadge"
import { ViralityReason } from "./ViralityReason"
import { BookmarkButton } from "./BookmarkButton"
import {
  checkTagHash,
  readTime,
  relativeTime,
  sourceImageMapper,
} from "@/lib/helpers"

interface ArticleCardProps {
  article?: Article
  featured?: boolean
  onAuthRequired?: () => void
}

export function ArticleCard({ article, featured = false, onAuthRequired }: ArticleCardProps) {
  const shouldReduceMotion = useReducedMotion()
  const [imgLoaded, setImgLoaded] = useState(false)
  const { score, tags, reason } = article?.virality_view || {}
  const time = relativeTime(article?.published_at ?? undefined)
  const rt = readTime(article?.read_time_seconds ?? undefined) ?? 10
  const sourceImage = article?.source ? sourceImageMapper[article.source] : null
  const image = article?.image_url ?? sourceImage ?? "/images/placeholder.png"

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
        <>
          <div
            className={`absolute inset-0 skeleton-shimmer transition-opacity duration-500 ${imgLoaded ? "opacity-0" : "opacity-100"}`}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={article?.title ?? "Article image"}
            loading={featured ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-[transform,opacity] duration-500 ease-out group-hover:scale-[1.03] ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          />
        </>

        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-zinc-900/20 to-transparent transition-opacity duration-300 group-hover:opacity-60" />
      </div>

      <div
        className={`flex flex-col gap-3 p-5 flex-1 min-w-0 ${
          featured && article?.image_url ? "md:py-7 md:px-7 justify-center" : ""
        } ${featured && !article?.image_url ? "md:py-8 md:px-7" : ""}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-[0.1em] transition-colors duration-200 group-hover:text-zinc-300">
              {article?.source}
            </span>
            {score !== undefined && <ViralityBadge score={score} />}
          </div>

          {rt && (
            <span className="flex items-center gap-2 text-[12px] text-zinc-600 font-mono tabular-nums">
              <Clock size={11} />
              {rt}
            </span>
          )}
        </div>

        <h2
          className={`font-semibold tracking-tight leading-snug text-zinc-50 transition-colors ${
            featured ? "text-xl md:text-2xl" : "text-[15px]"
          }`}
        >
          <div dangerouslySetInnerHTML={{ __html: article?.title ?? "" }} />
        </h2>

        {reason && <ViralityReason reason={reason} />}

        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {tags?.slice(0, featured ? 4 : 3).map((tag) => (
              <span
                key={tag}
                className="text-[12px] font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded"
              >
                {checkTagHash(tag)}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2.5 text-[11px] text-zinc-600 font-mono tabular-nums flex-shrink-0">
            {article?.id !== undefined && onAuthRequired && (
              <BookmarkButton
                articleId={article.id}
                onAuthRequired={onAuthRequired}
              />
            )}
            <ArrowUpRight
              size={13}
              className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform] duration-200 text-amber-400"
            />
            {time && <span suppressHydrationWarning>{time}</span>}
          </div>
        </div>
      </div>
    </motion.a>
  )
}
```

- [ ] **Step 2: Update ArticleFeed to pass onAuthRequired to ArticleCard**

In `src/components/ArticleFeed.tsx`, add `showModal` state and pass it down. Add this import at the top:

```typescript
import { AuthModal } from "./AuthModal"
```

Add this state inside `ArticleFeed`:

```typescript
const [showAuthModal, setShowAuthModal] = useState(false)
```

Update every `<ArticleCard` usage to pass the prop:

```typescript
{featured && (
  <ArticleCard
    article={featured}
    featured
    onAuthRequired={() => setShowAuthModal(true)}
  />
)}
```

```typescript
{rest.map((article) => (
  <ArticleCard
    key={article.id}
    article={article}
    onAuthRequired={() => setShowAuthModal(true)}
  />
))}
```

Add `<AuthModal>` at the bottom of the returned JSX, just before the closing `</div>`:

```typescript
<AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ArticleCard.tsx src/components/ArticleFeed.tsx
git commit -m "feat: wire BookmarkButton and AuthModal into ArticleCard and ArticleFeed"
```

---

## Task 15: Frontend — /bookmarks page

**Files:**
- Create: `src/app/bookmarks/page.tsx`

- [ ] **Step 1: Create src/app/bookmarks/page.tsx**

```typescript
import { Nav } from "@/components/Nav"
import { BookmarksFeed } from "@/components/BookmarksFeed"

export default function BookmarksPage() {
  return (
    <>
      <Nav />
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-8">
          <p className="text-[11px] font-mono text-zinc-600 uppercase tracking-[0.1em] mb-2">
            Reading List
          </p>
          <h1
            className="font-semibold tracking-tight text-zinc-50 leading-none"
            style={{ fontSize: "clamp(1.875rem, 4vw, 2.25rem)" }}
          >
            Saved
            <br />
            <span className="text-zinc-400">articles</span>
          </h1>
        </div>
        <BookmarksFeed />
      </main>
    </>
  )
}
```

- [ ] **Step 2: Create src/components/BookmarksFeed.tsx**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Bookmark } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { fetchBookmarks } from '@/lib/api'
import type { Article } from '@/lib/types'
import { ArticleCard } from './ArticleCard'
import { AuthModal } from './AuthModal'

export function BookmarksFeed() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const results = await fetchBookmarks(token)
        setArticles(results)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [supabase.auth])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div className="skeleton-shimmer aspect-video" />
            <div className="p-5 flex flex-col gap-3">
              <div className="skeleton-shimmer h-3 rounded w-1/3" />
              <div className="skeleton-shimmer h-5 rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <Bookmark size={22} className="text-zinc-500" />
        </div>
        <div>
          <p className="text-zinc-400 font-medium text-sm">No saved articles yet</p>
          <p className="text-zinc-500 text-xs mt-1 max-w-xs leading-relaxed">
            Click the bookmark icon on any article to save it here.
          </p>
        </div>
      </div>
    )
  }

  const [featured, ...rest] = articles

  return (
    <div className="flex flex-col gap-6">
      {featured && (
        <ArticleCard
          article={featured}
          featured
          onAuthRequired={() => setShowAuthModal(true)}
        />
      )}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onAuthRequired={() => setShowAuthModal(true)}
            />
          ))}
        </div>
      )}
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/bookmarks/page.tsx src/components/BookmarksFeed.tsx
git commit -m "feat: add /bookmarks page and BookmarksFeed component"
```

---

## Task 16: End-to-end smoke test

- [ ] **Step 1: Start the backend**

```bash
cd /Users/smyrninio/Projects/tech-news-scrapper/server
.venv/bin/fastapi dev api/main.py
```

- [ ] **Step 2: Start the frontend**

```bash
cd /Users/smyrninio/Projects/tech-news-scrapper/client
npm run dev
```

- [ ] **Step 3: Verify the auth flow end-to-end**

1. Open `http://localhost:3000`
2. Click **Sign in** in the nav → modal appears with Google + magic link
3. Sign in with Google → redirects to `http://localhost:3000/auth/callback` → lands back on homepage
4. Avatar appears in the nav with a dropdown containing "Saved articles" + "Sign out"
5. Hover any article card → bookmark icon appears
6. Click the bookmark icon → icon fills amber (optimistic update)
7. Navigate to `http://localhost:3000/bookmarks` → saved article appears
8. Click bookmark icon again → removed from saved
9. Sign out → avatar replaced by "Sign in" button
10. Try navigating to `http://localhost:3000/bookmarks` while signed out → redirected to homepage

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete Supabase + FastAPI auth and bookmarks"
```
