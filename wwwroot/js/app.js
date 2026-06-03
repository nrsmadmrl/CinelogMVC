function navigate(page) {
  window._currentPage = page;
  auth.updateNavbar();

  switch (page) {
    case "home":     renderHome();     break;
    case "explore":  renderExplore();  break;
    case "profile":  renderProfile();  break;
    case "login":    renderLogin();    break;
    case "register": renderRegister(); break;
    default:         renderHome();
  }
}

// Start the app
document.addEventListener("DOMContentLoaded", () => {
  auth.updateNavbar();
  navigate("home");
});