from typing import List

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from blogger.models.blog_post import BlogPost, BlogPostUpdate
from blogger.models.comment import Comment, CommentResponse
from blogger.models.user import User, UserCredentials
from blogger.service import service

tags_metadata = [
    {
        "name": "User",
        "description": "Operations with users."
    },
    {
        "name": "BlogPost",
        "description": "Operations with blogs."
    },
    {
        "name": "Comment",
        "description": "Operations with comments."
    }
]

app = FastAPI(openapi_tags=tags_metadata)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/user/register", tags=["User"])
def register_user(user_details: User):
    return service.add_user(user_details=user_details)


@app.post("/user/authenticate", tags=["User"])
def authenticate_user(user_credentials: UserCredentials):
    return service.authenticate_user(user_credentials=user_credentials)


@app.post("/blog/post", tags=["BlogPost"])
def post_blog(blog_details: BlogPost):
    return service.post_blog(blog_details=blog_details)


@app.get("/blog/all", response_model=List[BlogPost], tags=["BlogPost"])
def get_all_blogs(categories: str = Query(None, description="List of categories to filter by")):
    return service.get_all_blogs(categories=categories)


@app.get("/blog/{blog_id}", response_model=BlogPost, tags=["BlogPost"])
def get_blog(blog_id: str):
    return service.get_blog(blog_id=blog_id)


@app.get("/blog/user/{user_id}", response_model=List[BlogPost], tags=["BlogPost"])
def get_user_blogs(user_id: str):
    return service.get_user_blogs(user_id=user_id)


@app.put("/blog/{blog_id}", response_model=BlogPost, tags=["BlogPost"])
def update_blog(blog_id: str, blog_update: BlogPostUpdate):
    return service.update_blog(blog_id=blog_id, blog_update=blog_update)


@app.delete("/blog/{blog_id}", tags=["BlogPost"])
def delete_blog(blog_id: str):
    return service.delete_blog(blog_id=blog_id)


@app.post("/comment/post", tags=["Comment"])
def post_comment(comment_details: Comment):
    return service.post_comment(comment_details=comment_details)


@app.get("/blog/{blog_id}/comments", response_model=List[CommentResponse], tags=["Comment"])
def get_blog_comments(blog_id: str):
    return service.get_blog_comments(blog_id=blog_id)


@app.delete("/comment/{comment_id}", response_model=Comment, tags=["Comment"])
def delete_comment(comment_id: str):
    return service.delete_comment_by_id(comment_id=comment_id)
