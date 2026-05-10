# scraper-python.py
# To run this script, paste `python scraper-python.py` in the terminal

import re
import feedparser
from feed_types import FeedEntry


def extract_image_src(html: str | None) -> str | None:
    if not html:
        return None
    match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', html)
    return match.group(1) if match else None

urlsArray = [
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
    ('https://www.npr.org/rss/rss.php?id=1001', 'NPR')
]



def scrape(offset: int = 0, limit: int = 100) -> list[tuple[str, FeedEntry]]:
    result: list[tuple[str, FeedEntry]] = []
    for url, source in urlsArray:
        d = feedparser.parse(url)
        entries: list[FeedEntry] = d['entries']
        for entry in entries:
            result.append((source, entry))
    return result[offset:offset + limit]
    


if __name__ == '__main__':
    scrape()