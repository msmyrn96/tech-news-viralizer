import schedule
import time
import threading
from concurrent.futures import ThreadPoolExecutor
from scrapper import scrape, extract_image_src
from database import create_article, init_db, get_existing_urls, reset_db, fetch_unscored_articles, update_article_virality
from feed_types import Article, FeedEntry
from viralizer import check_virality


seen_urls: set[str] = set()
SCORE_CAP = 30       # max articles scored per scrape run
DRIP_BATCH = 30      # articles scored per drip tick


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

    if new_articles:
        for article in new_articles:
            article.id = create_article(article)
        print(f"Inserted {len(new_articles)} new articles")
        # Score only the freshest SCORE_CAP articles; drip job handles the rest
        to_score = sorted(
            new_articles,
            key=lambda a: a.published_at or '',
            reverse=True,
        )[:SCORE_CAP]
        threading.Thread(target=score_articles, args=(to_score,), daemon=True).start()
    else:
        print("No new articles found")


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


def start_scheduler() -> None:
    reset_db()
    print("Initializing scheduler...")
    global seen_urls
    print("Initializing database...")
    init_db()
    seen_urls = get_existing_urls()
    job()

    schedule.every(5).minutes.do(job)
    schedule.every(30).seconds.do(drip_score_job)

    def loop():
        while True:
            schedule.run_pending()
            time.sleep(1)

    threading.Thread(target=loop, daemon=True).start()


if __name__ == '__main__':
    start_scheduler()
    threading.Event().wait()  # keep process alive
