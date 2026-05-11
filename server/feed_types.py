from enum import Enum
import json
from typing import Optional, TypedDict, NotRequired
from time import struct_time
from pydantic import BaseModel, field_validator


class Detail(TypedDict):
    value: str
    type: str
    language: Optional[str]
    base: str


class Link(TypedDict):
    rel: str
    type: str
    href: str


class FeedEntry(TypedDict):
    title: str
    title_detail: Detail
    links: list[Link]
    link: str
    content: NotRequired[list[Detail]]
    published: str
    published_parsed: struct_time
    summary: str
    summary_detail: Detail
    
class ViralScore(BaseModel):
    score: int
    reason: str
    tags: list[str]

class Article(BaseModel):
    id: Optional[int] = None
    title: str
    source: str
    url: str
    summary: Optional[str] = None
    published_at: Optional[str] = None
    read_time_seconds: Optional[int] = None
    image_url: Optional[str] = None
    virality_view: Optional[ViralScore] = None

    @field_validator('virality_view', mode='before')
    @classmethod
    def parse_virality_view(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v

class SortBy(str, Enum):
    score = "score"
    published_at = "published_at"