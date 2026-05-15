import re
import feedparser
from shared.models import FeedEntry


def extract_image_src(html: str | None) -> str | None:
    if not html:
        return None
    match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', html)
    return match.group(1) if match else None


FEEDS = [
    ('https://techcrunch.com/feed/', 'TechCrunch'),
    ('https://news.ycombinator.com/rss', 'Hacker News'),
    ('https://www.theverge.com/rss/index.xml', 'The Verge'),
    ('https://www.wired.com/feed/rss', 'Wired'),
    ('https://www.cnet.com/rss/news/', 'CNET'),
    ('https://www.engadget.com/rss.xml', 'Engadget'),
    ('https://www.gizmodo.com/rss', 'Gizmodo'),
    ('https://www.zdnet.com/news/rss.xml', 'ZDNet'),
    ('https://www.arstechnica.com/feed/', 'Ars Technica'),
    ('https://www.theatlantic.com/feed/all/', 'The Atlantic'),
    ('https://www.npr.org/rss/rss.php?id=1001', 'NPR'),
]

# Per-feed cache: url -> {etag, modified, entries}
_feed_cache: dict[str, dict] = {}


def scrape() -> list[tuple[str, FeedEntry]]:
    result: list[tuple[str, FeedEntry]] = []
    for url, source in FEEDS:
        cache = _feed_cache.get(url, {})
        d = feedparser.parse(url, etag=cache.get('etag'), modified=cache.get('modified'))

        if d.status == 304:
            entries = cache.get('entries', [])
        else:
            entries = d.get('entries', [])
            _feed_cache[url] = {
                'etag': d.get('etag'),
                'modified': d.get('modified'),
                'entries': entries,
            }

        for entry in entries:
            result.append((source, entry))
    return result
