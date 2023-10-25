    const blogContainer = document.getElementById("blog-list");
    const welcomeText = document.getElementById("userWelcome");
    const categoryFilter = document.getElementById("category-filter");

    const username = localStorage.getItem("username");
    const userId = localStorage.getItem("userId");
    welcomeText.textContent = `Hello ${username}`;

    console.log(username);

    let blogsData;

    fetch(`http://localhost:8000/blog/all`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(response => {
        if (response.ok) {
            response.json().then(data => {
                blogsData = data; // Store the fetched data

                // Populate the dropdown list with unique categories
                populateCategories(data);

                // Filter and display blogs based on the selected category
                filterBlogsByCategory(data);

            })
        }
    });

    const logoutButton = document.getElementById("logoutButton");

    logoutButton.addEventListener("click", () => {
        // Clear user information from local storage
        localStorage.clear();

        // Redirect to the login page
        window.location.href = "http://localhost:8080/index.html"; // Update the URL to your login page
    });

    document.getElementById("add-blog-form").addEventListener("submit", event => {
        event.preventDefault();

        const title = document.getElementById("title").value;
        const content = document.getElementById("content").value;
        const categories = document.getElementById("categories").value.split(",").map(category => category.trim());

        const newBlogPost = {
            title: title,
            content: content,
            author: userId, // You can use the author's name from your stored user data
            categories: categories,
            creation_date: new Date().toISOString() // Use the current date and time
        };

        // Make a POST request to create the new blog post
        fetch('http://localhost:8000/blog/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newBlogPost)
        }).then(response => {
            if (response.ok) {
                location.reload();
            } else {
                console.log(response.status);
            }
        }).catch(error => console.log('Error creating blog post:', error));
    });

    function populateCategories(data) {
        const uniqueCategories = Array.from(new Set(data.flatMap(blog => blog.categories || [])));
        uniqueCategories.forEach(category => {
            category = category.trim().length ? category : "No category";
            const option = document.createElement("option");
            option.value = category === "No category" ? "" : category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    categoryFilter.addEventListener("change", () => {
        // Filter and display blogs based on the selected category
        filterBlogsByCategory(blogsData);
    });

    function filterBlogsByCategory(data) {
        const selectedCategory = categoryFilter.value;

        // Filter blogs based on the selected category
        const filteredBlogs = data.filter(blog => {
            if (selectedCategory === "All" && blog.author === userId ) {
                return true; // Show all blogs
            }
            else if(selectedCategory === "All_blogs"){
                return true;
            }
            else {
                console.log(blog.author);
                console.log(userId);
                return blog.author === userId && (blog.categories || []).includes(selectedCategory);
            }
        });

        blogContainer.innerHTML = '';
        if (filteredBlogs.length) {
            // Group blogs into rows with 3 columns each
            for (let i = 0; i < filteredBlogs.length; i += 3) {
                const row = document.createElement("div");
                row.classList.add("row");

                // Create 3 columns for each row
                for (let j = i; j < i + 3 && j < filteredBlogs.length; j++) {
                    const blog = filteredBlogs[j];
                    const date = new Date(blog.creation_date);
                    const options = {year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"};
                    const formattedDate = date.toLocaleString("en-US", options);

                    const card = document.createElement("div");
                    card.classList.add("col-md-4", "mb-4");
                    card.innerHTML = `
                        <div class="card position-relative">
                            <button class="btn btn-sm position-absolute top-0 end-0 delete-button" style="display: none;"><i class="bi bi-x-lg text-danger"></i></button>
                            <button class="btn btn-sm position-absolute bottom-0 end-0 edit-button" style="display: none;"><i class="bi bi-pencil text-primary"></i></button>
                            <div class="card-body">
                                <h5 class="card-title"><a href="blog.html?blogId=${blog['id']}">${blog.title}</a></h5>
                                <p class="card-text">
                                    ${truncateText(blog.content, 200)}
                                </p>
                                <p class="card-text">Date: ${formattedDate}</p>
                                <p class="card-text">Categories: ${blog.categories && !/^\s*$/.test(blog.categories) ? blog.categories.join(", ") : "No categories"}</p>
                            </div>
                        </div>
                    `;

                    card.addEventListener("mouseenter", () => {
                        const deleteButton = card.querySelector(".delete-button");
                        deleteButton.style.display = "block";

                        const editButton = card.querySelector(".edit-button");
                        editButton.style.display = "block";
                    });

                    card.addEventListener("mouseleave", () => {
                        const deleteButton = card.querySelector(".delete-button");
                        deleteButton.style.display = "none";

                        const editButton = card.querySelector(".edit-button");
                        editButton.style.display = "none";
                    });

                    const deleteButton = card.querySelector(".delete-button");
                    deleteButton.addEventListener("click", (event) => {
                        event.stopPropagation();
                        deleteBlogPost(blog['id']);
                    });

                    const editButton = card.querySelector(".edit-button");
                    editButton.addEventListener("click", () => {
                        openEditForm(blog);
                    });

                    row.appendChild(card);
                }

                // Append the row to the blog container
                blogContainer.appendChild(row);
            }
        } else {
            blogContainer.innerHTML = "<p>Post your blogs today itself !!</p>";
        }
    }

    function deleteBlogPost(blogId) {
        if (confirm("Are you sure you want to delete this blog post?")) {
            // Make a DELETE request to your server to delete the blog post
            fetch(`http://localhost:8000/blog/${blogId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            }).then(response => {
                if (response.ok) {
                    location.reload();
                } else {
                    console.log(response.status);
                }
            }).catch(error => console.log('Error deleting blog post:', error));
        }
    }

    function openEditForm(blog) {
        const editTitleInput = document.getElementById("editTitle");
        const editContentInput = document.getElementById("editContent");
        const editCategoriesInput = document.getElementById("editCategories");

        editTitleInput.value = blog.title;
        editContentInput.value = blog.content;
        editCategoriesInput.value = blog.categories ? blog.categories.join(", ") : "";

        // Show the modal
        const editBlogModal = new bootstrap.Modal(document.getElementById("editBlogModal"));
        editBlogModal.show();

        // Add an event listener to the "Update" button in the modal
        const updateBlogButton = document.getElementById("updateBlogButton");
        updateBlogButton.addEventListener("click", () => {
            // Get the updated data from the form inputs
            const updatedTitle = editTitleInput.value;
            const updatedContent = editContentInput.value;
            const updatedCategories = editCategoriesInput.value.split(",").map(category => category.trim());

            const updatedData = {
                title: updatedTitle,
                content: updatedContent,
                categories: updatedCategories,
            };

            // Send a PUT request to update the blog post
            updateBlogPost(blog['id'], updatedData);

            // Close the modal
            editBlogModal.hide();
            window.ref
        });
    }

    function updateBlogPost(blogId, updatedData) {
        fetch(`http://localhost:8000/blog/${blogId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData)
        }).then(response => {
            if (response.ok) {
                // Blog post updated successfully
                // You can provide user feedback, close the modal, or reload the page
                console.log('Blog post updated successfully');
                // Close the modal
                const modal = new bootstrap.Modal(document.getElementById("editBlogModal"));
                modal.hide();
                // Reload the blog posts or update the content as needed
                location.reload();
            } else {
                console.log(response.status);
                // Handle errors or provide feedback to the user
            }
        }).catch(error => console.log('Error updating blog post:', error));
    }

    function truncateText(text, maxLength) {
        if (text.length <= maxLength) {
            return text;
        }
        const truncatedText = text.slice(0, maxLength);
        return `${truncatedText}...`;
    }