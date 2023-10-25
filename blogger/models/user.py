from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class UserCredentials(BaseModel):
    username: str
    password: str


class User(UserCredentials):
    id: Optional[str] = None
    email: EmailStr
    registered_on: datetime = datetime.now()


class UserResponse(BaseModel):
    id: str
    username: str
    email: EmailStr
    registered_on: datetime
