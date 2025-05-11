// CSS imports
import "../styles/styles.css";

import App from "./pages/app";
import "leaflet/dist/leaflet.css";

document.addEventListener("DOMContentLoaded", async () => {
  // Skip to Content
  const mainContent = document.querySelector("#main-content");
  const skipLink = document.querySelector(".skip-link");
  if (skipLink && mainContent) {
    skipLink.addEventListener("click", function (event) {
      event.preventDefault();
      skipLink.blur();
      mainContent.focus();
      mainContent.scrollIntoView();
    });
  }

  // Cek login
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.hash = "#/login";
  }

  // Inisialisasi App
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });
  await app.renderPage();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });

  // Logout (event delegation agar selalu berfungsi)
  document.body.addEventListener("click", (event) => {
    const logoutButton = event.target.closest("#logout-button");
    if (logoutButton) {
      event.preventDefault();
      const confirmLogout = confirm("Apakah Anda yakin ingin keluar?");
      if (confirmLogout) {
        localStorage.removeItem("authToken");
        window.location.hash = "#/login";
      }
    }
  });
});
