import DetailPresenter from "./detail-presenter";
import LoadingIndicator from "../../utils/loading";
import Map from "../../utils/map";
import { parseActivePathname } from "../../routes/url-parser";
import { saveBookmark, getBookmark, deleteBookmark } from "../../data/database";

export default class DetailPage {
  async render() {
    return `
      <section class="container">
        <h1>Detail Story</h1>
        <div id="story-detail" class="story-detail">
          <!-- Detail cerita akan dimuat di sini -->
        </div>
        <div id="map" class="map-container"></div>
        <div id="notification" class="notification"></div>
      </section>
    `;
  }

  // Display notification function
  showNotification(message, isSuccess = true) {
    // Use browser's built-in notification system if available and permitted
    if ("Notification" in window) {
      // If permission isn't granted yet, request it
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }

      // If permission is granted, show notification
      if (Notification.permission === "granted") {
        new Notification("Bookmark Status", {
          body: message,
          icon: "/favicon.ico", // Replace with your app's icon
        });
        return; // Exit if we showed a browser notification
      }
    }

    // Fallback to custom notification UI if browser notifications aren't available
    const notificationElement = document.getElementById("notification");
    notificationElement.textContent = message;
    notificationElement.className = `notification ${
      isSuccess ? "success" : "error"
    }`;
    notificationElement.style.display = "block";

    // Hide notification after 3 seconds
    setTimeout(() => {
      notificationElement.style.display = "none";
    }, 3000);
  }

  async afterRender() {
    const storyDetailElement = document.getElementById("story-detail");
    const mapElement = document.getElementById("map");

    try {
      LoadingIndicator.show();

      // Get story ID from URL using url-parser
      const url = parseActivePathname();
      const id = url.id;

      // Get story detail from API
      const response = await DetailPresenter.getStoryDetail(id);

      // Check if story data exists in response
      if (!response || !response.story) {
        throw new Error("Story not found");
      }

      const story = response.story;

      // Cek apakah sudah dibookmark
      const isBookmarked = await getBookmark(story.id);

      // Render story details + tombol bookmark
      storyDetailElement.innerHTML = `
        <img src="${story.photoUrl}" alt="${story.name}" class="detail-image" />
        <div class="detail-content">
          <h2>${story.name}</h2>
          <p class="description">${story.description}</p>
          <hr>
          ${
            story.lat && story.lon
              ? `<p class="detail-location">📍 Lokasi: ${story.lat}, ${story.lon}</p>`
              : `<p class="detail-location">📍 Lokasi tidak tersedia</p>`
          }
          <div style="margin-top:18px;">
            <button id="bookmark-btn" class="bookmark-btn">
              ${isBookmarked ? "★ Hapus Bookmark" : "☆ Bookmark"}
            </button>
          </div>
        </div>
      `;

      // Event listener tombol bookmark
      document
        .getElementById("bookmark-btn")
        .addEventListener("click", async (e) => {
          e.preventDefault();
          try {
            if (await getBookmark(story.id)) {
              await deleteBookmark(story.id);
              document.getElementById("bookmark-btn").textContent =
                "☆ Bookmark";
              this.showNotification("Cerita berhasil dihapus dari bookmark");
            } else {
              await saveBookmark(story);
              document.getElementById("bookmark-btn").textContent =
                "★ Hapus Bookmark";
              this.showNotification("Cerita berhasil ditambahkan ke bookmark");
            }
          } catch (error) {
            console.error("Error managing bookmark:", error);
            this.showNotification(
              "Gagal mengelola bookmark: " + error.message,
              false
            );
          }
        });

      // Initialize map if location is available
      if (story.lat && story.lon) {
        const map = await Map.build("#map", {
          center: [story.lat, story.lon],
          zoom: 13,
        });

        // Add marker with popup
        map.addMarker(
          story.lat,
          story.lon,
          `
          <div class="map-popup">
            <h3>${story.name}</h3>
            <img src="${story.photoUrl}" alt="${
            story.name
          }" class="popup-image">
            <p>${story.description.substring(0, 100)}...</p>
          </div>
        `
        );
      } else {
        mapElement.innerHTML = `<p class="error-message">Peta tidak tersedia untuk cerita ini.</p>`;
      }
    } catch (error) {
      console.error("Error loading story:", error);
      storyDetailElement.innerHTML = `<p class="error-message">Gagal memuat detail cerita: ${error.message}</p>`;
    } finally {
      LoadingIndicator.hide();
    }
  }
}
