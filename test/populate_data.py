from http import HTTPStatus

import requests
from requests import Response

BASE_URL: str = "http://localhost:8000"


def populate_data() -> None:
    # POST APIs
    add_users()
    add_blogs()
    add_comments()

    # GET APIs
    get_blog_comments()

    # DELETE APIs
    delete_blog_comment()


def add_users() -> None:
    print("Adding users (POST /user/register):")

    test_users = [
        {
            "username": "user1",
            "email": "sampleuser@email.com",
            "password": "qwerty1"
        },
        {
            "username": "user2",
            "email": "testuser@email.com",
            "password": "qwerty"
        }
    ]

    for user_payload in test_users:
        response: Response = requests.post(url=f"{BASE_URL}/user/register", json=user_payload)

        if not response.status_code == HTTPStatus.OK:
            print(f"Error registering user: {user_payload['username']}")
        else:
            print(response.status_code)
            print(f"User {user_payload['username']} registered successfully!\n")


def add_blogs() -> None:
    print("Adding blogs (POST /blog/post):")

    test_blogs = [
        {
            "title": "sample_title",
            "content": "sample_content",
            "author": "6518a01735a664682cc3add8"
        },
        {
            "title": "dummy_title",
            "content": "dummy_content",
            "author": "6518a01735a664682cc3add8",
            "categories": [
                "sample_category"
            ]
        }
    ]

    for blog_payload in test_blogs:
        response: Response = requests.post(url=f"{BASE_URL}/blog/post", json=blog_payload)

        if not response.status_code == HTTPStatus.OK:
            print(f"Error adding blog post: {blog_payload['title']}")
        else:
            print(response.status_code)
            print(f"Blog \"{blog_payload['title']}\" added successfully!\n")


def add_comments():
    print("Adding comments (POST /comment/post):")

    test_comments = [
        {
            "name": "sample_comment_name",
            "text": "sample_text",
            "blog_id": "6518a1f6729eeb4351fbcdfb"
        },
        {
            "name": "dummy_comment",
            "text": "dummy_text",
            "blog_id": "6518a1f6729eeb4351fbcdfb"
        }
    ]

    for comment_payload in test_comments:
        response: Response = requests.post(url=f"{BASE_URL}/comment/post", json=comment_payload)

        if not response.status_code == HTTPStatus.OK:
            print(f"Error adding comment: {comment_payload.get('name')}")
            print(response.json())
        else:
            print(response.status_code)
            print(f"Comment \"{comment_payload.get('name')}\" added successfully!\n")


def get_blog_comments():
    print("GET /blog/{blog_id}/comments")
    response: Response = requests.get(url=f"{BASE_URL}/blog/6518a1f6729eeb4351fbcdfb/comments")

    print("Response Code:", response.status_code)
    print(response.json())


def delete_blog_comment():
    print("\nDELETE /comment/{comment_id}")
    response: Response = requests.delete(url=f"{BASE_URL}/comment/6518b060083fc61e50139007")

    print("\nResponse Code:", response.status_code)
    print("Deleted following comment:\n", response.json())


if __name__ == '__main__':
    populate_data()
