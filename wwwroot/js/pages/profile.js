async function renderProfile() {
  const user = auth.getUser();
  const app = document.getElementById("app");
  const avatar = user?.avatarUrl || user?.avatar_url;

  if (!user) {
    app.innerHTML = `
      <div class="empty-state" style="margin-top:4rem">
        <div class="empty-state-icon">🔒</div>
        <p>Profili görmek için giriş yapmalısınız.</p>
        <br>
        <button class="btn" onclick="navigate('login')">Giriş Yap</button>
      </div>`;
    return;
  }



  app.innerHTML = `
    <div style="max-width:680px; margin:0 auto">
      <div class="card" style="display:flex; gap:1.2rem; align-items:center; margin-bottom:1.5rem; padding:1.5rem">
        ${avatar
      ? `<img src="${avatar}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;flex-shrink:0" />`
      : `<div class="avatar" style="width:64px;height:64px;font-size:1.5rem;flex-shrink:0">${getInitial(user.username)}</div>`
    }
        <div style="flex:1">
          <div style="font-family:'Playfair Display',serif; font-size:1.4rem; font-weight:700">${user.username}</div>
          <div style="color:var(--text-muted); font-size:0.85rem; margin-top:0.2rem">${user.email}</div>
          ${user.bio ? `<div style="color:var(--text-muted); font-size:0.875rem; margin-top:0.5rem">${user.bio}</div>` : ''}
        </div>
        <button class="btn btn-outline btn-sm" onclick="openEditProfileModal()">Düzenle</button>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.5rem">
        <div class="card" style="text-align:center; cursor:pointer" onclick="showProfileTab('reviews')">
          <div style="font-family:'Playfair Display',serif; font-size:1.8rem; font-weight:700" id="review-count">—</div>
          <div style="color:var(--text-muted); font-size:0.85rem">İnceleme</div>
        </div>
        <div class="card" style="text-align:center; cursor:pointer" onclick="showProfileTab('lists')">
          <div style="font-family:'Playfair Display',serif; font-size:1.8rem; font-weight:700" id="list-count">—</div>
          <div style="color:var(--text-muted); font-size:0.85rem">Liste</div>
        </div>
      </div>

      <div style="display:flex; gap:0.5rem; margin-bottom:1rem">
        <button class="filter-btn active" id="tab-reviews" onclick="showProfileTab('reviews')">⭐ İncelemeler</button>
        <button class="filter-btn" id="tab-lists" onclick="showProfileTab('lists')">📋 Listelerim</button>
        <button class="filter-btn" id="tab-posts" onclick="showProfileTab('posts')">📝 Gönderiler</button>
      </div>

      <div id="profile-tab-content">
        <p style="color:var(--text-muted)">Yükleniyor...</p>
      </div>
    </div>
  `;

  await Promise.all([
    showProfileTab('reviews'),
    api.getListsByUser(user.id).then(lists => {
      const el = document.getElementById('list-count');
      if (el) el.textContent = lists.length;
    })
  ]);
}

async function showProfileTab(tab) {
  const user = auth.getUser();
  document.querySelectorAll('[id^="tab-"]').forEach(b => b.classList.remove('active'));
  const tabBtn = document.getElementById(`tab-${tab}`);
  if (tabBtn) tabBtn.classList.add('active');

  const content = document.getElementById('profile-tab-content');
  content.innerHTML = `<p style="color:var(--text-muted)">Yükleniyor...</p>`;

  try {
    if (tab === 'reviews') {
      const reviews = await api.getReviewsByUser(user.id);
      document.getElementById('review-count').textContent = reviews.length;

      if (reviews.length === 0) {
        content.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⭐</div><p>Henüz inceleme yazılmadı.</p></div>`;
        return;
      }

      content.innerHTML = reviews.map(r => `
  <div class="card" style="margin-bottom:0.75rem">
    <div style="display:flex; gap:0.75rem; align-items:flex-start">
      ${r.contentCoverUrl
          ? `<img src="${r.contentCoverUrl}" style="width:40px;height:60px;object-fit:cover;border-radius:4px;flex-shrink:0" />`
          : `<div style="width:40px;height:60px;background:var(--bg-input);border-radius:4px;display:flex;align-items:center;justify-content:center">🎬</div>`
        }
      <div style="flex:1">
        <div style="display:flex; justify-content:space-between; align-items:flex-start">
          <div>
            <div style="font-weight:600; margin-bottom:0.25rem">${r.contentTitle ?? 'İçerik'}</div>
            <div style="color:var(--text-muted); font-size:0.82rem">${timeAgo(r.createdAt ?? r.created_at)}</div>
          </div>
          <div style="display:flex; align-items:center; gap:0.75rem">
            <span style="color:#f5c518; font-weight:700">⭐ ${r.rating}/10</span>
            <button class="btn btn-sm" style="background:var(--danger)" onclick="handleDeleteReview(${r.id})">Sil</button>
          </div>
        </div>
        ${r.opinion ? `<p style="color:var(--text-muted); font-size:0.875rem; margin-top:0.5rem">${r.opinion}</p>` : ''}
      </div>
    </div>
  </div>
`).join('');

    } else if (tab === 'lists') {
      const lists = await api.getListsByUser(user.id);
      document.getElementById('list-count').textContent = lists.length;

      content.innerHTML = `
        <div style="margin-bottom:1rem">
          <button class="btn" onclick="openCreateListModal()">+ Yeni Liste</button>
        </div>
        ${lists.length === 0
          ? `<div class="empty-state"><div class="empty-state-icon">📋</div><p>Henüz liste oluşturulmadı.</p></div>`
          : lists.map(l => `
            <div class="card" style="margin-bottom:0.75rem; cursor:pointer" onclick="openListDetail(${l.id})">
              <div style="display:flex; justify-content:space-between; align-items:center">
                <div>
                  <div style="font-weight:600">${l.name}</div>
                  <div style="color:var(--text-muted); font-size:0.8rem; margin-top:0.2rem">${l.itemCount ?? l.item_count ?? 0} içerik</div>
                </div>
                <button class="btn btn-sm" style="background:var(--danger)" onclick="event.stopPropagation(); handleDeleteList(${l.id})">Sil</button>
              </div>
            </div>`).join('')}
      `;

    } else if (tab === 'posts') {
      const posts = await api.getPostsByUser(user.id);

      if (posts.length === 0) {
        content.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📝</div><p>Henüz gönderi yok.</p></div>`;
        return;
      }

      content.innerHTML = posts.map(post => renderPostCard(post)).join('');
    }
  } catch (err) {
    content.innerHTML = `<p style="color:var(--danger)">${err.message}</p>`;
  }
}

async function handleDeleteReview(id) {
  if (!confirm('Bu incelemeyi silmek istediğinize emin misiniz?')) return;
  try {
    await api.deleteReview(id);
    showToast('İnceleme silindi', 'success');
    await showProfileTab('reviews');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function openListDetail(listId) {
  try {
    const list = await api.getListWithItems(listId);
    const items = list.items ?? [];

    openModal(`
      <div class="modal-title">📋 ${list.name}</div>

      <div class="form-group">
        <input type="text" id="list-content-search" placeholder="İçerik ara ve ekle..." oninput="handleListContentSearch(${listId})" autocomplete="off" />
        <div id="list-content-results" style="margin-top:0.5rem"></div>
      </div>

      <div id="list-items-container">
        ${renderListItems(items, listId)}
      </div>
    `);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderListItems(items, listId) {
  if (items.length === 0) {
    return `<p style="color:var(--text-muted); font-size:0.875rem; text-align:center; padding:1rem">Henüz içerik eklenmedi.</p>`;
  }
  return items.map(item => `
    <div class="card" style="display:flex; gap:0.75rem; align-items:center; margin-bottom:0.6rem">
      ${(item.coverUrl || item.cover_url)
      ? `<img src="${item.coverUrl ?? item.cover_url}" style="width:40px;height:60px;object-fit:cover;border-radius:4px;flex-shrink:0" />`
      : `<div style="width:40px;height:60px;background:var(--bg-input);border-radius:4px;display:flex;align-items:center;justify-content:center">🎬</div>`}
      <div style="flex:1">
        <div style="font-weight:600; font-size:0.875rem">${item.title}</div>
        <div style="color:var(--text-muted); font-size:0.78rem">${item.releaseYear ?? item.release_year ?? ''}</div>
      </div>
      <button class="btn btn-sm" style="background:var(--danger)" onclick="handleRemoveFromListInModal(${listId}, ${item.contentId ?? item.content_id ?? item.id})">✕</button>
    </div>
  `).join('');
}

let listSearchTimeout;
async function handleListContentSearch(listId) {
  clearTimeout(listSearchTimeout);
  listSearchTimeout = setTimeout(async () => {
    const query = document.getElementById('list-content-search').value.trim();
    const resultsDiv = document.getElementById('list-content-results');

    if (!query) { resultsDiv.innerHTML = ''; return; }

    try {
      const items = await api.getAllContent('', query);
      if (items.length === 0) {
        resultsDiv.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem">Sonuç bulunamadı.</p>`;
        return;
      }

      resultsDiv.innerHTML = `
        <div style="background:var(--surface2); border:1px solid var(--border); border-radius:6px; overflow:hidden; max-height:200px; overflow-y:auto">
          ${items.slice(0, 8).map(item => `
            <div onclick="handleAddToListInModal(${listId}, ${item.id}, '${item.title.replace(/'/g, "\\'")}')"
              style="display:flex; align-items:center; gap:0.6rem; padding:0.6rem; cursor:pointer; border-bottom:1px solid var(--border)"
              onmouseover="this.style.background='var(--surface)'" onmouseout="this.style.background='transparent'">
              ${item.coverUrl
          ? `<img src="${item.coverUrl}" style="width:28px;height:42px;object-fit:cover;border-radius:3px;flex-shrink:0" />`
          : `<span style="font-size:1.2rem">${getTypeEmoji(item.type)}</span>`
        }
              <div>
                <div style="font-size:0.875rem; font-weight:500">${item.title}</div>
                <div style="font-size:0.75rem; color:var(--text-muted)">${item.releaseYear ?? ''}</div>
              </div>
              <span style="margin-left:auto; color:var(--accent); font-size:0.8rem">+ Ekle</span>
            </div>
          `).join('')}
        </div>
      `;
    } catch (e) {
      resultsDiv.innerHTML = '';
    }
  }, 300);
}

async function handleAddToListInModal(listId, contentId, title) {
  try {
    await api.addToList(listId, contentId);
    showToast(`"${title}" listeye eklendi!`, 'success');
    document.getElementById('list-content-search').value = '';
    document.getElementById('list-content-results').innerHTML = '';

    // Listeyi yenile
    const list = await api.getListWithItems(listId);
    document.getElementById('list-items-container').innerHTML = renderListItems(list.items ?? [], listId);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleRemoveFromListInModal(listId, contentId) {
  try {
    await api.removeFromList(listId, contentId);
    showToast('Listeden çıkarıldı', 'success');
    const list = await api.getListWithItems(listId);
    document.getElementById('list-items-container').innerHTML = renderListItems(list.items ?? [], listId);
    await showProfileTab('lists');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleRemoveFromList(listId, contentId) {
  try {
    await api.removeFromList(listId, contentId);
    showToast('Listeden çıkarıldı', 'success');
    closeModal();
    await showProfileTab('lists');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openCreateListModal() {
  openModal(`
    <div class="modal-title">📋 Yeni Liste</div>
    <div class="form-group">
      <label>Liste Adı</label>
      <input type="text" id="list-name" placeholder="örn. En Sevdiklerim" />
    </div>
    <button class="btn" style="width:100%" onclick="handleCreateList()">Oluştur</button>
  `);
}

async function handleCreateList() {
  const name = document.getElementById('list-name').value.trim();
  if (!name) return showToast('Liste adı gerekli', 'error');
  try {
    const list = await api.createList({ name, type: 'custom' });
    closeModal();
    showToast('Liste oluşturuldu!', 'success');
    await showProfileTab('lists');
    openListDetail(list.id);
  } catch (err) {
    showToast(err.message, 'error');
  }
}


async function handleDeleteList(id) {
  if (!confirm('Bu listeyi silmek istediğinize emin misiniz?')) return;
  try {
    await api.deleteList(id);
    showToast('Liste silindi', 'success');
    await showProfileTab('lists');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openEditProfileModal() {
  const user = auth.getUser();
  openModal(`
    <div class="modal-title">✏️ Profili Düzenle</div>
    <div class="form-group">
      <label>Bio</label>
      <textarea id="edit-bio" placeholder="Kendinizden bahsedin...">${user.bio ?? ''}</textarea>
    </div>
    <div class="form-group">
      <label>Avatar URL</label>
      <input type="text" id="edit-avatar" placeholder="https://..." value="${user.avatarUrl ?? user.avatar_url ?? ''}" />
    </div>
    <button class="btn" style="width:100%" onclick="handleEditProfile()">Kaydet</button>
  `);
}

async function handleEditProfile() {
  const user = auth.getUser();
  const bio = document.getElementById('edit-bio').value.trim();
  const avatarUrl = document.getElementById('edit-avatar').value.trim();
  try {
    const updated = await api.updateUser(user.id, { bio, avatarUrl });
    auth.save(auth.getToken(), { ...user, bio, avatarUrl, avatar_url: avatarUrl });
    closeModal();
    showToast('Profil güncellendi!', 'success');
    await renderProfile();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}