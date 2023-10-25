from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class BlogPost(BaseModel):
    id: Optional[str] = None
    title: str
    content: str
    author: str
    creation_date: datetime = datetime.now()
    categories: Optional[List[str]] = None


class BlogPostUpdate(BaseModel):
    title: str
    content: str
    categories: Optional[List[str]] = None
