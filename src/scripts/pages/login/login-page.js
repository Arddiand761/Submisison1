import LoginPresenter from "./login-presenter";
import LoadingIndicator from "../../utils/loading";

export default class LoginPage {
  async render() {
    return `
      <section class="login-container">
        <h1>Login</h1>
        <form id="login-form" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" placeholder="Enter your email" required />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Enter your password" required />
          </div>
          <button type="submit" class="login-button">Login</button>
        </form>
        <p id="login-error" class="error-message" style="color: red; display: none;">Invalid email or password.</p>
        <p class="register-link">
          Don't have an account? <button id="register-button" class="register-button">Register</button>
        </p>
      </section>
    `;
  }

  async afterRender() {
    const loginForm = document.getElementById("login-form");
    const errorMessage = document.getElementById("login-error");
    const registerButton = document.getElementById("register-button");

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        LoadingIndicator.show();

        const result = await LoginPresenter.handleLogin({ email, password });

        if (result.success) {
          alert(result.message);

          // Transisi halus sebelum redirect
          const mainContent = document.getElementById("main-content");
          if (mainContent) {
            mainContent.classList.remove("show");
            mainContent.classList.add("page-transition");
            setTimeout(() => {
              mainContent.classList.add("show");
              window.location.hash = "#/";
            }, 10);
          } else {
            window.location.hash = "#/";
          }
          return; // pastikan tidak lanjut ke bawah
        } else {
          errorMessage.style.display = "block";
          errorMessage.textContent = result.message;
        }
      } catch (error) {
        errorMessage.style.display = "block";
        errorMessage.textContent = "An error occurred. Please try again.";
      } finally {
        LoadingIndicator.hide();
      }
    });

    registerButton.addEventListener("click", () => {
      window.location.hash = "#/register";
    });
  }
}
