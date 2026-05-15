from dotenv import load_dotenv
load_dotenv()

from contextlib import asynccontextmanager
from fastapi import FastAPI, Query
from shared.models import Article, SortBy
from shared.database import fetch_articles, fetch_single_article, init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
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
