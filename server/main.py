import config
from contextlib import asynccontextmanager
from fastapi import FastAPI, Query
from feed_types import Article, SortBy
from database import fetch_articles, fetch_single_article
from scheduler import start_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting server...")
    start_scheduler()
    yield


app = FastAPI(lifespan=lifespan)


@app.get("/articles", response_model=list[Article])
async def get_articles(
    source: str | None = None,
    sort_by: SortBy = SortBy.score,
    limit: int = Query(default=20, ge=1, le=100),
    page: int = Query(default=1, ge=1),
):
    return fetch_articles(source=source, sort_by=sort_by.value, limit=limit, page=page)

@app.get("/articles/{article_id}", response_model=Article)
async def get_article(article_id: int):
    return fetch_single_article(article_id)