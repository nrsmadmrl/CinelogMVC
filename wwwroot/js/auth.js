const auth = {
  getUser() {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  },

  getToken() {
    return localStorage.getItem("token");
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  save(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },

  clear() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  updateNavbar() {
    const user = this.getUser();
    const navAuth = document.getElementById("nav-auth");
    const navUser = document.getElementById("nav-user");
    const navUsername = document.getElementById("nav-username");

    if (user) {
      navAuth.style.display = "none";
      navUser.style.display = "flex";
      navUsername.textContent = `👤 ${user.username}`;
    } else {
      navAuth.style.display = "flex";
      navUser.style.display = "none";
    }
  }
};

function logout() {
  auth.clear();
  auth.updateNavbar();
  navigate("home");
  showToast("Logged out successfully", "success");
}

function showToast(message, type = "") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => { toast.className = "toast"; }, 3000);
}

function openModal(html) {
  document.getElementById("modal-content").innerHTML = html;
  document.getElementById("modal-overlay").style.display = "flex";
}

function closeModal() {
  document.getElementById("modal-overlay").style.display = "none";
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getTypeEmoji(type) {
  return type === "film" ? "🎬" : type === "series" ? "📺" : "🎵";
}

function getInitial(username) {
  return username ? username.charAt(0).toUpperCase() : "?";
}