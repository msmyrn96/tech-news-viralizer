import os
import json
from contextlib import contextmanager
import psycopg2
import psycopg2.extras
from psycopg2.pool import ThreadedConnectionPool
from shared.models import Article, ViralScore

_pool: ThreadedConnectionPool | None = None


def _get_pool() -> ThreadedConnectionPool:
    global _pool
    if _pool is None:
        _pool = ThreadedConnectionPool(1, 10, dsn=os.environ['DATABASE_URL'])
    return _pool


@contextmanager
def get_connection():
    conn = _get_pool().getconn()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        _get_pool().putconn(conn)


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


def get_existing_urls() -> set[str]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT url FROM articles")
            return {row[0] for row in cur.fetchall()}


def fetch_articles(
    sources: list[str] | None = None,
    sort_by: str = "score",
    limit: int = 20,
    page: int = 1,
    min_score: int | None = None,
    q: str | None = None,
    tag: str | None = None,
) -> list[Article]:
    with get_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            conditions = []
            params: list = []
            if sources is not None:
                conditions.append("source = ANY(%s)")
                params.append(sources)
            if min_score is not None:
                conditions.append("(virality_view->>'score')::integer >= %s")
                params.append(min_score)
            if q is not None:
                conditions.append("(title ILIKE %s OR summary ILIKE %s OR (virality_view->>'reason')::varchar ILIKE %s)")
                like = f"%{q}%"
                params.extend([like, like, like])
            if tag is not None:
                conditions.append("virality_view->'tags' @> %s::jsonb")
                params.append(json.dumps([tag]))
            query = "SELECT * FROM articles"
            if conditions:
                query += " WHERE " + " AND ".join(conditions)
            if sort_by == "published_at":
                query += " ORDER BY published_at::timestamptz DESC NULLS LAST"
            else:
                query += (
                    " ORDER BY CASE WHEN virality_view IS NULL THEN 1 ELSE 0 END,"
                    " (virality_view->>'score')::integer DESC NULLS LAST,"
                    " published_at::timestamptz DESC NULLS LAST"
                )
            offset = (page - 1) * limit
            query += " LIMIT %s OFFSET %s"
            params += [limit, offset]
            cur.execute(query, params)
            return [Article(**dict(row)) for row in cur.fetchall()]


def fetch_single_article(article_id: int) -> Article | None:
    with get_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM articles WHERE id = %s", (article_id,))
            row = cur.fetchone()
            return Article(**dict(row)) if row else None


def create_article(article: Article) -> int:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                '''INSERT INTO articles (title, source, url, summary, published_at, read_time_seconds, image_url)
                   VALUES (%(title)s, %(source)s, %(url)s, %(summary)s, %(published_at)s, %(read_time_seconds)s, %(image_url)s)
                   ON CONFLICT (url) DO NOTHING
                   RETURNING id''',
                article.model_dump(exclude={'id', 'virality_view'}),
            )
            row = cur.fetchone()
            return row[0] if row else None


def fetch_unscored_articles(limit: int = 10) -> list[Article]:
    with get_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                "SELECT * FROM articles WHERE virality_view IS NULL ORDER BY published_at DESC NULLS LAST LIMIT %s",
                (limit,),
            )
            return [Article(**dict(row)) for row in cur.fetchall()]


def update_article_virality(article_id: int, virality: ViralScore) -> None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE articles SET virality_view = %s WHERE id = %s",
                (json.dumps(virality.model_dump()), article_id),
            )


def delete_all_articles() -> int:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM articles")
            return cur.rowcount

def fetch_sources() -> list[str]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT DISTINCT source FROM articles")
            return [row[0] for row in cur.fetchall()]


def fetch_top_tags(limit: int = 10) -> list[str]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT tag, COUNT(*) AS cnt
                FROM articles,
                     jsonb_array_elements_text(virality_view->'tags') AS tag
                WHERE virality_view IS NOT NULL
                GROUP BY tag
                ORDER BY cnt DESC
                LIMIT %s
                """,
                (limit,),
            )
            return [row[0] for row in cur.fetchall()]
        
        