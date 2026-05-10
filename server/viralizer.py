from openai import OpenAI
from feed_types import Article,ViralScore
from database import update_article_virality

client = OpenAI()

def check_virality(article: Article) -> None:
    response =  client.responses.parse(
        model="gpt-5.5",
        input=[
            {
                "role": "system",
                "content": (
                    "You are a viral content analyst specialising in tech news. "
                    "Given an article's title, source and summary, rate how viral it could become "
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
    
    print(article,virality)
    update_article_virality(article.id, virality)