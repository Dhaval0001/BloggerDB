import bcrypt
from bson import ObjectId
from fastapi import HTTPException

from blogger.models.blog_post import BlogPost, BlogPostUpdate
from blogger.models.comment import Comment
from blogger.models.user import User, UserCredentials, UserResponse
from blogger.repository import repository


def add_user(user_details: User):
    user = create_user(user_details)
    return repository.add_user(user.model_dump())


def create_user(user_details):
    hashed_password = bcrypt.hashpw(user_details.password.encode(encoding='utf-8'), bcrypt.gensalt())

    return User(
        username=user_details.username,
        email=user_details.email,
        password=hashed_password.decode('utf=8'),
        registered_on=user_details.registered_on
    )


def authenticate_user(user_credentials: UserCredentials):
    retrieved_user: User = repository.get_user_details(username=user_credentials.username)

    if bcrypt.checkpw(user_credentials.password.encode("utf-8"), retrieved_user.password.encode("utf-8")):
        return UserResponse(
            id=str(retrieved_user.id),
            username=retrieved_user.username,
            email=retrieved_user.email,
            registered_on=retrieved_user.registered_on
        )

    raise HTTPException(status_code=401, detail="Login failed")


def post_blog(blog_details: BlogPost):
    return repository.post_blog(blog_dict=blog_details.model_dump())


def get_all_blogs(categories: str):
    return repository.get_all_blogs(categories=categories.split(',') if categories else [])


def get_blog(blog_id: str):
    if not ObjectId.is_valid(blog_id):
        raise HTTPException(status_code=400, detail="Invalid Blog ID")
    return repository.get_blog(blog_id=blog_id)


def get_user_blogs(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid User ID")
    return repository.get_user_blogs(user_id=user_id)


def update_blog(blog_id: str, blog_update: BlogPostUpdate):
    return repository.update_blog(blog_id=blog_id, blog_update=blog_update)


def delete_blog(blog_id: str):
    if not ObjectId.is_valid(blog_id):
        raise HTTPException(status_code=400, detail="Invalid Blog ID")
    return repository.delete_blog(blog_id=blog_id)


def post_comment(comment_details: Comment):
    return repository.post_comment(comment_dict=comment_details.model_dump())


def get_blog_comments(blog_id: str):
    if not ObjectId.is_valid(blog_id):
        raise HTTPException(status_code=400, detail="Invalid Blog ID")
    return repository.get_blog_comments(blog_id=blog_id)


def delete_comment_by_id(comment_id: str):
    if not ObjectId.is_valid(comment_id):
        raise HTTPException(status_code=400, detail="Invalid Comment ID")
    return repository.delete_comment_by_id(comment_id=comment_id)
