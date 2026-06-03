async function renderExplore() {
  const user = auth.getUser();
  const isAdmin = user && (user.is_admin || user.isAdmin);

  document.getElementById("app").innerHTML = `
    <div class="page-title">🔍 Keşfet</div>
    <p class="page-subtitle">Film ve dizileri keşfet</p>

    <div class="search-bar">
      <input type="text" id="search-input" placeholder="Başlık ara..." oninput="handleSearch()" />
    </div>

    <div class="filter-row">
      <button class="filter-btn active" onclick="filterContent('', this)">Tümü</button>
      <button class="filter-btn" onclick="filterContent('film', this)">🎬 Film</button>
      <button class="filter-btn" onclick="filterContent('series', this)">📺 Dizi</button>
    </div>

    ${isAdmin ? `
      <div style="margin-bottom:20px; display:flex; gap:10px">
        <button class="btn" onclick="openTMDBSearchModal()">🎬 TMDB'den İçe Aktar</button>
        <button class="btn btn-outline" onclick="openAddContentModal()">+ Manuel Ekle</button>
      </div>` : ""}

    <div id="content-grid" class="grid">
      <p style="color:var(--text-muted)">Yükleniyor...</p>
    </div>
  `;

  await loadContent();
}

let currentType = "";
let currentSearch = "";

function getCoverUrl(item) {
  return item.coverUrl || item.cover_url || "";
}

function getTypeLabel(type) {
  if (type === 0 || type === 'film') return 'film';
  if (type === 1 || type === 'series') return 'series';
  if (type === 2 || type === 'Documentary') return 'documentary';
  return type;
}

function getReleaseYear(item) {
  return item.releaseYear || item.release_year || "";
}

async function loadContent() {
  
  try {
    const items = await api.getAllContent(currentType, currentSearch);
    const grid = document.getElementById("content-grid");

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state-icon">🎬</div>
          <p>İçerik bulunamadı.</p>
        </div>`;
      return;
    }

    grid.innerHTML = items.map(item => {
      const coverUrl = getCoverUrl(item);
      const releaseYear = getReleaseYear(item);
      return `
        <div class="content-card" onclick="openContentDetail(${item.id})">
          ${coverUrl
            ? `<img src="${coverUrl}" alt="${item.title}" style="width:100%;aspect-ratio:2/3;object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>`
            : ""}
          <div class="content-card-cover cover-fallback" style="${coverUrl ? "display:none" : "display:flex"}">
            ${getTypeEmoji(item.type)}
          </div>
          <div class="content-card-body">
            <div class="content-card-title">${item.title}</div>
            <div class="content-card-meta">
              <span class="badge badge-${getTypeLabel(item.type)}">${getTypeLabel(item.type)}</span>
              ${releaseYear ? `· ${releaseYear}` : ""}
              ${item.genre ? `· ${item.genre}` : ""}
            </div>
          </div>
        </div>
      `;
    }).join("");
  } catch (err) {
    document.getElementById("content-grid").innerHTML = `<p style="color:var(--danger)">${err.message}</p>`;
  }
}

function filterContent(type, btn) {
  currentType = type;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  loadContent();
}

let searchTimeout;
function handleSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentSearch = document.getElementById("search-input").value.trim();
    loadContent();
  }, 400);
}

function openTMDBSearchModal() {
  openModal(`
    <div class="modal-title">🎬 TMDB'den İçe Aktar</div>
    <div class="form-group">
      <label>Tür</label>
      <select id="tmdb-type">
        <option value="all">Tümü</option>
        <option value="film">🎬 Sadece Filmler</option>
        <option value="series">📺 Sadece Diziler</option>
      </select>
    </div>
    <div class="form-group">
      <div style="display:flex; gap:10px">
        <input type="text" id="tmdb-query" placeholder="örn. Inception..." style="flex:1" />
        <button class="btn" onclick="handleTMDBSearch()">Ara</button>
      </div>
    </div>
    <div id="tmdb-results"></div>
  `);
}

async function handleTMDBSearch() {
  const query = document.getElementById("tmdb-query").value.trim();
  const type = document.getElementById("tmdb-type").value;
  if (!query) return showToast("Arama terimi girin", "error");

  const resultsDiv = document.getElementById("tmdb-results");
  resultsDiv.innerHTML = `<p style="color:var(--text-muted)">Aranıyor...</p>`;

  try {
    const endpoint = `/tmdb/search?q=${encodeURIComponent(query)}&type=${type}`;
    const results = await api.get(endpoint);

    if (results.length === 0) {
      resultsDiv.innerHTML = `<p style="color:var(--text-muted)">Sonuç bulunamadı.</p>`;
      return;
    }

    resultsDiv.innerHTML = results.map(r => {
      const coverUrl = getCoverUrl(r);
      const releaseYear = getReleaseYear(r);
      return `
        <div class="card" style="display:flex; gap:12px; align-items:center; margin-bottom:10px">
          ${coverUrl
            ? `<img src="${coverUrl}" style="width:50px;height:75px;object-fit:cover;border-radius:6px" />`
            : `<div style="width:50px;height:75px;background:var(--bg-input);border-radius:6px;display:flex;align-items:center;justify-content:center">${getTypeEmoji(r.type)}</div>`}
          <div style="flex:1">
            <div style="font-weight:600">${r.title}</div>
            <div style="color:var(--text-muted); font-size:0.8rem">
              <span class="badge badge-${r.type}">${r.type}</span>
              ${releaseYear ? `· ${releaseYear}` : ""}
            </div>
            ${r.description ? `<div style="color:var(--text-muted); font-size:0.78rem; margin-top:4px; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical">${r.description}</div>` : ""}
          </div>
          <button class="btn btn-sm" onclick='handleImportTMDB(${JSON.stringify(r).replace(/'/g, "&#39;")})'>İçe Aktar</button>
        </div>
      `;
    }).join("");
  } catch (err) {
    resultsDiv.innerHTML = `<p style="color:var(--danger)">${err.message}</p>`;
  }
}

async function handleImportTMDB(item) {
  try {
    await api.post("/tmdb/import", item, true);
    closeModal();
    showToast(`"${item.title}" başarıyla eklendi!`, "success");
    await loadContent();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function openContentDetail(id) {
  try {
    const [content, avgData, reviews] = await Promise.all([
      api.getContentById(id),
      api.getAverageRating(id),
      api.getReviewsByContent(id)
    ]);

    const user = auth.getUser();
    const isAdmin = user && (user.is_admin || user.isAdmin);
    const userReview = reviews.find(r => user && (r.user_id === user.id || r.userId === user.id));
    const coverUrl = getCoverUrl(content);
    const releaseYear = getReleaseYear(content);

    openModal(`
      <div style="display:flex; gap:16px; margin-bottom:16px">
        ${coverUrl
          ? `<img src="${coverUrl}" style="width:100px;height:150px;object-fit:cover;border-radius:8px;flex-shrink:0" />`
          : `<div style="width:100px;height:150px;background:var(--bg-input);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:2.5rem;flex-shrink:0">${getTypeEmoji(content.type)}</div>`}
        <div>
          <div class="modal-title" style="margin-bottom:8px">${content.title}</div>
          <span class="badge badge-${content.type}">${content.type}</span>
          ${content.genre ? `<span style="color:var(--text-muted); margin-left:8px">${content.genre}</span>` : ""}
          ${releaseYear ? `<span style="color:var(--text-muted); margin-left:8px">${releaseYear}</span>` : ""}
          <div style="margin-top:10px; background:var(--bg-input); border-radius:8px; padding:10px; display:inline-block">
            ⭐ <strong>${avgData.average}/10</strong>
            <span style="color:var(--text-muted); margin-left:8px">${avgData.total} yorum</span>
          </div>
          ${isAdmin ? `
            <div style="margin-top:10px">
              <button class="btn btn-sm" style="background:var(--danger)" onclick="handleDeleteContent(${content.id})">Sil</button>
            </div>` : ""}
        </div>
      </div>

      ${content.description ? `<p style="color:var(--text-muted); margin-bottom:16px; line-height:1.6; font-size:0.9rem">${content.description}</p>` : ""}

      ${user && !userReview ? `
        <div style="margin-bottom:20px; border-top:1px solid var(--border); padding-top:16px">
          <div style="font-weight:600; margin-bottom:10px">İnceleme Yaz</div>
          <div class="form-group">
            <label>Puan (1-10)</label>
            <input type="number" id="review-rating" min="1" max="10" placeholder="8" />
          </div>
          <div class="form-group">
            <label>Görüş</label>
            <textarea id="review-opinion" placeholder="Ne düşündünüz?"></textarea>
          </div>
          <button class="btn" onclick="handleCreateReview(${id})">Gönder</button>
        </div>` : ""}

      ${user ? `
        <button class="btn btn-outline btn-sm" onclick="openAddToListModal(${id})" style="margin-bottom:16px; width:100%">
          + Listeye Ekle
        </button>` : ""}

      <div style="font-weight:600; margin-bottom:10px; border-top:1px solid var(--border); padding-top:16px">
        İncelemeler (${reviews.length})
      </div>
      ${reviews.length === 0
        ? `<p style="color:var(--text-muted); font-size:0.875rem">Henüz inceleme yok.</p>`
        : reviews.map(r => `
          <div class="card" style="margin-bottom:8px">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px">
              <strong style="font-size:0.875rem">${r.username}</strong>
              <span style="color:#f5c518">⭐ ${r.rating}/10</span>
            </div>
            ${r.opinion ? `<p style="color:var(--text-muted); font-size:0.875rem">${r.opinion}</p>` : ""}
          </div>`).join("")}
    `);
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function handleDeleteContent(id) {
  if (!confirm("Bu içeriği silmek istediğinize emin misiniz?")) return;
  try {
    await api.deleteContent(id);
    closeModal();
    showToast("İçerik silindi", "success");
    await loadContent();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function handleCreateReview(contentId) {
  const rating = parseInt(document.getElementById("review-rating").value);
  const opinion = document.getElementById("review-opinion").value.trim();
  if (!rating) return showToast("Puan gerekli", "error");
  try {
    await api.createReview({ contentId: contentId, rating, opinion });
    closeModal();
    showToast("İnceleme gönderildi!", "success");
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function openAddToListModal(contentId) {
  const user = auth.getUser();
  try {
    const lists = await api.getListsByUser(user.id);
    openModal(`
      <div class="modal-title">📋 Listeye Ekle</div>
      ${lists.length === 0
        ? `<p style="color:var(--text-muted)">Henüz listeniz yok. Profilden oluşturabilirsiniz.</p>`
        : lists.map(l => `
          <div class="card" style="cursor:pointer; margin-bottom:8px" onclick="handleAddToList(${l.id}, ${contentId})">
            <strong>${l.name}</strong>
            <span style="color:var(--text-muted); font-size:0.8rem; margin-left:8px">${l.type}</span>
          </div>`).join("")}
    `);
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function handleAddToList(listId, contentId) {
  try {
    await api.addToList(listId, contentId);
    closeModal();
    showToast("Listeye eklendi!", "success");
  } catch (err) {
    showToast(err.message, "error");
  }
}

function openAddContentModal() {
  openModal(`
    <div class="modal-title">➕ Manuel İçerik Ekle</div>
    <div class="form-group">
      <label>Başlık *</label>
      <input type="text" id="c-title" placeholder="örn. Inception" />
    </div>
    <div class="form-group">
      <label>Tür *</label>
      <select id="c-type">
        <option value="film">🎬 Film</option>
        <option value="series">📺 Dizi</option>
      </select>
    </div>
    <div class="form-group">
      <label>Kategori</label>
      <input type="text" id="c-genre" placeholder="örn. Bilim Kurgu" />
    </div>
    <div class="form-group">
      <label>Yayın Yılı</label>
      <input type="number" id="c-year" placeholder="örn. 2010" />
    </div>
    <div class="form-group">
      <label>Açıklama</label>
      <textarea id="c-desc" placeholder="Kısa açıklama..."></textarea>
    </div>
    <div class="form-group">
      <label>Kapak Resmi URL</label>
      <input type="text" id="c-cover" placeholder="https://..." />
    </div>
    <button onclick="handleAddContent()" style="width:100%" class="btn">Ekle</button>
  `);
}

async function handleAddContent() {
  const title = document.getElementById("c-title").value.trim();
  const type = document.getElementById("c-type").value;
  const genre = document.getElementById("c-genre").value.trim();
  const release_year = parseInt(document.getElementById("c-year").value);
  const description = document.getElementById("c-desc").value.trim();
  const cover_url = document.getElementById("c-cover").value.trim();

  if (!title) return showToast("Başlık gerekli", "error");

  try {
    await api.createContent({ title, type, genre, release_year, description, cover_url });
    closeModal();
    showToast("İçerik eklendi!", "success");
    await loadContent();
  } catch (err) {
    showToast(err.message, "error");
  }
}