import { getAllBookmarks, deleteBookmark } from "../../data/database";
import LoadingIndicator from "../../utils/loading";

class BookmarkPage {
  constructor() {
    // Constructor kosong untuk memastikan kelas dapat diinstansiasi dengan benar
  }

  async render() {
    return `
      <section class="container">
        <h1>Daftar Bookmark</h1>
        <div id="bookmark-list" class="bookmark-list"></div>
      </section>
    `;
  }

  async afterRender() {
    try {
      LoadingIndicator.show();
      const bookmarkListElement = document.getElementById("bookmark-list");
      const bookmarks = await getAllBookmarks();

      console.log("Retrieved bookmarks:", bookmarks); // Debugging

      if (!bookmarks || bookmarks.length === 0) {
        bookmarkListElement.innerHTML = `
          <div class="empty-state">
            <p>Belum ada cerita yang dibookmark.</p>
          </div>
        `;
        return;
      }

      bookmarkListElement.innerHTML = bookmarks
        .map(
          (story) => `
          <div class="bookmark-item">
            <img src="${story.photoUrl}" alt="${
            story.name
          }" class="bookmark-image" />
            <div class="bookmark-info">
              <h3>${story.name}</h3>
              <p>${story.description.substring(0, 80)}...</p>
              <div class="action-buttons">
                <a href="#/detail/${story.id}" class="view-btn">Lihat Detail</a>
                <button class="remove-bookmark-btn" data-id="${
                  story.id
                }">Hapus Bookmark</button>
              </div>
            </div>
          </div>
        `
        )
        .join("");

      // Event listener untuk hapus bookmark
      document.querySelectorAll(".remove-bookmark-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          e.preventDefault(); // Mencegah navigasi
          const id = e.target.getAttribute("data-id");
          await deleteBookmark(id);
          await this.afterRender(); // Refresh list dengan await
        });
      });
    } catch (error) {
      console.error("Error loading bookmarks:", error);
      document.getElementById("bookmark-list").innerHTML = `
        <div class="error-state">
          <p>Gagal memuat bookmark: ${error.message}</p>
        </div>
      `;
    } finally {
      LoadingIndicator.hide();
    }
  }
}

export default BookmarkPage;
