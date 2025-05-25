// CSS imports
import "../styles/styles.css";

import App from "./pages/app";
import "leaflet/dist/leaflet.css";

const VAPID_PUBLIC_KEY =
  "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

async function subscribePush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push messaging is not supported");
    return;
  }

  try {
    const reg = await navigator.serviceWorker.ready;

    if (!reg.pushManager) {
      console.warn('Push Manager not available on service worker registration.');
      return;
    }

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    console.log("Push notification subscribed successfully:", subscription);

  } catch (err) {
    console.error("Push notification subscription error:", err);
  }
}


document.addEventListener("DOMContentLoaded", async () => {
  // Skip to Content
  const mainContent = document.querySelector("#main-content");
  const skipLink = document.querySelector(".skip-link");
  if (skipLink && mainContent) {
    skipLink.addEventListener("click", function (event) {
      event.preventDefault();
      skipLink.blur();
      mainContent.setAttribute("tabindex", "-1");
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: "smooth" });
    });

    mainContent.addEventListener("focus", function () {
      skipLink.style.top = "-40px";
    });
    skipLink.addEventListener("blur", function () {
      skipLink.style.top = "-40px";
    });
  }

  // Cek login & subscribe push
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.hash = "#/login";
  } else {
    subscribePush();
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
