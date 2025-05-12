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
      // Hilangkan fokus dari skip link
      skipLink.blur();
      // Pastikan mainContent bisa di-focus
      mainContent.setAttribute("tabindex", "-1");
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: "smooth" });
    });

    // Agar skip-link hilang setelah focus pindah ke mainContent
    mainContent.addEventListener("focus", function () {
      skipLink.style.top = "-40px";
    });
    skipLink.addEventListener("blur", function () {
      skipLink.style.top = "-40px";
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
