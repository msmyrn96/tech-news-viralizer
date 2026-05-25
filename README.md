# Viralizer

AI-ranked tech news reader. Scrapes articles from across the tech web, scores each one for virality using GPT-4o-mini, and surfaces the top stories ranked by cultural impact rather than recency.

---

## Stack

| Layer | Technology |
|---|---|
| Client | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| State / Data fetching | TanStack Query v5 |
| Animations | Framer Motion |
| UI primitives | Radix UI, Lucide React |
| Server | Python, FastAPI, Uvicorn |
| Background worker | Python, `schedule` library |
| AI scoring | OpenAI GPT-4o-mini (structured outputs) |
| RSS parsing | `feedparser` |
| Database | PostgreSQL (Supabase) via `psycopg2` |
| Client deployment | Vercel |
| Server deployment | Railway |

---

## Architecture

The backend consists of two separate processes:

**API** (`server/api/`) — FastAPI app that serves articles from the database. Handles filtering, sorting, pagination, search, and tag queries.

**Worker** (`server/worker/`) — Long-running background process that:
- Scrapes 11 RSS feeds every 5 minutes
- Immediately scores the 30 most recent new articles via GPT-4o-mini (parallel, up to 4 threads)
- Drip-scores any remaining unscored articles in batches of 10 every 60 seconds
- Resets the database daily at 05:00 and kicks off a fresh scrape

---

## Features

- **Virality scoring** — Each article is given a 0–100 score based on novelty, impact, controversy, timeliness, and shareability. The model also writes a 2-sentence editorial summary and up to 3 trending tags.
- **Sort by score or date** — Toggle between Top (ranked by virality score) and Latest (ranked by publication time).
- **Filter by source** — Select one or more of the 11 scraped sources.
- **Filter by minimum score** — Surface only articles above a threshold.
- **Filter by tag** — Click any tag to see all articles sharing it.
- **Full-text search** — Searches across title, summary, and AI-generated reason text. Debounced at 300ms.
- **Infinite scroll** — Loads 20 articles per page; triggers next page 200px before the sentinel element.
- **Featured article** — The top-ranked article gets a horizontal hero layout with a larger title and 3-line summary.
- **Skeleton loading** — Matches the exact card layout; no spinners.
- **Live indicator** — Animated amber dot in the nav communicates the feed is continuously updating.

### News sources

TechCrunch, Hacker News, The Verge, Wired, CNET, Engadget, Gizmodo, ZDNet, Ars Technica, The Atlantic, NPR

---

## API endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/articles` | List articles. Supports `sources[]`, `sort_by`, `limit`, `page`, `min_score`, `q`, `tag` |
| `GET` | `/articles/:id` | Single article by ID |
| `GET` | `/sources` | Distinct list of sources currently in the database |
| `GET` | `/tags` | Top 10 tags by frequency |

---

## Running locally

### Prerequisites

- Node.js 20+
- Python 3.11+
- A running PostgreSQL database
- An OpenAI API key

### Server

```bash
cd server
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

Copy the example env and fill in your values:

```bash
cp .env.example .env
```

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
OPENAI_API_KEY=sk-...
ALLOWED_ORIGINS=http://localhost:3000
```

Start the API:

```bash
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

Start the worker (separate terminal):

```bash
python -m worker.main
```

The worker initializes the database schema on first run, then begins scraping and scoring immediately.

### Client

```bash
cd client
npm install
```

Create a local env file:

```bash
# client/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployed version

| Service | URL |
|---|---|
| Client (Vercel) | Deployed via Vercel — see project dashboard |
| API (Railway) | `https://tech-news-api-production-c3b3.up.railway.app` |
| Database | Supabase (PostgreSQL) |

---

## Project structure

```
tech-news-scrapper/
├── client/                  # Next.js frontend
│   └── src/
│       ├── app/             # App Router pages and layout
│       ├── components/      # ArticleFeed, ArticleCard, Nav, filters
│       └── lib/             # API client, types, helpers
└── server/                  # Python backend
    ├── api/                 # FastAPI app
    ├── worker/              # Scraper, scheduler, viralizer
    └── shared/              # Database, models (shared between api and worker)
```
