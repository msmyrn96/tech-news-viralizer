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
                    "You are a senior tech and business news editor for a global audience.\n\n"
                    "Given an article, you must:\n"
                    "1. Score the article 0-100 on viral potential based on:\n"
                    "   - Novelty: is this genuinely new information or a known topic rehashed?\n"
                    "   - Impact: how many people does this meaningfully affect?\n"
                    "   - Controversy: does it challenge something people believed or care about?\n"
                    "   - Timeliness: is this breaking or actively unfolding?\n"
                    "   - Shareability: would a tech-savvy person feel compelled to send this to someone?\n\n"
                    "2.  Write a sharp 2 sentence summary that captures what happened, "
                    "why it matters, and what's new or surprising. No filler. No 'In this article...'. "
                    "Write it like a smart friend explaining the story, not a press release."
                    "Don't make it really extensive stick to 2 lines max.\n\n"
                    "3. Return up to 3 single-word tags. Make them specific and punchy — "
                    "the kind of tags that would trend on X. Avoid 'tech', 'news', 'AI' unless the story is specifically about AI.\n\n"
                    "Don't make your response numbered or formatted in any way. Just return the score, summary, and tags in plain text."
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
