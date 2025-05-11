import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import { transitionHelper } from "../utils";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #isTrasitioning = false;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  #setupNavigationList() {
    // Add logic for setting up the navigation list here
    console.log("Navigation list setup completed.");
  }

  async renderPage() {
    const url = getActiveRoute();
    let page = routes[url];

    // Dynamic route matching (existing code remains the same)
    if (!page) {
      for (const routeKey in routes) {
        if (routeKey.includes(":")) {
          const pattern = new RegExp(
            "^" + routeKey.replace(/:[^/]+/g, "[^/]+") + "$"
          );
          if (url.match(pattern)) {
            page = routes[routeKey];
            break;
          }
        }
      }
    }

    if (!page) {
      window.location.hash = "#/";
      return;
    }

    // Gunakan transitionHelper agar aman di semua browser
    const transition = transitionHelper({
      updateDOM: async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
      },
    });

    transition.ready
      .then(() => {
        // Animation ready
      })
      .catch((error) => {
        // Tidak perlu log error di sini, fallback sudah aman
      });

    transition.finished
      .then(() => {
        scrollTo({ top: 0, behavior: "instant" });
        this.#setupNavigationList();
      })
      .catch((error) => {
        // Tidak perlu log error di sini, fallback sudah aman
      });
  }
}

export default App;
