import sqlite3
import json
from feed_types import Article, ViralScore

DB_PATH = 'tech_news.db'


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_connection() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS articles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                source TEXT NOT NULL,
                url TEXT NOT NULL,
                summary TEXT,
                published_at TEXT,
                read_time_seconds INTEGER,
                image_url TEXT
            )
        ''')
        try:
            conn.execute("ALTER TABLE articles ADD COLUMN image_url TEXT")
        except sqlite3.OperationalError:
            pass
        try:
            conn.execute("ALTER TABLE articles ADD COLUMN virality_view TEXT")
        except sqlite3.OperationalError:
            pass

def reset_db() -> None:
    with get_connection() as conn:
        conn.execute('DROP TABLE IF EXISTS articles')
    init_db()


def get_existing_urls() -> set[str]:
    with get_connection() as conn:
        rows = conn.execute("SELECT url FROM articles").fetchall()
        return {row['url'] for row in rows}


def fetch_articles(
    source: str | None = None,
    sort_by: str = "score",
    limit: int = 20,
    page: int = 1,
) -> list[Article]:
    with get_connection() as conn:
        conditions = []
        params: list = []
        if source is not None:
            conditions.append("source = ?")
            params.append(source)
        query = "SELECT * FROM articles"
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        if sort_by == "published_at":
            query += " ORDER BY published_at DESC"
        else:
            query += (
                " ORDER BY CASE WHEN virality_view IS NULL THEN 1 ELSE 0 END,"
                " CAST(json_extract(virality_view, '$.score') AS INTEGER) DESC,"
                " published_at DESC"
            )
        offset = (page - 1) * limit
        query += " LIMIT ? OFFSET ?"
        params += [limit, offset]
        rows = conn.execute(query, params).fetchall()
        return [Article(**dict(row)) for row in rows]

def fetch_single_article(article_id: int) -> Article:
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM articles WHERE id = ?", (article_id,)).fetchone()
        return Article(**dict(row)) if row else None


def create_article(article: Article) -> int:
    with get_connection() as conn:
        cursor = conn.execute(
            '''INSERT INTO articles (title, source, url, summary, published_at, read_time_seconds, image_url)
               VALUES (:title, :source, :url, :summary, :published_at, :read_time_seconds, :image_url)''',
            article.model_dump(exclude={'id'})
        )
        return cursor.lastrowid


def fetch_unscored_articles(limit: int = 10) -> list[Article]:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM articles WHERE virality_view IS NULL LIMIT ?", (limit,)
        ).fetchall()
        return [Article(**dict(row)) for row in rows]


def delete_article(article_id: int) -> None:
    with get_connection() as conn:
        conn.execute("DELETE FROM articles WHERE id = ?", (article_id,))

def update_article_virality(article_id: int, virality_view: ViralScore) -> None:
    with get_connection() as conn:
        conn.execute(
            '''UPDATE articles SET virality_view = :virality_view
               WHERE id = :id''',
            {'virality_view': json.dumps(virality_view.model_dump()), 'id': article_id}
        )   