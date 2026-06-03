async function renderHome() {
  const app = document.getElementById("app");
  const user = auth.getUser();

  app.innerHTML = `
    <div class="hero">
      <h1>Your <span>Cinema</span> World</h1>
      <p>Film ve dizileri paylaş, değerlendir, keşfet.</p>
      ${!user ? `
        <div class="hero-buttons">
          <button class="btn" onclick="navigate('register')">Başla</button>
          <button class="btn btn-outline" onclick="navigate('explore')">Keşfet</button>
        </div>` : `
        <div class="hero-buttons">
          <button class="btn" onclick="openCreatePostModal()">+ Yeni Gönderi</button>
          <button class="btn btn-outline" onclick="navigate('explore')">İçerikleri Keşfet</button>
        </div>`
    }
    </div>
    <div class="section">
      <div class="section-header">
        <div class="section-title">📰 Son Gönderiler</div>
      </div>
      <div id="posts-feed"><p style="color:var(--text-muted)">Yükleniyor...</p></div>
    </div>
  `;

  await loadPostsFeed();
}

async function loadPostsFeed() {
  try {
    const posts = await api.getAllPosts();
    const container = document.getElementById("posts-feed");

    if (posts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🎬</div>
          <p>Henüz gönderi yok. İlk paylaşımı sen yap!</p>
        </div>`;
      return;
    }

    container.innerHTML = posts.map(post => renderPostCard(post)).join("");
  } catch (err) {
    document.getElementById("posts-feed").innerHTML = `<p style="color:var(--danger)">${err.message}</p>`;
  }
}

function renderPostCard(post) {
  const user = auth.getUser();
  const isOwner = user && user.id === (post.userId ?? post.user_id);
  const contentTitle = post.contentTitle ?? post.content_title;
  const contentType = post.contentType ?? post.content_type;

  return `
    <div class="post-card" id="post-${post.id}">
      <div class="post-header">
        ${(post.avatarUrl || post.avatar_url)
      ? `<img src="${post.avatarUrl || post.avatar_url}" style="width:38px;height:38px;border-radius:50%;object-fit:cover;flex-shrink:0;" />`
      : `<div class="avatar">${getInitial(post.username)}</div>`
    }
        <div>
          <div class="post-username">${post.username}</div>
          <div class="post-time">${timeAgo(post.createdAt ?? post.created_at)}</div>
        </div>
        ${isOwner ? `
          <div style="margin-left:auto; display:flex; gap:8px">
            <button class="btn btn-outline btn-sm" onclick="openEditPostModal(${post.id}, '${escapeStr(post.caption)}')">Düzenle</button>
            <button class="btn btn-sm" style="background:var(--danger)" onclick="handleDeletePost(${post.id})">Sil</button>
          </div>` : ""}
      </div>
      ${contentTitle ? `
  <div class="post-content-tag" style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.75rem; cursor:pointer; padding:0.5rem; border-radius:6px; background:var(--surface2)" onclick="openContentDetail(${post.contentId})">
    ${(post.contentCoverUrl || post.content_cover_url)
        ? `<img src="${post.contentCoverUrl || post.content_cover_url}" style="width:144px;height:216px;object-fit:cover;border-radius:4px;flex-shrink:0" />`
        : `<span style="font-size:1.5rem">${getTypeEmoji(contentType)}</span>`
      }
    <div>
      <div style="font-weight:600; font-size:0.9rem">${contentTitle}</div>
      <div style="font-size:0.75rem; color:var(--text-muted)">${getTypeEmoji(contentType)} ${contentType ?? ''}</div>
    </div>
  </div>` : ""}
      ${post.caption ? `<div class="post-caption">${post.caption}</div>` : ""}
      <div class="post-actions">
        <button class="action-btn" onclick="handleToggleLike(${post.id}, this)">
          ❤️ <span class="like-count">${post.likeCount ?? post.like_count ?? 0}</span>
        </button>
        <button class="action-btn" onclick="toggleComments(${post.id})">
          💬 ${post.commentCount ?? post.comment_count ?? 0} Yorum
        </button>
      </div>
      <div id="comments-${post.id}" style="display:none"></div>
    </div>
  `;
}

async function handleToggleLike(postId, btn) {
  if (!auth.isLoggedIn()) return showToast("Beğenmek için giriş yapın", "error");
  try {
    const result = await api.toggleLike(postId);
    const countEl = btn.querySelector(".like-count");
    const current = parseInt(countEl.textContent);
    countEl.textContent = result.liked ? current + 1 : current - 1;
    btn.classList.toggle("liked", result.liked);
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function toggleComments(postId) {
  const container = document.getElementById(`comments-${postId}`);
  if (container.style.display === "block") {
    container.style.display = "none";
    return;
  }
  container.style.display = "block";
  container.innerHTML = `<p style="color:var(--text-muted); padding:10px">Yükleniyor...</p>`;
  await loadComments(postId);
}

async function loadComments(postId) {
  const container = document.getElementById(`comments-${postId}`);
  try {
    const comments = await api.getCommentsByPost(postId);
    const user = auth.getUser();

    container.innerHTML = `
      <div class="comments-section">
        ${comments.length === 0
        ? `<p style="color:var(--text-muted); font-size:0.85rem">Henüz yorum yok.</p>`
        : comments.map(c => `
            <div class="comment-item">
              <div class="avatar" style="width:32px;height:32px;font-size:0.8rem">${getInitial(c.username)}</div>
              <div class="comment-body">
                <div class="comment-author">${c.username}</div>
                <div class="comment-text">${c.text}</div>
              </div>
              ${user && user.id === (c.userId ?? c.user_id) ? `
                <button class="action-btn btn-sm" onclick="handleDeleteComment(${c.id}, ${postId})">✕</button>` : ""}
            </div>`).join("")}
        ${user ? `
          <div class="comment-input-row">
            <input type="text" id="comment-input-${postId}" placeholder="Yorum yaz..." />
            <button class="btn btn-sm" onclick="handleAddComment(${postId})">Gönder</button>
          </div>` : `<p style="color:var(--text-muted); font-size:0.8rem">Yorum yapmak için giriş yapın</p>`}
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger)">${err.message}</p>`;
  }
}

async function handleAddComment(postId) {
  const input = document.getElementById(`comment-input-${postId}`);
  const text = input.value.trim();
  if (!text) return showToast("Yorum boş olamaz", "error");
  try {
    await api.createComment({ post_id: postId, text });
    input.value = "";
    await loadComments(postId);
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function handleDeleteComment(commentId, postId) {
  try {
    await api.deleteComment(commentId);
    await loadComments(postId);
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function handleDeletePost(postId) {
  if (!confirm("Bu gönderiyi silmek istediğinize emin misiniz?")) return;
  try {
    await api.deletePost(postId);
    document.getElementById(`post-${postId}`).remove();
    showToast("Gönderi silindi", "success");
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function openCreatePostModal() {
  if (!auth.isLoggedIn()) return navigate("login");

  openModal(`
    <div class="modal-title">📝 Yeni Gönderi</div>
    <div class="form-group">
      <label>Ne düşünüyorsunuz?</label>
      <textarea id="post-caption" placeholder="Yazmak istediğinizi girin..."></textarea>
    </div>
    <div class="form-group">
      <label>İçerik Bağla (opsiyonel)</label>
      <input type="text" id="content-search" placeholder="Film veya dizi ara..." oninput="handleContentSearch()" autocomplete="off" />
      <div id="content-search-results" style="margin-top:0.5rem"></div>
      <input type="hidden" id="post-content-id" value="" />
      <div id="selected-content" style="display:none; margin-top:0.5rem; padding:0.5rem; background:var(--surface); border:1px solid var(--accent); border-radius:6px; align-items:center; gap:0.5rem">
</div>
      </div>
    </div>
    <button class="btn" onclick="handleCreatePost()" style="width:100%">Paylaş</button>
  `);
}

let contentSearchTimeout;
async function handleContentSearch() {
  clearTimeout(contentSearchTimeout);
  contentSearchTimeout = setTimeout(async () => {
    const query = document.getElementById('content-search').value.trim();
    const resultsDiv = document.getElementById('content-search-results');

    if (!query) {
      resultsDiv.innerHTML = '';
      return;
    }

    try {
      const items = await api.getAllContent('', query);
      if (items.length === 0) {
        resultsDiv.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem">Sonuç bulunamadı.</p>`;
        return;
      }

      resultsDiv.innerHTML = `
        <div style="background:var(--surface2); border:1px solid var(--border); border-radius:6px; overflow:hidden; max-height:200px; overflow-y:auto">
          ${items.slice(0, 6).map(item => `
            <div onclick="selectContent(${item.id}, '${item.title.replace(/'/g, "\\'")}', '${item.coverUrl || ''}')"
              style="display:flex; align-items:center; gap:0.6rem; padding:0.6rem; cursor:pointer; border-bottom:1px solid var(--border); transition:background 0.15s"
              onmouseover="this.style.background='var(--surface)'" onmouseout="this.style.background='transparent'">
              ${item.coverUrl
          ? `<img src="${item.coverUrl}" style="width:28px;height:42px;object-fit:cover;border-radius:3px;flex-shrink:0" />`
          : `<span style="font-size:1.2rem">${getTypeEmoji(item.type)}</span>`
        }
              <div>
                <div style="font-size:0.875rem; font-weight:500">${item.title}</div>
                <div style="font-size:0.75rem; color:var(--text-muted)">${item.releaseYear ?? ''}</div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (e) {
      resultsDiv.innerHTML = '';
    }
  }, 300);
}

function selectContent(id, title, coverUrl) {
  document.getElementById('post-content-id').value = id;
  document.getElementById('content-search').value = '';
  document.getElementById('content-search-results').innerHTML = '';

  const selectedDiv = document.getElementById('selected-content');
  selectedDiv.style.display = 'flex';
  selectedDiv.innerHTML = `
    ${coverUrl ? `<img src="${coverUrl}" style="width:28px;height:42px;object-fit:cover;border-radius:3px;flex-shrink:0" />` : ''}
    <span style="font-size:0.875rem; font-weight:500; flex:1">${title}</span>
    <button onclick="clearSelectedContent()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1rem">✕</button>
  `;
}

function clearSelectedContent() {
  document.getElementById('post-content-id').value = '';
  const selectedDiv = document.getElementById('selected-content');
  selectedDiv.style.display = 'none';
  selectedDiv.innerHTML = '';
}

async function handleCreatePost() {
  const caption = document.getElementById("post-caption").value.trim();
  const contentId = document.getElementById("post-content-id").value;
  try {
    await api.createPost({ caption, contentId: contentId ? parseInt(contentId) : null }); closeModal();
    showToast("Gönderi oluşturuldu!", "success");
    await loadPostsFeed();
  } catch (err) {
    showToast(err.message, "error");
  }
}

function openEditPostModal(postId, caption) {
  openModal(`
    <div class="modal-title">✏️ Gönderiyi Düzenle</div>
    <div class="form-group">
      <label>Metin</label>
      <textarea id="edit-caption">${caption}</textarea>
    </div>
    <button class="btn" onclick="handleEditPost(${postId})" style="width:100%">Kaydet</button>
  `);
}

async function handleEditPost(postId) {
  const caption = document.getElementById("edit-caption").value.trim();
  try {
    await api.updatePost(postId, { caption });
    closeModal();
    showToast("Gönderi güncellendi!", "success");
    await loadPostsFeed();
  } catch (err) {
    showToast(err.message, "error");
  }
}

function escapeStr(str) {
  return str ? str.replace(/'/g, "\\'").replace(/"/g, '\\"') : "";
}