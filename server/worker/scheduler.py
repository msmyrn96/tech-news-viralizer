import threading
from concurrent.futures import ThreadPoolExecutor
from shared.models import Article, FeedEntry
from shared.database import create_article, get_existing_urls, fetch_unscored_articles, delete_all_articles
from worker.scrapper import scrape, extract_image_src
from worker.viralizer import check_virality

seen_urls: set[str] = set()
SCORE_CAP = 30
DRIP_BATCH = 10


def map_to_article(source: str, entry: FeedEntry) -> Article:
    content_html = entry.get('content', [{}])[0].get('value') if 'content' in entry else None
    return Article(
        title=entry.get('title', ''),
        source=source,
        url=entry.get('link', ''),
        summary=entry.get('summary'),
        published_at=entry.get('published'),
        image_url=extract_image_src(content_html),
    )


def job() -> None:
    global seen_urls
    entries = scrape()
    new_articles: list[Article] = []

    for source, entry in entries:
        url = entry.get('link', '')
        if url and url not in seen_urls:
            new_articles.append(map_to_article(source, entry))
            seen_urls.add(url)

    if not new_articles:
        print("No new articles found")
        return

    saved: list[Article] = []
    for article in new_articles:
        article_id = create_article(article)
        if article_id:
            article.id = article_id
            saved.append(article)

    print(f"Inserted {len(saved)} new articles")

    to_score = sorted(saved, key=lambda a: a.published_at or '', reverse=True)[:SCORE_CAP]
    threading.Thread(target=score_articles, args=(to_score,), daemon=True).start()


def drip_score_job() -> None:
    unscored = fetch_unscored_articles(limit=DRIP_BATCH)
    if unscored:
        print(f"Drip scoring {len(unscored)} unscored articles")
        threading.Thread(target=score_articles, args=(unscored,), daemon=True).start()


def score_articles(articles: list[Article]) -> None:
    def score(article: Article) -> None:
        if article.virality_view is not None:
            return
        try:
            check_virality(article)
        except Exception as e:
            print(f"Failed to score article {article.id}: {e}")

    with ThreadPoolExecutor(max_workers=4) as executor:
        executor.map(score, articles)
    print(f"Scored {len(articles)} articles")


def init_seen_urls() -> None:
    global seen_urls
    seen_urls = get_existing_urls()


def daily_reset_job() -> None:
    global seen_urls
    deleted = delete_all_articles()
    seen_urls = set()
    print(f"Daily reset: deleted {deleted} articles")
    job()
