from typing import List

from bson import ObjectId
from fastapi import HTTPException
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

from blogger.models.blog_post import BlogPost, BlogPostUpdate
from blogger.models.comment import Comment, CommentResponse
from blogger.models.user import User

CONNECTION_STRING = "mongodb://localhost:27017"
client = MongoClient(host=CONNECTION_STRING, server_api=ServerApi('1'))

try:
    client.admin.command('ping')
    print("Successfully connected to MongoDB!")
except Exception as e:
    print(e)

db_client = client['my_blog']


def add_user(user: dict):
    user.pop("id")
    result = db_client.User.insert_one(user)
    user_id = str(result.inserted_id)
    return {
        "username": user["username"],
        "user_id": user_id
    }


def get_user_details(username: str):
    user_credentials = db_client.User.find_one({'username': username})

    return User(
        id=str(user_credentials.get("_id")),
        username=user_credentials.get('username'),
        password=user_credentials.get('password'),
        email=user_credentials.get('email'),
        registered_on=user_credentials.get('registered_on')
    )


def post_blog(blog_dict: dict):
    blog_dict.pop("id")
    db_client.BlogPost.insert_one(blog_dict)
    return f"Blog with title '{blog_dict['title']}' posted successfully!"


def get_all_blogs(categories: List[str]):
    categories_filter = {"categories": {"$all": categories}} if categories else {}
    blog_posts = db_client["BlogPost"].find(categories_filter)

    blog_posts_list: List[BlogPost] = list()
    for blog_post in blog_posts:
        blog_posts_list.append(
            BlogPost(
                id=str(blog_post.get("_id")),
                title=blog_post.get("title"),
                content=blog_post.get("content"),
                author=blog_post.get("author"),
                creation_date=blog_post.get("creation_date"),
                categories=blog_post.get("categories")
            )
        )
    return blog_posts_list


def get_blog(blog_id: str):
    blog_post = db_client["BlogPost"].find_one({"_id": ObjectId(blog_id)})

    if not blog_post:
        raise HTTPException(status_code=404, detail="Blog not found")

    return BlogPost(
        id=str(blog_post.get("_id")),
        title=blog_post.get("title"),
        content=blog_post.get("content"),
        author=blog_post.get("author"),
        creation_date=blog_post.get("creation_date"),
        categories=blog_post.get("categories")
    )


def get_user_blogs(user_id: str):
    blog_posts = db_client["BlogPost"].find({"author": user_id})

    if not blog_posts:
        raise HTTPException(status_code=404, detail=f"Blog(s) not found for user: {user_id}")

    return [BlogPost(**post) for post in list(blog_posts)]


def update_blog(blog_id: str, blog_update: BlogPostUpdate):
    updated_blog = db_client["BlogPost"].update_one({"_id": ObjectId(blog_id)},
                                                    {"$set": blog_update.model_dump()})

    if updated_blog.matched_count == 0:
        raise HTTPException(status_code=404, detail="Blog post not found")

    return get_blog(blog_id)


def delete_blog(blog_id):
    db_client["Comment"].delete_many({"blog_id": blog_id})

    deleted_blog = db_client["BlogPost"].find_one_and_delete({"_id": ObjectId(blog_id)})

    if not deleted_blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    return BlogPost(**deleted_blog)


def post_comment(comment_dict: dict):
    comment_dict.pop("id")
    db_client.Comment.insert_one(comment_dict)
    return f"Comment '{comment_dict['name']}' posted successfully!"


def get_blog_comments(blog_id: str):
    blog_comments = db_client["Comment"].find({"blog_id": blog_id})

    if not blog_comments:
        raise HTTPException(status_code=404, detail="No comments found")

    comments_list = list()

    for blog_comment in blog_comments:
        comments_list.append(CommentResponse(
            id=str(blog_comment.get("_id")),
            name=blog_comment.get("name"),
            text=blog_comment.get("text"),
            creation_date=blog_comment.get("creation_date")
            )
        )

    return comments_list


def delete_comment_by_id(comment_id):
    deleted_comment = db_client["Comment"].find_one_and_delete({"_id": ObjectId(comment_id)})

    if not deleted_comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    return Comment(**deleted_comment)
