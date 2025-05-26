// CSS imports
import "../styles/styles.css";

import App from "./pages/app";
import "leaflet/dist/leaflet.css";
import { registerSW } from "virtual:pwa-register";
import CONFIG from "./config";

// VAPID Public Key
const VAPID_PUBLIC_KEY =
  "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("Ada pembaruan tersedia. Muat ulang sekarang?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("Aplikasi siap digunakan offline!");
  },
});

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array(rawData.split('').map((char) => char.charCodeAt(0)));
  // for (let i = 0; i < rawData.length; ++i) {
  //   outputArray[i] = rawData.charCodeAt(i);
  // }
  // return outputArray;
}

function requestNotificationPermission() {
  return new Promise((resolve, reject) => {
    if (!("Notification" in window)) {
      console.warn("Browser ini tidak mendukung notifikasi desktop.");
      return reject("Notifikasi tidak didukung");
    }

    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("Izin notifikasi diberikan.");
        resolve("granted");
      } else if (permission === "denied") {
        console.warn("Izin notifikasi ditolak.");
        reject("denied");
      } else {
        console.log("Izin notifikasi belum diputuskan (default).");
        reject("default");
      }
    });
  });
}

export async function subscribeToPushNotifications(subscription) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("Token autentikasi tidak ditemukan");
  }

  // Pastikan subscriptionJson adalah hasil .toJSON()
  const subscriptionJson = subscription.toJSON
    ? subscription.toJSON()
    : subscription;

  try {
    const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: subscriptionJson.endpoint,
        keys: subscriptionJson.keys, // Corrected line
        p256dh: subscriptionJson.keys.p256dh,
        auth: subscriptionJson.keys.auth,
      }),
    });

    const responseJson = await response.json();

    if (!response.ok) {
      throw new Error(
        responseJson.message || "Gagal berlangganan push notification"
      );
    }

    return responseJson;
  } catch (error) {
    console.error("Error di subscribeToPushNotifications:", error);
    throw error;
  }
}

export async function unsubscribeFromPushNotifications(endpoint) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("Token autentikasi tidak ditemukan");
  }

  try {
    // Menggunakan path yang benar sesuai dokumentasi API Dicoding
    const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: endpoint,
      }),
    });

    const responseJson = await response.json();

    if (!response.ok) {
      throw new Error(
        responseJson.message || "Gagal berhenti berlangganan push notification"
      );
    }

    return responseJson;
  } catch (error) {
    console.error("Error di unsubscribeFromPushNotifications:", error);
    throw error;
  }
}

async function subscribePush(registration) {
  // Menerima swRegistration sebagai argumen
  if (!("PushManager" in window)) {
    console.warn("Push Manager tidak didukung oleh browser ini.");
    throw new Error("Push Manager not supported");
  }

  let currentSubscription = await registration.pushManager.getSubscription();

  if (currentSubscription) {
    console.log(
      "Pengguna sudah berlangganan (dari subscribePush):",
      currentSubscription.endpoint
    );

    try {
      await subscribeToPushNotifications(currentSubscription); // Pastikan fungsi ini tersedia
    } catch (error) {
      console.error(
        "Gagal mengirim ulang langganan yang sudah ada ke server:",
        error
      );
      // Tidak perlu throw error di sini agar tidak menghentikan alur jika hanya re-sync
    }
    return currentSubscription;
  }

  // Jika belum ada langganan, buat yang baru
  try {
    currentSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true, // Wajib: menandakan semua push akan terlihat oleh pengguna
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY), // Pastikan VAPID_PUBLIC_KEY dan urlBase64ToUint8Array tersedia
    });
    console.log(
      "Berhasil berlangganan push (dari subscribePush):",
      currentSubscription.endpoint
    );

    // Kirim objek langganan baru ke server
    await subscribeToPushNotifications(currentSubscription); // Pastikan fungsi ini tersedia
    console.log("Langganan baru berhasil dikirim ke server.");
    return currentSubscription;
  } catch (error) {
    console.error("Gagal berlangganan push (dari subscribePush):", error);
    if (Notification.permission === "denied") {
      console.warn(
        "Izin notifikasi ditolak oleh pengguna. Tidak bisa berlangganan."
      );
      // Pertimbangkan untuk memberi tahu pengguna cara mengaktifkan izin secara manual.
    }
    // Lemparkan error agar bisa ditangani oleh pemanggil jika diperlukan
    throw error;
  }
}

// main.js
async function unsubscribePush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn(
      "Push notifications tidak didukung atau service worker tidak tersedia."
    );
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpointToDelete = subscription.endpoint; // Simpan endpoint sebelum unsubscribe
      const unsubscribedSuccessfully = await subscription.unsubscribe();

      if (unsubscribedSuccessfully) {
        console.log(
          "Berhasil berhenti berlangganan dari browser push manager."
        );
        // Beritahu server untuk menghapus langganan ini
        await unsubscribeFromPushNotifications({ endpoint: endpointToDelete });
      } else {
        console.warn(
          "Gagal berhenti berlangganan dari browser (atau sudah berhenti)."
        );
        // Mungkin tetap perlu memberitahu server jika ada kemungkinan desinkronisasi
        // await unsubscribeFromPushNotifications({ endpoint: endpointToDelete });
      }
    } else {
      console.log("Tidak ada langganan push aktif untuk dihentikan.");
    }
  } catch (err) {
    console.error("Error saat proses berhenti berlangganan push:", err);
  }
}

async function initializePushFeature() {
  const registration = await navigator.serviceWorker.ready;

  // Minta izin notifikasi jika belum pernah diberikan/ditolak
  if (Notification.permission === "default") {
    try {
      await requestNotificationPermission();
    } catch (permissionResult) {
      console.warn(
        "Izin notifikasi tidak diberikan atau belum diputuskan sepenuhnya:",
        permissionResult
      );
      return;
    }
  }

  // Jika sudah granted, lanjut subscribe
  if (Notification.permission === "granted") {
    try {
      await subscribePush(registration);
    } catch (subError) {
      console.warn(
        "Tidak dapat berlangganan push notification:",
        subError.message
      );
    }
  } else {
    console.warn(
      "Izin notifikasi tidak diberikan. Tidak dapat melanjutkan langganan push."
    );
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
    mainContent.addEventListener("blur", function () {
      mainContent.removeAttribute("tabindex");
    });
    skipLink.addEventListener("blur", function () {
      // skipLink.style.top = "-40px"; // Reconsider this based on desired persistent behavior
    });
  }

  // Cek login & subscribe push
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.hash = "#/login";
  } else {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        await initializePushFeature();
      } catch (err) {
        console.warn("Gagal inisialisasi push notification:", err.message);
      }
    } else {
      console.warn("Push notifications are not supported in this browser.");
    }
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
        unsubscribePush().finally(() => {
          localStorage.removeItem("authToken");
          window.location.hash = "#/login";
        });
      }
    }
  });
});
