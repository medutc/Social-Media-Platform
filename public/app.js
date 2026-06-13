// public/app.js
const API_URL = '/api';
let currentUser = null;
let authToken = null;
let currentTab = 'login';

// ══════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════
function switchTab(tab) {
    currentTab = tab;
    document.getElementById('tab-login').classList.toggle('active', tab === 'login');
    document.getElementById('tab-register').classList.toggle('active', tab === 'register');
    document.getElementById('bio-field').classList.toggle('hidden', tab === 'login');
    document.getElementById('auth-submit-btn').textContent = tab === 'login' ? 'Login' : 'Register';
    document.getElementById('auth-error').textContent = '';
}

async function handleAuth() {
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    const bio      = document.getElementById('auth-bio')?.value.trim() || '';
    const errorEl  = document.getElementById('auth-error');
    errorEl.textContent = '';

    if (!username || !password) { errorEl.textContent = 'Please fill all fields.'; return; }

    const endpoint = currentTab === 'register' ? '/users/register' : '/users/login';
    const body     = currentTab === 'register' ? { username, password, bio } : { username, password };

    try {
        const res  = await apiFetch(endpoint, 'POST', body, false);
        const data = await res.json();
        if (!res.ok) { errorEl.textContent = data.error || 'Something went wrong.'; return; }

        authToken   = data.token;
        currentUser = data.user;
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(currentUser));
        enterApp();
    } catch {
        errorEl.textContent = 'Server error. Make sure the backend is running.';
    }
}

function logout() {
    authToken = currentUser = null;
    localStorage.clear();
    document.getElementById('app-section').className = 'screen hidden';
    document.getElementById('auth-section').className = 'screen active';
}

// ══════════════════════════════════════════════
//  FETCH HELPER
// ══════════════════════════════════════════════
async function apiFetch(endpoint, method = 'GET', body = null, requireAuth = true, isFormData = false) {
    const headers = {};
    if (requireAuth && authToken) headers['Authorization'] = `Bearer ${authToken}`;
    if (!isFormData && body)      headers['Content-Type']  = 'application/json';

    const options = { method, headers };
    if (body) options.body = isFormData ? body : JSON.stringify(body);
    return fetch(`${API_URL}${endpoint}`, options);
}

// ══════════════════════════════════════════════
//  ENTER / INIT APP
// ══════════════════════════════════════════════
function enterApp() {
    document.getElementById('auth-section').className = 'screen hidden';
    document.getElementById('app-section').className  = 'screen active';
    document.getElementById('current-user-display').textContent = `@${currentUser.username}`;
    renderNavAvatar();
    loadApp();
}

window.onload = () => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (t && u) { authToken = t; currentUser = JSON.parse(u); enterApp(); }
};

function loadApp() { fetchUsers(); fetchPosts(); }

// ══════════════════════════════════════════════
//  NAV AVATAR
// ══════════════════════════════════════════════
function renderNavAvatar() {
    const el = document.getElementById('nav-avatar');
    if (!el) return;
    if (currentUser.profilePicture) {
        el.innerHTML = `<img src="${currentUser.profilePicture}" alt="avatar">`;
        el.classList.add('has-image');
    } else {
        el.textContent = currentUser.username[0].toUpperCase();
        el.classList.remove('has-image');
    }

    // Create post avatar
    const ca = document.getElementById('create-avatar');
    if (ca) {
        if (currentUser.profilePicture) {
            ca.innerHTML = `<img src="${currentUser.profilePicture}" alt="avatar">`;
            ca.classList.add('has-image');
        } else {
            ca.textContent = currentUser.username[0].toUpperCase();
            ca.classList.remove('has-image');
        }
    }
}

// ══════════════════════════════════════════════
//  USERS SIDEBAR
// ══════════════════════════════════════════════
async function fetchUsers() {
    const res = await apiFetch('/users');
    if (!res.ok) return;
    const users = await res.json();
    const list  = document.getElementById('users-list');
    list.innerHTML = '';

    users.forEach(user => {
        if (user._id === currentUser._id) return;
        const isFollowing = isUserFollowed(user._id);

        const div = document.createElement('div');
        div.className = 'user-item';
        div.innerHTML = `
            <div class="user-info-mini" onclick="openProfile('${user._id}')">
                ${avatarHtml(user, 38)}
                <div>
                    <div class="uname">@${user.username}</div>
                    <div class="usub">${user.followers?.length || 0} followers</div>
                </div>
            </div>
            <button class="follow-btn ${isFollowing ? 'following' : ''}"
                    onclick="toggleFollow('${user._id}', this)">
                ${isFollowing ? 'Following' : 'Follow'}
            </button>`;
        list.appendChild(div);
    });
}

function isUserFollowed(targetId) {
    return currentUser.following?.some(id =>
        (typeof id === 'object' ? id._id : id) === targetId
    );
}

// ══════════════════════════════════════════════
//  POSTS FEED
// ══════════════════════════════════════════════
async function fetchPosts() {
    const res = await apiFetch('/posts');
    if (!res.ok) return;
    const posts = await res.json();
    const cont  = document.getElementById('posts-container');
    cont.innerHTML = '';

    if (!posts.length) {
        cont.innerHTML = `<p class="empty-feed">No posts yet. Be the first! 🚀</p>`;
        return;
    }
    posts.forEach(p => renderPost(p, cont));
}

function renderPost(post, container) {
    const isLiked = post.likes?.some(id =>
        (typeof id === 'object' ? id._id : id) === currentUser._id
    );
    const isOwner = post.author?._id === currentUser._id;

    const card = document.createElement('div');
    card.className = 'post-card';
    card.id = `post-${post._id}`;
    card.innerHTML = `
        <div class="post-header">
            <div class="post-author-info" onclick="openProfile('${post.author._id}')">
                ${avatarHtml(post.author, 40)}
                <div>
                    <div class="post-username">@${post.author.username}</div>
                    <div class="post-time">${formatTime(post.createdAt)}</div>
                </div>
            </div>
            ${isOwner ? `<button class="delete-btn" onclick="deletePost('${post._id}')">🗑 Delete</button>` : ''}
        </div>

        ${post.content ? `<div class="post-body">${escapeHtml(post.content)}</div>` : ''}

        ${renderMedia(post.media)}

        <div class="post-actions">
            <button class="action-btn ${isLiked ? 'liked' : ''}"
                    id="like-btn-${post._id}"
                    onclick="toggleLike('${post._id}', this)">
                ${isLiked ? '❤️' : '🤍'} <span id="like-count-${post._id}">${post.likes?.length || 0}</span> Likes
            </button>
            <span class="action-btn">💬 ${post.comments?.length || 0} Comments</span>
        </div>

        <div class="comments-section">
            <div class="comments-list">
                ${(post.comments || []).map(c => `
                    <div class="comment">
                        <span onclick="openProfile('${c.author?._id}')">${avatarHtml(c.author || {username:'?'}, 26)}</span>
                        <div class="comment-body">
                            <b onclick="openProfile('${c.author?._id}')">@${c.author?.username || 'Unknown'}</b>
                            <span>${escapeHtml(c.text)}</span>
                        </div>
                    </div>`).join('')}
            </div>
            <div class="comment-input-wrapper">
                <input type="text" id="comment-input-${post._id}"
                       placeholder="Write a comment…"
                       onkeydown="if(event.key==='Enter') addComment('${post._id}')">
                <button class="reply-btn" onclick="addComment('${post._id}')">Reply</button>
            </div>
        </div>`;
    container.appendChild(card);
}

// Render media (image / video / audio) with download button
function renderMedia(media) {
    if (!media?.url) return '';
    const filename = media.originalName || 'download';
    const downloadBtn = `
        <a href="${media.url}" download="${filename}" class="download-btn" title="Download">
            ⬇ Download
        </a>`;

    if (media.type === 'image') return `
        <div class="post-media">
            <img src="${media.url}" alt="Post image" onclick="openLightbox('${media.url}')" loading="lazy">
            ${downloadBtn}
        </div>`;

    if (media.type === 'video') return `
        <div class="post-media">
            <video controls preload="metadata"><source src="${media.url}"></video>
            ${downloadBtn}
        </div>`;

    if (media.type === 'audio') return `
        <div class="post-media audio-wrap">
            <div class="audio-icon">🎵</div>
            <div class="audio-inner">
                <p class="audio-name">${escapeHtml(filename)}</p>
                <audio controls preload="metadata"><source src="${media.url}"></audio>
            </div>
            ${downloadBtn}
        </div>`;

    return '';
}

// ══════════════════════════════════════════════
//  MEDIA PICKER / PREVIEW
// ══════════════════════════════════════════════
function triggerMediaPicker(accept) {
    const input = document.getElementById('post-media-input');
    input.accept = accept;
    input.click();
}

function previewMedia(input) {
    const file = input.files[0];
    if (!file) return;
    const preview = document.getElementById('media-preview');
    const removeBtn = document.getElementById('remove-media-btn');
    const url = URL.createObjectURL(file);
    const type = file.type.split('/')[0];

    let html = '';
    if (type === 'image') html = `<img src="${url}" alt="preview">`;
    else if (type === 'video') html = `<video src="${url}" controls></video>`;
    else if (type === 'audio') html = `<div class="audio-preview-label">🎵 ${escapeHtml(file.name)}</div><audio src="${url}" controls></audio>`;

    preview.innerHTML = html;
    preview.classList.remove('hidden');
    removeBtn.classList.remove('hidden');
}

function removeMedia() {
    const input = document.getElementById('post-media-input');
    const preview = document.getElementById('media-preview');
    const removeBtn = document.getElementById('remove-media-btn');
    input.value = '';
    preview.innerHTML = '';
    preview.classList.add('hidden');
    removeBtn.classList.add('hidden');
}

// ══════════════════════════════════════════════
//  CREATE POST
// ══════════════════════════════════════════════
async function createPost() {
    const content = document.getElementById('post-content').value.trim();
    const file    = document.getElementById('post-media-input').files[0];

    if (!content && !file) {
        alert('Add a caption or select a media file.');
        return;
    }

    const formData = new FormData();
    if (content) formData.append('content', content);
    if (file)    formData.append('media', file);

    const res = await apiFetch('/posts', 'POST', formData, true, true);
    if (res.ok) {
        document.getElementById('post-content').value = '';
        removeMedia();
        fetchPosts();
    }
}

// ══════════════════════════════════════════════
//  DELETE POST
// ══════════════════════════════════════════════
window.deletePost = async function(postId) {
    if (!confirm('Delete this post?')) return;
    const res = await apiFetch(`/posts/${postId}`, 'DELETE');
    if (res.ok) document.getElementById(`post-${postId}`)?.remove();
};

// ══════════════════════════════════════════════
//  FOLLOW / LIKE / COMMENT
// ══════════════════════════════════════════════
window.toggleFollow = async function(targetUserId, btn) {
    const res = await apiFetch('/users/follow', 'POST', { targetUserId });
    if (!res.ok) return;
    const data = await res.json();
    currentUser = data.currentUser;
    localStorage.setItem('user', JSON.stringify(currentUser));
    const nowFollowing = data.message === 'Followed';
    btn.textContent = nowFollowing ? 'Following' : 'Follow';
    btn.classList.toggle('following', nowFollowing);
};

window.toggleLike = async function(postId, btn) {
    const res = await apiFetch(`/posts/${postId}/like`, 'PUT');
    if (!res.ok) return;
    const data = await res.json();
    btn.innerHTML = `${data.isLiked ? '❤️' : '🤍'} <span id="like-count-${postId}">${data.likesCount}</span> Likes`;
    btn.classList.toggle('liked', data.isLiked);
};

window.addComment = async function(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const text  = input.value.trim();
    if (!text) return;
    const res = await apiFetch(`/posts/${postId}/comment`, 'POST', { text });
    if (res.ok) { input.value = ''; fetchPosts(); }
};

// ══════════════════════════════════════════════
//  PROFILE MODAL
// ══════════════════════════════════════════════
window.openProfile = async function(userId) {
    const modal   = document.getElementById('profile-modal');
    const content = document.getElementById('profile-content');
    content.innerHTML = '<p class="loading-text">Loading profile…</p>';
    modal.classList.remove('hidden');

    const res = await apiFetch(`/users/${userId}`);
    if (!res.ok) { content.innerHTML = '<p>Error loading profile.</p>'; return; }

    const { user, posts } = await res.json();
    const isMe        = user._id === currentUser._id;
    const isFollowing = isUserFollowed(user._id);

    content.innerHTML = `
        <!-- Profile Header -->
        <div class="profile-header">
            <div class="profile-avatar-wrap">
                ${profileAvatarHtml(user)}
                ${isMe ? `
                    <label class="change-photo-btn" title="Change profile picture">
                        📷
                        <input type="file" accept="image/*" style="display:none"
                               onchange="uploadProfilePicture(this.files[0])">
                    </label>` : ''}
            </div>
            <h2>@${user.username}</h2>
            <p class="profile-bio">${user.bio || 'No bio yet.'}</p>

            <div class="profile-stats">
                <div class="stat" onclick="showTab('posts-tab-${user._id}')">
                    <strong>${posts.length}</strong><span>Posts</span>
                </div>
                <div class="stat" onclick="showTab('followers-tab-${user._id}')">
                    <strong>${user.followers?.length || 0}</strong><span>Followers</span>
                </div>
                <div class="stat" onclick="showTab('following-tab-${user._id}')">
                    <strong>${user.following?.length || 0}</strong><span>Following</span>
                </div>
            </div>

            ${isMe ? `
                <div class="edit-bio-form">
                    <input type="text" id="edit-bio-input" value="${escapeHtml(user.bio || '')}" placeholder="Update your bio…">
                    <button class="primary-btn" style="width:auto" onclick="updateBio()">Save</button>
                </div>` : `
                <button class="follow-btn ${isFollowing ? 'following' : ''} profile-follow-btn"
                        onclick="toggleFollowProfile('${user._id}', this)">
                    ${isFollowing ? '✓ Following' : '+ Follow'}
                </button>`}
        </div>

        <!-- Tabs -->
        <div class="profile-tabs">
            <button class="ptab-btn active" onclick="showTab('posts-tab-${user._id}')">Posts</button>
            <button class="ptab-btn" onclick="showTab('followers-tab-${user._id}')">Followers</button>
            <button class="ptab-btn" onclick="showTab('following-tab-${user._id}')">Following</button>
        </div>

        <!-- Posts Tab -->
        <div id="posts-tab-${user._id}" class="ptab-content active">
            ${posts.length === 0
                ? '<p class="empty-tab">No posts yet.</p>'
                : posts.map(p => `
                    <div class="profile-post-card">
                        ${p.media?.url ? `
                            <div class="profile-post-media">
                                ${p.media.type === 'image'
                                    ? `<img src="${p.media.url}" onclick="openLightbox('${p.media.url}')">`
                                    : p.media.type === 'video'
                                        ? `<video src="${p.media.url}" controls></video>`
                                        : `<audio src="${p.media.url}" controls></audio>`}
                            </div>` : ''}
                        ${p.content ? `<p class="profile-post-caption">${escapeHtml(p.content)}</p>` : ''}
                        <div class="profile-post-meta">
                            ❤️ ${p.likes?.length || 0} · 💬 ${p.comments?.length || 0} · ${formatTime(p.createdAt)}
                        </div>
                    </div>`).join('')}
        </div>

        <!-- Followers Tab -->
        <div id="followers-tab-${user._id}" class="ptab-content hidden">
            ${(user.followers?.length || 0) === 0
                ? '<p class="empty-tab">No followers yet.</p>'
                : user.followers.map(f => `
                    <div class="user-list-row" onclick="openProfile('${f._id}'); closeProfileModal();">
                        ${avatarHtml(f, 40)}
                        <div>
                            <div class="uname">@${f.username}</div>
                        </div>
                    </div>`).join('')}
        </div>

        <!-- Following Tab -->
        <div id="following-tab-${user._id}" class="ptab-content hidden">
            ${(user.following?.length || 0) === 0
                ? '<p class="empty-tab">Not following anyone yet.</p>'
                : user.following.map(f => `
                    <div class="user-list-row" onclick="openProfile('${f._id}'); closeProfileModal();">
                        ${avatarHtml(f, 40)}
                        <div>
                            <div class="uname">@${f.username}</div>
                        </div>
                    </div>`).join('')}
        </div>`;
};

window.showTab = function(tabId) {
    // Hide all ptab-contents in the modal
    document.querySelectorAll('.ptab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.ptab-btn').forEach(el => el.classList.remove('active'));
    // Show target
    const target = document.getElementById(tabId);
    if (target) target.classList.remove('hidden');
    // Activate corresponding button
    const idx = tabId.includes('posts') ? 0 : tabId.includes('followers') ? 1 : 2;
    const btns = document.querySelectorAll('.ptab-btn');
    if (btns[idx]) btns[idx].classList.add('active');
};

window.openMyProfile = function() { openProfile(currentUser._id); };

window.closeProfileOnBg = function(e) {
    if (e.target.id === 'profile-modal') closeProfileModal();
};
window.closeProfileModal = function() {
    document.getElementById('profile-modal').classList.add('hidden');
};

window.toggleFollowProfile = async function(targetId, btn) {
    const res = await apiFetch('/users/follow', 'POST', { targetUserId: targetId });
    if (!res.ok) return;
    const data = await res.json();
    currentUser = data.currentUser;
    localStorage.setItem('user', JSON.stringify(currentUser));
    const nowFollowing = data.message === 'Followed';
    btn.textContent = nowFollowing ? '✓ Following' : '+ Follow';
    btn.classList.toggle('following', nowFollowing);
    fetchUsers();
};

// ══════════════════════════════════════════════
//  PROFILE PICTURE UPLOAD
// ══════════════════════════════════════════════
window.uploadProfilePicture = async function(file) {
    if (!file) return;
    const formData = new FormData();
    formData.append('profilePicture', file);

    const res = await apiFetch('/users/profile/picture', 'PUT', formData, true, true);
    if (res.ok) {
        const updated = await res.json();
        currentUser.profilePicture = updated.profilePicture;
        localStorage.setItem('user', JSON.stringify(currentUser));
        renderNavAvatar();
        openProfile(currentUser._id); // refresh profile modal
    }
};

// ══════════════════════════════════════════════
//  UPDATE BIO
// ══════════════════════════════════════════════
async function updateBio() {
    const bio = document.getElementById('edit-bio-input').value.trim();
    const res = await apiFetch('/users/profile/update', 'PUT', { bio });
    if (res.ok) {
        const updated = await res.json();
        currentUser.bio = updated.bio;
        localStorage.setItem('user', JSON.stringify(currentUser));
        openProfile(currentUser._id);
    }
}

// ══════════════════════════════════════════════
//  LIGHTBOX (image preview)
// ══════════════════════════════════════════════
window.openLightbox = function(src) {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    img.src = src;
    img.classList.remove('hidden');
    lb.classList.remove('hidden');
};
window.closeLightbox = function() {
    document.getElementById('lightbox').classList.add('hidden');
    document.getElementById('lightbox-img').src = '';
};

// ══════════════════════════════════════════════
//  UTILS
// ══════════════════════════════════════════════
function avatarHtml(user, size = 36) {
    if (!user) return '';
    const fontSize = Math.round(size * 0.4);
    if (user.profilePicture) {
        return `<img src="${user.profilePicture}" class="user-avatar-mini has-image"
                     style="width:${size}px;height:${size}px" alt="${user.username}" loading="lazy">`;
    }
    return `<span class="user-avatar-mini"
                  style="width:${size}px;height:${size}px;font-size:${fontSize}px">
                ${(user.username || '?')[0].toUpperCase()}
            </span>`;
}

function profileAvatarHtml(user) {
    if (user.profilePicture) {
        return `<img src="${user.profilePicture}" class="profile-avatar-img" alt="${user.username}">`;
    }
    return `<div class="profile-avatar-placeholder">${user.username[0].toUpperCase()}</div>`;
}

function formatTime(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

function escapeHtml(text) {
    return String(text || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}