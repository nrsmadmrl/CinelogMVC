function renderRegister() {
  document.getElementById("app").innerHTML = `
    <div class="auth-container">
      <div class="auth-title">Join Cinelog 🎬</div>
      <p class="auth-subtitle">Create your account and start sharing</p>
      <div class="card">
        <div class="form-group">
          <label>Username</label>
          <input type="text" id="reg-username" placeholder="yourname" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="reg-email" placeholder="your@email.com" />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="reg-password" placeholder="At least 6 characters" />
        </div>
        <button type="submit" onclick="handleRegister()" style="width:100%">Create Account</button>
        <p style="text-align:center; margin-top:16px; color:var(--text-muted); font-size:0.875rem">
          Already have an account? 
          <span onclick="navigate('login')" style="color:var(--primary); cursor:pointer">Login</span>
        </p>
      </div>
    </div>
  `;
}

async function handleRegister() {
  const username = document.getElementById("reg-username").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value.trim();

  if (!username || !email || !password) return showToast("Please fill in all fields", "error");

  try {
    await api.register({ username, email, password });
    showToast("Account created! Please login.", "success");
    navigate("login");
  } catch (err) {
    showToast(err.message, "error");
  }
}