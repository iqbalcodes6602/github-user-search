const baseURL = "https://api.github.com";

async function searchUser() {
    const username = document.getElementById("username").value;
    const reposPerPage = document.getElementById("reposPerPage").value;
    const userDetailsElement = document.getElementById("userDetails");
    const reposListElement = document.getElementById("reposList");
    const paginationElement = document.getElementById("pagination");

    // Clear previous results and display loading text
    userDetailsElement.innerHTML = "<img class='laoding-image' src='./assets/loading.svg' />";
    reposListElement.innerHTML = "";
    paginationElement.innerHTML = "";

    userDetailsElement.scrollIntoView({ behavior: 'smooth' });

    try {
        // call fetchUserDetails function to get user details
        const userData = await fetchUserDetails(username);

        if (!userData || userData.message === "Not Found") {
            // if not found text
            document.getElementById("page-ops").setAttribute("class", "page-ops")
            userDetailsElement.innerHTML = "No user found.";
            return;
        }

        // call fetchUserRepos function to get user repos
        const reposData = await fetchUserRepos(username);

        // user card for displaying user details
        userDetailsElement.innerHTML = `
            <div class="user-card">
                <div class="user-left">
                    <h2><a href="https://github.com/${username}/" target="_blank">${userData.login}</a></h2>
                    <p><strong>Name:</strong> ${userData.name || 'N/A'}</p>
                    <p><strong>Bio:</strong> ${userData.bio || 'N/A'}</p>
                    <p><strong>Location:</strong> ${userData.location || 'Somewhere'}</p>
                    <p><strong>Followers:</strong> ${userData.followers}</p>
                    <p><strong>Following:</strong> ${userData.following}</p>
                    <p><strong>Public Repositories:</strong> ${userData.public_repos}</p>
                </div>
                <div class="user-img">
                    <img src="${userData.avatar_url}" alt="User Avatar">
                </div>
            </div>
        `;

        // ṭotal pages for pagination
        const totalPages = Math.ceil(userData.public_repos / reposPerPage);

        let currentPage = 1;
        displayRepos(currentPage);

        // pagination buttons
        // Previous button
        const preButton = document.createElement("button");
        preButton.innerText = "Prev";
        preButton.addEventListener("click", () => displayRepos(currentPage - 1));
        paginationElement.appendChild(preButton);
        // Page buttons 1 2 3 4 5 ...
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement("button");
            if (i === 1) {
                button.classList.add("active");
            }
            button.innerText = i;
            button.addEventListener("click", () => displayRepos(i));
            paginationElement.appendChild(button);
        }
        // show page ops like search and per page
        document.getElementById("page-ops").setAttribute("class", "page-ops-show")
        // next button
        const nextButton = document.createElement("button");
        nextButton.innerText = "Next";
        nextButton.addEventListener("click", () => displayRepos(currentPage + 1));
        paginationElement.appendChild(nextButton);



        // Display repos based on page number
        async function displayRepos(page) {
            if (page < 1 || page > totalPages) {
                return;
            }

            highlightSelectedPage(page);
            // Display loading text during API call
            reposListElement.innerHTML = "<img class='laoding-image' src='./assets/loading.svg' />";

            currentPage = page;
            const response = await fetch(`${baseURL}/users/${username}/repos?page=${page}&per_page=${reposPerPage}`);
            const reposToShow = await response.json();

            // Filter repos based on search input
            const searchTerm = document.getElementById("repoSearch").value.toLowerCase();
            const filteredRepos = searchTerm
                ? reposToShow.filter(repo => repo.name.toLowerCase().includes(searchTerm))
                : reposToShow;

            reposListElement.innerHTML = filteredRepos.map((repo, index) => `
                <a href="https://github.com/${username}/${repo.name}" target="_blank">
                    <div class="repo-card">
                        <h3>${repo.name}</h3>
                        <p><strong>Description:</strong> ${repo.description ? repo.description : 'No description available'}</p>
                        <p><strong>Language:</strong> ${repo.language ? repo.language : 'N/A'} &nbsp;&nbsp;&nbsp; ${repo.private ? '<strong><i class="fas fa-lock"></i></strong> Private' : '<strong><i class="fas fa-globe"></i></strong> Public'} &nbsp;&nbsp;&nbsp; ${repo.fork ? '<strong><i class="fas fa-code-branch"></i></strong> Yes' : '<strong><i class="fas fa-code-branch"></i></strong> No'} &nbsp;&nbsp;&nbsp; <strong><i class="fas fa-star"></i></strong> ${repo.stargazers_count}</p>
                    </div>
                </a>
            `).join("");
        }

    } catch (error) {
        userDetailsElement.innerHTML = "Error fetching user data.";
        console.error("Error fetching data:", error);
    }

}

// fetch user deatils from GitHub API
async function fetchUserDetails(username) {
    const response = await fetch(`${baseURL}/users/${username}`);
    return response.json();
}

// Fetch user repos from GitHub API
async function fetchUserRepos(username) {
    const response = await fetch(`${baseURL}/users/${username}/repos`);
    return response.json();
}

// search repos based on input text
function searchRepos() {
    searchUser();
}

// highlight selected page
function highlightSelectedPage(page) {
    const buttons = document.querySelectorAll("#pagination button");
    buttons.forEach((button, index) => {
        if (index === page) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }
    });
}

// search user on enter key press
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        searchUser();
    }
}