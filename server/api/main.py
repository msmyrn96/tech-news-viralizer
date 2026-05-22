from dotenv import load_dotenv
load_dotenv()

from contextlib import asynccontextmanager
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from shared.models import Article, SortBy
from shared.database import fetch_articles, fetch_single_article, init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/articles", response_model=list[Article])
async def get_articles(
    source: str | None = None,
    sort_by: SortBy = SortBy.score,
    limit: int = Query(default=20, ge=1, le=100),
    page: int = Query(default=1, ge=1),
    min_score: int | None = Query(default=None, ge=0, le=100),
    q: str | None = Query(default=None, min_length=1, max_length=200),
    tag: str | None = Query(default=None, min_length=1, max_length=100),
):
    return fetch_articles(source=source, sort_by=sort_by.value, limit=limit, page=page, min_score=min_score, q=q, tag=tag)


@app.get("/articles/{article_id}", response_model=Article)
async def get_article(article_id: int):
    return fetch_single_article(article_id)

@app.get("/sources", response_model=list[str])
async def get_sources():
    from shared.database import fetch_sources
    return fetch_sources()

@app.get("/tags", response_model=list[str])
async def get_tags():
    from shared.database import fetch_top_tags
    return fetch_top_tags()