// public/app.js
const API_URL = 'http://localhost:3000/api';
let currentUser = null; // We will store the logged-in user here

// --- DOM Elements ---
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const loginBtn = document.getElementById('login-btn');
const usernameInput = document.getElementById('username-input');
const authError = document.getElementById('auth-error');
const currentUserDisplay = document.getElementById('current-user-display');
const usersList = document.getElementById('users-list');
const postsContainer = document.getElementById('posts-container');
const postBtn = document.getElementById('post-btn');
const postContent = document.getElementById('post-content');

// --- Authentication (Login/Register) ---
loginBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    if (!username) return;

    try {
        // First, attempt to register a new user
        let res = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });

        if (res.ok) {
            currentUser = await res.json(); // New user created
        } else {
            // If registration fails (username exists), fetch all users to "log in"
            const usersRes = await fetch(`${API_URL}/users`);
            const users = await usersRes.json();
            currentUser = users.find(u => u.username === username);
            
            if (!currentUser) throw new Error("Authentication failed");
        }

        // Hide auth screen, show main app
        authSection.classList.remove('active');
        authSection.classList.add('hidden');
        appSection.classList.remove('hidden');
        appSection.classList.add('active');
        currentUserDisplay.textContent = `@${currentUser.username}`;
        
        // Initialize the data
        loadApp();
    } catch (err) {
        authError.textContent = "Error logging in. Try another username.";
    }
});

function loadApp() {
    fetchUsers();
    fetchPosts();
}

// --- 1. Fetch and Display Users (Sidebar) ---
async function fetchUsers() {
    const res = await fetch(`${API_URL}/users`);
    const users = await res.json();
    
    usersList.innerHTML = ''; // Clear current list
    
    users.forEach(user => {
        if (user._id === currentUser._id) return; // Hide yourself from the follow list

        const isFollowing = currentUser.following.includes(user._id);
        const btnClass = isFollowing ? 'follow-btn following' : 'follow-btn';
        const btnText = isFollowing ? 'Following' : 'Follow';

        const userDiv = document.createElement('div');
        userDiv.className = 'user-item';
        userDiv.innerHTML = `
            <span>@${user.username}</span>
            <button class="${btnClass}" onclick="toggleFollow('${user._id}')">${btnText}</button>
        `;
        usersList.appendChild(userDiv);
    });
}

// --- 2. Fetch and Display Posts (Feed) ---
async function fetchPosts() {
    const res = await fetch(`${API_URL}/posts`);
    const posts = await res.json();
    
    postsContainer.innerHTML = '';
    
    posts.forEach(post => {
        const isLiked = post.likes.includes(currentUser._id);
        
        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        postCard.innerHTML = `
            <div class="post-header">@${post.author.username}</div>
            <div class="post-body">${post.content}</div>
            <div class="post-actions">
                <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike('${post._id}')">
                    ♥ ${post.likes.length} Likes
                </button>
            </div>
            <div class="comments-section">
                ${post.comments.map(c => `
                    <div class="comment"><b>@${c.author?.username || 'Unknown'}:</b> ${c.text}</div>
                `).join('')}
                <div class="comment-input-wrapper">
                    <input type="text" id="comment-input-${post._id}" placeholder="Write a comment...">
                    <button class="primary-btn" onclick="addComment('${post._id}')" style="padding: 8px 16px;">Reply</button>
                </div>
            </div>
        `;
        postsContainer.appendChild(postCard);
    });
}

// --- 3. Create a New Post ---
postBtn.addEventListener('click', async () => {
    const content = postContent.value.trim();
    if (!content) return;

    await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, authorId: currentUser._id })
    });

    postContent.value = ''; // Clear textarea
    fetchPosts(); // Refresh the feed to show the new post
});

// --- 4. Toggle Follow/Unfollow ---
window.toggleFollow = async function(targetUserId) {
    const res = await fetch(`${API_URL}/users/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentUserId: currentUser._id, targetUserId })
    });
    
    if (res.ok) {
        const data = await res.json();
        currentUser = data.currentUser; // Update local user state
        fetchUsers(); // Refresh sidebar to toggle button color
    }
};

// --- 5. Toggle Like/Unlike ---
window.toggleLike = async function(postId) {
    await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser._id })
    });
    fetchPosts(); // Refresh feed to update like count
};

// --- 6. Add Comment ---
window.addComment = async function(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const text = input.value.trim();
    if (!text) return;

    await fetch(`${API_URL}/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, authorId: currentUser._id })
    });
    
    fetchPosts(); // Refresh feed to show new comment
};