from openai import OpenAI
from shared.models import Article, ViralScore
from shared.database import update_article_virality

_client: OpenAI | None = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI()
    return _client


def check_virality(article: Article) -> None:
    response = _get_client().responses.parse(
        model="gpt-4o-mini",
        input=[
            {
                "role": "system",
                "content": (
                    "You are a tech content analyst specialising in tech news. "
                    "Given an article's title, source and summary, rate how breaking news it could become "
                    "on a scale of 0-100. Consider: headline impact, controversy, novelty, "
                    "emotional resonance, and shareability. "
                    "Return a score, a one-sentence reason, and up to 3 short tags."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Title: {article.title}\n"
                    f"Source: {article.source}\n"
                    f"Summary: {article.summary or 'N/A'}"
                ),
            },
        ],
        text_format=ViralScore,
    )

    virality = response.output_parsed
    print(article.title, virality)
    update_article_virality(article.id, virality)
