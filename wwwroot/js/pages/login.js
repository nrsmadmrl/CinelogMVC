function renderLogin() {
  document.getElementById("app").innerHTML = `
    <div class="auth-container">
      <div class="auth-title">Welcome back 👋</div>
      <p class="auth-subtitle">Login to your Cinelog account</p>
      <div class="card">
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="login-email" placeholder="your@email.com" />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="login-password" placeholder="••••••••" />
        </div>
        <button type="submit" onclick="handleLogin()" style="width:100%">Login</button>
        <p style="text-align:center; margin-top:16px; color:var(--text-muted); font-size:0.875rem">
          Don't have an account? 
          <span onclick="navigate('register')" style="color:var(--primary); cursor:pointer">Register</span>
        </p>
      </div>
    </div>
  `;
}

async function handleLogin() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  if (!email || !password) return showToast("Please fill in all fields", "error");

  try {
    const result = await api.login({ email, password });
    auth.save(result.token, result.user);
    auth.updateNavbar();
    showToast(`Welcome back, ${result.user.username}!`, "success");
    navigate("home");
  } catch (err) {
    showToast(err.message, "error");
  }
}