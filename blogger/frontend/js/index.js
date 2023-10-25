const loginForm = document.getElementById("loginForm");

if (document.body.contains(loginForm)) {
    document.getElementById('loginButton').addEventListener('click', event => {
        event.preventDefault();

        const username = document.getElementById('loginUsername').value;
        localStorage.setItem("username", username);
        const password = document.getElementById('loginPassword').value;

        const data = {
            username: username,
            password: password
        };

        fetch('http://localhost:8000/user/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        }).then(response => {
            if (response.ok) {
                response.json().then(data => {
                    let userId = data["id"];
                    console.log(userId);
                    localStorage.setItem("userId", userId);
                    console.log("User authenticated successfully");
                    window.location.replace("http://localhost:8080/blogs.html");
                });
            } else {
                // Login failed
                console.error('User authentication failed.');
                // You can display an error message or handle the error accordingly.
            }
        }).catch(error => {
            console.error('An error occurred: ', error);
        });
    });

    document.getElementById('registerButton').addEventListener('click', function (event) {
        event.preventDefault(); // Prevent the form from submitting traditionally

        // Gather user input from the registration form
        const username = document.getElementById('regUsername').value
        const password = document.getElementById('regPassword').value;
        const email = document.getElementById('regEmail').value;

        // Create a data object to send in the POST request
        const data = {
            username: username,
            password: password,
            email: email
        };

        console.log(data);

        // Send a POST request
        fetch('http://localhost:8000/user/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        }).then(response => {
            if (response.ok) {
                response.json().then(data => {
                    let userId = data["id"];
                    console.log(userId);
                    localStorage.setItem("userId", userId);
                    localStorage.setItem("username", username); // Set username here
                    console.log("User authenticated successfully");
                    window.location.replace("http://localhost:8080/blogs.html");
                });
            } else {
                // Registration failed
                console.error('User registration failed.');
                // You can display an error message or handle the error accordingly.
            }
        }).catch(error => {
            console.error('An error occurred: ', error);
        });
    });
}
