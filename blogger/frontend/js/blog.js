const commentForm = document.getElementById("comment-form");
const blogContainer = document.getElementById("blog-title");
const contentContainer = document.getElementById("blog-content");
const commentsList = document.getElementById("comments-list");

let name = localStorage.getItem("username");
document.getElementById("userWelcome").textContent = `Hello ${name}`;


const urlParams = new URLSearchParams(window.location.search);
// Get the blog ID from the clicked hyperlink
const blogId = urlParams.get('blogId');

// Fetch the individual blog and its comments based on the blogId
fetch(`http://localhost:8000/blog/${blogId}`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    }
}).then(response => {
    if (response.ok) {
        response.json().then(blogData => {
            blogContainer.textContent = blogData.title;
            contentContainer.textContent = blogData.content;

            fetch(`http://localhost:8000/blog/${blogId}/comments`, {
                method: 'GET'
            }).then(response => {
                if (response.ok) {
                    response.json().then(commentsData => {
                        commentsData.reverse();
                        if (commentsData && commentsData.length > 0) {
                            commentsData.forEach(comment => {
                                const commentItem = document.createElement("div");
                                commentItem.classList.add("list-group-item", "position-relative");

                                const deleteButton = document.createElement("button");
                                deleteButton.style.display = "none";
                                deleteButton.classList.add("btn", "btn-sm", "position-absolute", "top-0", "end-0");
                                deleteButton.innerHTML = '<i class="bi bi-x-lg text-danger"></i>';

                                deleteButton.addEventListener("click", () => {
                                    deleteComment(comment['id']); // Implement the deleteComment function
                                });

                                commentItem.addEventListener("mouseenter", () => {
                                    deleteButton.style.display = "block";
                                });

                                commentItem.addEventListener("mouseleave", () => {
                                    deleteButton.style.display = "none";
                                });

                                const commentDate = new Date(comment.creation_date);
                                const options = {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                };
                                const formattedCommentDate = commentDate.toLocaleString("en-US", options);
                                commentItem.innerHTML = `
                            <h5 class="mb-1">${comment.name}</h5>
                            <p class="mb-1"><small class="text-muted">Commented on: ${formattedCommentDate}</small></p>
                            <p class="mb-1">${comment.text}</p>
                        `;
                                commentItem.appendChild(deleteButton);
                                commentsList.appendChild(commentItem);
                            });
                            commentForm.style.display = "block";
                        } else {
                            commentsList.innerHTML = "<p>No comments yet.</p>";
                            commentForm.style.display = "block";
                        }
                    });
                } else {
                    console.log(response.status);
                }
            }).catch(error => console.log("An error occurred when getting comments: ", error));
        }).catch(error => console.log("An error occurred:", error));
    }
});

function deleteComment(commentId) {
    fetch(`http://localhost:8000/comment/${commentId}`, {
        method: 'DELETE'
    }).then(response => {
        if (response.ok) {
            // Comment deleted successfully, you can reload the comments or provide user feedback
            location.reload();
        } else {
            console.log(response.status);
        }
    }).catch(error => console.log('Error deleting comment:', error));
}

commentForm.addEventListener("submit", event => {
    event.preventDefault();

    const commentText = document.getElementById("commentText").value;

    const commentData = {
        name: localStorage.getItem("username"),
        text: commentText,
        blog_id: blogId
    };

    fetch('http://localhost:8000/comment/post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(commentData)
    }).then(response => {
        if (response.ok) location.reload();
    }).catch(error => console.log('Error saving comment:', error));
});

const logoutButton = document.getElementById("logoutButton");

logoutButton.addEventListener("click", () => {
    // Clear user information from local storage
    localStorage.clear();

    // Redirect to the login page
    window.location.href = "http://localhost:8080/index.html"; // Update the URL to your login page
});