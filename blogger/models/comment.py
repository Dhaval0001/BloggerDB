from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class CommentResponse(BaseModel):
    id: Optional[str] = None
    name: str
    text: str
    creation_date: datetime = datetime.now()


class Comment(CommentResponse):
    blog_id: str
