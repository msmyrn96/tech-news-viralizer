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
    image_url = None
    read_time_seconds = None
    
    for block in entry.get('content', []):
        image_url = extract_image_src(block.get('value'))
        if image_url:
            break
    
    if image_url is None:
        image_url = entry.get('media_thumbnail', [{}])[0].get('url')

    if image_url is None:
        image_url = next(
            (l.get('href') for l in entry.get('links', [])
             if l.get('rel') == 'enclosure' and (l.get('type') or '').startswith('image/')),
            None
        )

    if image_url is None:
        mc = entry.get('media_content', [{}])[0]
        if (mc.get('type') or '').startswith('image/') or mc.get('medium') == 'image':
            image_url = mc.get('url')
            
    if source != 'Hacker News':
        read_time_seconds = round(len(entry.get('summary', '').split()) / (200 * 60)) #200 wpm reading speed

    return Article(
        title=entry.get('title', ''),
        source=source,
        url=entry.get('link', ''),
        summary=entry.get('summary'),
        published_at=entry.get('published'),
        image_url=image_url,
        read_time_seconds=read_time_seconds,
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
