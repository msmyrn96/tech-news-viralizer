import schedule
import time
import threading
from concurrent.futures import ThreadPoolExecutor
from scrapper import scrape, extract_image_src
from database import create_article, init_db, get_existing_urls, reset_db, fetch_unscored_articles, update_article_virality
from feed_types import Article, FeedEntry
from viralizer import check_virality


seen_urls: set[str] = set()
scrape_offset: int = 0
SCRAPE_BATCH_SIZE: int = 100


def map_to_article(source: str, entry: FeedEntry) -> Article:
    # Extract content HTML for image extraction
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
    global seen_urls, scrape_offset
    entries = scrape(offset=scrape_offset, limit=SCRAPE_BATCH_SIZE)

    if not entries:
        scrape_offset = 0
        print("All entries processed, resetting offset")
        return

    scrape_offset += SCRAPE_BATCH_SIZE
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
        threading.Thread(target=score_articles, args=(new_articles,), daemon=True).start()
    else:
        print("No new articles found")


def score_articles(articles: list[Article]) -> None:
    
    def score(article: Article) -> None:
        if article.virality_view is not None:
            return
        try:
            check_virality(article)
        except Exception as e:
            print(f"Failed to score article {article.id}: {e}")

    with ThreadPoolExecutor(max_workers=20) as executor:
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

    def loop():
        while True:
            schedule.run_pending()
            time.sleep(1)

    threading.Thread(target=loop, daemon=True).start()


if __name__ == '__main__':
    start_scheduler()
    threading.Event().wait()  # keep process alive
