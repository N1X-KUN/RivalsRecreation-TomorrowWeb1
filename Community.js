// Community Page Functionality
(function() {
  'use strict';

  // Data Storage (localStorage - ready for backend migration)
  const STORAGE_KEY = 'rivals_community_posts';
  const USER_STORAGE_KEY = 'rivals_current_user';

  // Get current user
  function getCurrentUser() {
    const userStr = localStorage.getItem(USER_STORAGE_KEY);
    if (userStr) {
      const user = JSON.parse(userStr);
      // Ensure isGuest flag exists
      if (user.isGuest === undefined) {
        user.isGuest = user.id && user.id.startsWith('guest_');
      }
      return user;
    }
    // Default guest user
    return {
      id: 'guest_' + Date.now(),
      username: 'Guest',
      avatar: 'Images/Rival.png',
      isGuest: true
    };
  }
  
  // Check if user is guest
  function isGuest() {
    return currentUser.isGuest === true;
  }

  // Save current user
  function saveCurrentUser(user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }

  // Get all posts
  function getPosts() {
    const postsStr = localStorage.getItem(STORAGE_KEY);
    return postsStr ? JSON.parse(postsStr) : [];
  }

  // Save posts
  function savePosts(posts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }

  // Add new post
  function addPost(postData) {
    const posts = getPosts();
    const newPost = {
      id: 'post_' + Date.now(),
      ...postData,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: [],
      views: 0,
      likedBy: []
    };
    posts.unshift(newPost); // Add to beginning
    savePosts(posts);
    return newPost;
  }

  // Update post
  function updatePost(postId, updates) {
    const posts = getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index !== -1) {
      posts[index] = { ...posts[index], ...updates };
      savePosts(posts);
      return posts[index];
    }
    return null;
  }

  // Add comment to post
  function addComment(postId, commentData) {
    if (isGuest()) {
      alert('Please sign up to comment on posts!');
      return null;
    }
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
      const newComment = {
        id: 'comment_' + Date.now(),
        ...commentData,
        createdAt: new Date().toISOString()
      };
      post.comments = post.comments || [];
      post.comments.push(newComment);
      savePosts(posts);
      return newComment;
    }
    return null;
  }

  // Toggle like on post
  function toggleLike(postId, userId) {
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.likedBy = post.likedBy || [];
      const index = post.likedBy.indexOf(userId);
      if (index > -1) {
        post.likedBy.splice(index, 1);
        post.likes = Math.max(0, post.likes - 1);
      } else {
        post.likedBy.push(userId);
        post.likes = (post.likes || 0) + 1;
      }
      savePosts(posts);
      return post;
    }
    return null;
  }

  // DOM Elements
  const createPostInput = document.getElementById('create-post-input');
  const submitPostBtn = document.getElementById('submit-post-btn');
  const mediaUploadInput = document.getElementById('media-upload-input');
  const mediaPreview = document.getElementById('media-preview');
  const postsFeed = document.getElementById('posts-feed');
  const communityTabs = document.querySelectorAll('.community-tab');
  const createPostBtns = document.querySelectorAll('.create-post-btn');
  const postModal = document.getElementById('post-modal');
  const postModalBody = document.getElementById('post-modal-body');
  const currentUserAvatar = document.getElementById('current-user-avatar');
  
  // Profile elements
  const profileGuestState = document.getElementById('profile-guest-state');
  const profileLoggedState = document.getElementById('profile-logged-state');
  const profileSignupTrigger = document.getElementById('profile-signup-trigger');
  const profileUsernameText = document.getElementById('profile-username-text');
  const profileBioText = document.getElementById('profile-bio-text');
  const profileAvatarImg = document.getElementById('profile-avatar-img');
  const profileFavoriteChar = document.getElementById('profile-favorite-char');
  const profileRank = document.getElementById('profile-rank');
  const profileWinrate = document.getElementById('profile-winrate');
  const profileCreatedDate = document.getElementById('profile-created-date');

  let selectedMedia = [];
  let activeTab = 'following';
  let currentUser = getCurrentUser();

  // Format account creation date
  function formatAccountDate(createdAt) {
    if (!createdAt) return 'Not set';
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = now - created;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    // Format as date
    return created.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: created.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  }
  
  // Update profile display
  function updateProfileDisplay() {
    if (isGuest()) {
      // Show guest state
      if (profileGuestState) profileGuestState.style.display = 'block';
      if (profileLoggedState) profileLoggedState.style.display = 'none';
    } else {
      // Show logged in state
      if (profileGuestState) profileGuestState.style.display = 'none';
      if (profileLoggedState) profileLoggedState.style.display = 'block';
      
      // Update profile info
      if (profileUsernameText) profileUsernameText.textContent = currentUser.username || 'User';
      if (profileBioText) profileBioText.textContent = currentUser.bio || 'No bio set';
      if (profileAvatarImg && currentUser.avatar) profileAvatarImg.src = currentUser.avatar;
      if (profileFavoriteChar) profileFavoriteChar.textContent = currentUser.favoriteCharacter || 'Not set';
      if (profileRank) profileRank.textContent = currentUser.rank || 'Unranked';
      if (profileWinrate) profileWinrate.textContent = currentUser.winrate ? `${currentUser.winrate}%` : '0%';
      if (profileCreatedDate) profileCreatedDate.textContent = formatAccountDate(currentUser.createdAt);
    }
    
    // Update create post section based on guest status
    updateCreatePostSection();
  }
  
  // Update create post section (disable for guests)
  function updateCreatePostSection() {
    if (isGuest()) {
      // Disable posting for guests
      if (createPostInput) {
        createPostInput.disabled = true;
        createPostInput.placeholder = 'Sign up to create posts and share content!';
      }
      if (submitPostBtn) submitPostBtn.disabled = true;
      createPostBtns.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
      });
    } else {
      // Enable posting for logged in users
      if (createPostInput) {
        createPostInput.disabled = false;
        createPostInput.placeholder = 'Share your thoughts, strategies, or highlights...';
      }
      createPostBtns.forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
      });
    }
  }

  // Initialize
  function init() {
    // Set current user avatar
    if (currentUserAvatar && currentUser.avatar) {
      currentUserAvatar.src = currentUser.avatar;
    }
    
    // Update profile display
    updateProfileDisplay();

    // Load initial posts
    loadPosts();

    // Set up event listeners
    setupEventListeners();

    // Initialize with sample posts if empty
    if (getPosts().length === 0) {
      initializeSamplePosts();
    }
  }

  // Initialize sample posts
  function initializeSamplePosts() {
    const samplePosts = [
      {
        userId: 'user1',
        username: 'ladyhues',
        avatar: 'Images/Rival.png',
        game: 'Genshin Impact',
        title: 'New Codes For primogems, Moras & More',
        text: '✨ Hello, Travelers! ❤️ A small gift from Teyvat has just arrived Redeem these Genshin Impact codes before they expire and claim your rewards! 🎁',
        codes: ['BLKS3198XVS2', '7TBZAGPP2WRD', 'P3GXX56W3VG9'],
        media: ['Images/New1.jpg'],
        hashtags: ['#GenshinImpact', '#Codes'],
        likes: 98,
        comments: [
          { userId: 'user2', username: 'Traveler123', avatar: 'Images/Rival.png', text: 'Thanks for sharing!', createdAt: new Date(Date.now() - 3600000).toISOString() }
        ],
        views: 627,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        userId: 'user2',
        username: '69SHAN69',
        avatar: 'Images/Rival.png',
        game: 'Zenless Zone Zero',
        text: 'is this good ? as f2p',
        media: ['Images/New1.jpg', 'Images/New1.jpg'],
        hashtags: ['#YeShunguang'],
        likes: 98,
        comments: [
          { userId: 'user3', username: 'ProGamer', avatar: 'Images/Rival.png', text: 'Looks solid for F2P!', createdAt: new Date(Date.now() - 7200000).toISOString() }
        ],
        views: 21000,
        createdAt: new Date(Date.now() - 72000000).toISOString()
      },
      {
        userId: 'user3',
        username: 'SoraHoshina',
        avatar: 'Images/Rival.png',
        game: 'Zenless Zone Zero',
        text: 'Ye Shunguang & Zhao M6 Mindscape Server is up! Good luck to those pulling for YSG and Zhao\'s Mindscape (or W-Engines)!',
        media: ['Images/New1.jpg', 'Images/New1.jpg', 'Images/New1.jpg', 'Images/New1.jpg'],
        hashtags: ['#YeShunguang', '#Zhao', '#2.5'],
        likes: 73,
        comments: [],
        views: 27000,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    samplePosts.forEach(post => {
      addPost(post);
    });
    loadPosts();
  }

  // Setup event listeners
  function setupEventListeners() {
    // Post input
    if (createPostInput) {
      createPostInput.addEventListener('input', () => {
        if (submitPostBtn) {
          submitPostBtn.disabled = !createPostInput.value.trim() && selectedMedia.length === 0;
        }
      });
    }

    // Submit post
    if (submitPostBtn) {
      submitPostBtn.addEventListener('click', handlePostSubmit);
    }

    // Media upload buttons
    createPostBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (isGuest()) {
          alert('Please sign up to upload media!');
          if (profileSignupTrigger) profileSignupTrigger.click();
          return;
        }
        const type = btn.dataset.type;
        if (mediaUploadInput) {
          mediaUploadInput.accept = type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : 'image/*';
          mediaUploadInput.click();
        }
      });
    });
    
    // Profile signup trigger
    if (profileSignupTrigger) {
      profileSignupTrigger.addEventListener('click', () => {
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) loginBtn.click();
      });
    }

    // Media upload input
    if (mediaUploadInput) {
      mediaUploadInput.addEventListener('change', handleMediaUpload);
    }

    // Tab switching
    communityTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        communityTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeTab = tab.dataset.tab;
        loadPosts();
      });
    });

    // Modal close
    const modalCloses = document.querySelectorAll('[data-modal-close]');
    modalCloses.forEach(btn => {
      btn.addEventListener('click', () => {
        if (postModal) {
          postModal.setAttribute('hidden', '');
        }
      });
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && postModal && !postModal.hasAttribute('hidden')) {
        postModal.setAttribute('hidden', '');
      }
    });
    
    // Ensure modal is hidden on page load
    if (postModal) {
      postModal.setAttribute('hidden', '');
    }
  }

  // Handle media upload
  function handleMediaUpload(e) {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          selectedMedia.push({
            type: file.type.startsWith('image/') ? 'image' : 'video',
            url: event.target.result,
            file: file
          });
          updateMediaPreview();
        };
        reader.readAsDataURL(file);
      }
    });
    e.target.value = ''; // Reset input
  }

  // Update media preview
  function updateMediaPreview() {
    if (!mediaPreview) return;
    
    if (selectedMedia.length === 0) {
      mediaPreview.setAttribute('hidden', '');
      return;
    }

    mediaPreview.removeAttribute('hidden');
    mediaPreview.innerHTML = selectedMedia.map((media, index) => `
      <div class="media-preview-item">
        ${media.type === 'image' 
          ? `<img src="${media.url}" alt="Preview ${index + 1}" />`
          : `<video src="${media.url}" controls></video>`
        }
        <button class="remove-media" data-index="${index}">&times;</button>
      </div>
    `).join('');

    // Remove media buttons
    mediaPreview.querySelectorAll('.remove-media').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        selectedMedia.splice(index, 1);
        updateMediaPreview();
      });
    });
  }

  // Handle post submit
  function handlePostSubmit() {
    if (isGuest()) {
      alert('Please sign up to create posts!');
      // Trigger signup modal
      if (profileSignupTrigger) profileSignupTrigger.click();
      return;
    }
    
    const text = createPostInput ? createPostInput.value.trim() : '';
    
    if (!text && selectedMedia.length === 0) {
      return;
    }

    const newPost = addPost({
      userId: currentUser.id,
      username: currentUser.username,
      avatar: currentUser.avatar,
      game: 'Marvel Rivals',
      text: text,
      media: selectedMedia.map(m => m.url),
      hashtags: extractHashtags(text),
      likedBy: []
    });

    // Reset form
    if (createPostInput) createPostInput.value = '';
    selectedMedia = [];
    updateMediaPreview();
    if (submitPostBtn) submitPostBtn.disabled = true;

    // Reload posts
    loadPosts();
  }

  // Extract hashtags from text
  function extractHashtags(text) {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? [...new Set(matches)] : [];
  }

  // Load and render posts
  function loadPosts() {
    if (!postsFeed) return;

    let posts = getPosts();

    // Filter by active tab
    if (activeTab === 'following') {
      // Show all for now (can filter by followed users later)
    } else if (activeTab === 'recommended') {
      // Sort by likes/views
      posts = posts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (activeTab === 'events') {
      // Filter event posts (can add event tag later)
    }

    postsFeed.innerHTML = posts.map(post => renderPost(post)).join('');

    // Attach event listeners to new posts
    attachPostListeners();
  }

  // Render single post
  function renderPost(post) {
    const timeAgo = getTimeAgo(new Date(post.createdAt));
    const isLiked = post.likedBy && post.likedBy.includes(currentUser.id);
    const mediaHtml = renderPostMedia(post.media || []);
    const codesHtml = post.codes ? renderCodes(post.codes) : '';
    const hashtagsHtml = post.hashtags ? renderHashtags(post.hashtags) : '';
    const commentsHtml = renderComments(post.comments || []);

    return `
      <article class="community-post" data-post-id="${post.id}">
        <div class="post-header">
          <div class="post-user">
            <div class="user-avatar">
              <img src="${post.avatar || 'Images/Rival.png'}" alt="${post.username}" />
            </div>
            <div class="user-info">
              <div class="username">${escapeHtml(post.username)}</div>
              <div class="post-meta">
                <span class="post-time">${timeAgo}</span>
                ${post.game ? `<span class="post-game">• ${escapeHtml(post.game)}</span>` : ''}
              </div>
            </div>
          </div>
          <div class="post-actions-header">
            <button class="follow-btn">Follow</button>
            <button class="post-menu-btn" aria-label="More options">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="19" cy="12" r="1"></circle>
                <circle cx="5" cy="12" r="1"></circle>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="post-content">
          ${post.title ? `<h3 class="post-title">${escapeHtml(post.title)}</h3>` : ''}
          ${post.text ? `<p class="post-text">${formatText(post.text)}</p>` : ''}
          ${codesHtml}
          ${mediaHtml}
          ${hashtagsHtml}
        </div>
        
        <div class="post-footer">
          <div class="post-interactions">
            <button class="interaction-btn like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post.id}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span>${post.likes || 0}</span>
            </button>
            <button class="interaction-btn comment-btn" data-post-id="${post.id}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>${(post.comments || []).length}</span>
            </button>
            <button class="interaction-btn share-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </button>
          </div>
          <div class="post-views">${formatViews(post.views || 0)} views</div>
        </div>

        <div class="post-comments" data-post-id="${post.id}" style="display: none;">
          <div class="comments-header">
            <h4 class="comments-title">Comments</h4>
          </div>
          <div class="comment-form">
            <input type="text" class="comment-input" placeholder="Write a comment..." data-post-id="${post.id}" />
            <button class="comment-submit" data-post-id="${post.id}">Post</button>
          </div>
          <div class="comments-list">
            ${commentsHtml}
          </div>
        </div>
      </article>
    `;
  }

  // Render post media
  function renderPostMedia(media) {
    if (!media || media.length === 0) return '';

    if (media.length === 1) {
      const isVideo = media[0].includes('video') || media[0].endsWith('.mp4') || media[0].endsWith('.webm');
      return `
        <div class="post-media">
          ${isVideo 
            ? `<video src="${media[0]}" controls></video>`
            : `<img src="${media[0]}" alt="Post media" />`
          }
        </div>
      `;
    } else if (media.length === 2) {
      return `
        <div class="post-media post-media-grid">
          ${media.map(url => {
            const isVideo = url.includes('video') || url.endsWith('.mp4') || url.endsWith('.webm');
            return isVideo 
              ? `<video src="${url}" controls></video>`
              : `<img src="${url}" alt="Post media" />`;
          }).join('')}
        </div>
      `;
    } else {
      return `
        <div class="post-media post-media-grid-4">
          ${media.slice(0, 4).map(url => {
            const isVideo = url.includes('video') || url.endsWith('.mp4') || url.endsWith('.webm');
            return isVideo 
              ? `<video src="${url}" controls></video>`
              : `<img src="${url}" alt="Post media" />`;
          }).join('')}
        </div>
      `;
    }
  }

  // Render codes
  function renderCodes(codes) {
    if (!codes || codes.length === 0) return '';
    return `
      <div class="post-codes">
        ${codes.map(code => `<span class="code-item">${escapeHtml(code)}</span>`).join('')}
      </div>
    `;
  }

  // Render hashtags
  function renderHashtags(hashtags) {
    if (!hashtags || hashtags.length === 0) return '';
    return `
      <div class="post-hashtags">
        ${hashtags.map(tag => `<a href="#" class="hashtag">${escapeHtml(tag)}</a>`).join('')}
      </div>
    `;
  }

  // Render comments
  function renderComments(comments) {
    if (!comments || comments.length === 0) return '';
    return comments.map(comment => {
      const timeAgo = getTimeAgo(new Date(comment.createdAt));
      return `
        <div class="comment-item">
          <div class="comment-avatar">
            <img src="${comment.avatar || 'Images/Rival.png'}" alt="${comment.username}" />
          </div>
          <div class="comment-content">
            <div class="comment-author">${escapeHtml(comment.username)}</div>
            <div class="comment-text">${formatText(comment.text)}</div>
            <div class="comment-meta">${timeAgo}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Attach post listeners
  function attachPostListeners() {
    // Like buttons
    document.querySelectorAll('.like-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const postId = btn.dataset.postId;
        const post = toggleLike(postId, currentUser.id);
        if (post) {
          const isLiked = post.likedBy.includes(currentUser.id);
          btn.classList.toggle('liked', isLiked);
          const countSpan = btn.querySelector('span');
          if (countSpan) {
            countSpan.textContent = post.likes || 0;
          }
        }
      });
    });

    // Comment buttons
    document.querySelectorAll('.comment-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const postId = btn.dataset.postId;
        const commentsSection = document.querySelector(`.post-comments[data-post-id="${postId}"]`);
        if (commentsSection) {
          const isHidden = commentsSection.style.display === 'none';
          commentsSection.style.display = isHidden ? 'block' : 'none';
        }
      });
    });

    // Comment submit buttons
    document.querySelectorAll('.comment-submit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (isGuest()) {
          alert('Please sign up to comment on posts!');
          if (profileSignupTrigger) profileSignupTrigger.click();
          return;
        }
        const postId = btn.dataset.postId;
        const input = document.querySelector(`.comment-input[data-post-id="${postId}"]`);
        if (input && input.value.trim()) {
          const newComment = addComment(postId, {
            userId: currentUser.id,
            username: currentUser.username,
            avatar: currentUser.avatar,
            text: input.value.trim()
          });
          if (newComment) {
            input.value = '';
            loadPosts(); // Reload to show new comment
          }
        }
      });
    });
    
    // Disable comment inputs for guests
    if (isGuest()) {
      document.querySelectorAll('.comment-input').forEach(input => {
        input.disabled = true;
        input.placeholder = 'Sign up to comment!';
      });
    }

    // Comment input enter key
    document.querySelectorAll('.comment-input').forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const postId = input.dataset.postId;
          const btn = document.querySelector(`.comment-submit[data-post-id="${postId}"]`);
          if (btn) btn.click();
        }
      });
    });
  }

  // Utility functions
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatText(text) {
    // Convert URLs to links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    // Convert hashtags to links
    const hashtagRegex = /#(\w+)/g;
    let formatted = escapeHtml(text);
    formatted = formatted.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    formatted = formatted.replace(hashtagRegex, '<a href="#" class="hashtag">#$1</a>');
    return formatted;
  }

  function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  }

  function formatViews(views) {
    if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'k';
    }
    return views.toString();
  }

  // Listen for user changes (login/logout)
  function syncUserFromStorage() {
    // Check for guest user
    const guestUserStr = localStorage.getItem('guestUser') || sessionStorage.getItem('guestUser');
    const isGuestStorage = localStorage.getItem('isGuest') === 'true' || sessionStorage.getItem('isGuest') === 'true';
    
    if (isGuestStorage && guestUserStr) {
      const guestUser = JSON.parse(guestUserStr);
      currentUser = {
        id: guestUser.id,
        username: 'Guest',
        avatar: 'Images/Rival.png',
        isGuest: true
      };
      saveCurrentUser(currentUser);
    } else {
      // Check for logged in user (from backend)
      const loggedInUserStr = localStorage.getItem('loggedInUser') || sessionStorage.getItem('loggedInUser');
      if (loggedInUserStr) {
        const loggedInUser = JSON.parse(loggedInUserStr);
        currentUser = {
          id: loggedInUser.id || loggedInUser._id,
          username: loggedInUser.name || loggedInUser.username || loggedInUser.nickname,
          avatar: loggedInUser.avatar || 'Images/Rival.png',
          bio: loggedInUser.bio || '',
          favoriteCharacter: loggedInUser.favoriteCharacter || 'Not set',
          rank: loggedInUser.rank || 'Unranked',
          winrate: loggedInUser.winrate || 0,
          createdAt: loggedInUser.createdAt || loggedInUser.created_at || new Date().toISOString(),
          isGuest: false
        };
        saveCurrentUser(currentUser);
      } else {
        // Default to guest
        currentUser = {
          id: 'guest_' + Date.now(),
          username: 'Guest',
          avatar: 'Images/Rival.png',
          isGuest: true
        };
        saveCurrentUser(currentUser);
      }
    }
    
    updateProfileDisplay();
    updateCreatePostSection();
  }
  
  // Listen for storage changes (login/logout events)
  window.addEventListener('storage', syncUserFromStorage);
  
  // Also check periodically for changes (for same-tab updates)
  setInterval(syncUserFromStorage, 1000);
  
  // Listen for custom login events
  window.addEventListener('userLoggedIn', (e) => {
    if (e.detail && e.detail.user) {
      currentUser = {
        id: e.detail.user.id || e.detail.user._id,
        username: e.detail.user.name || e.detail.user.username || e.detail.user.nickname,
        avatar: e.detail.user.avatar || 'Images/Rival.png',
        bio: e.detail.user.bio || '',
        favoriteCharacter: e.detail.user.favoriteCharacter || 'Not set',
        rank: e.detail.user.rank || 'Unranked',
        winrate: e.detail.user.winrate || 0,
        createdAt: e.detail.user.createdAt || e.detail.user.created_at || new Date().toISOString(),
        isGuest: false
      };
      saveCurrentUser(currentUser);
      updateProfileDisplay();
      updateCreatePostSection();
    }
  });
  
  window.addEventListener('userLoggedOut', () => {
    currentUser = {
      id: 'guest_' + Date.now(),
      username: 'Guest',
      avatar: 'Images/Rival.png',
      isGuest: true
    };
    saveCurrentUser(currentUser);
    updateProfileDisplay();
    updateCreatePostSection();
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      syncUserFromStorage();
      init();
    });
  } else {
    syncUserFromStorage();
    init();
  }
})();

