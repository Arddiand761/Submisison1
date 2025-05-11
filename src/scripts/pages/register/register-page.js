import RegisterPresenter from './register-presenter';
import LoadingIndicator from '../../utils/loading';

export default class RegisterPage {
  async render() {
    return `
      <section class="container">
        <div class="auth-container">
          <h1>Register</h1>
          <form id="register-form" class="auth-form">
            <div class="form-group">
              <label for="name">Full Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required 
                class="form-input"
                placeholder="Enter your full name"
              >
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required 
                class="form-input"
                placeholder="Enter your email"
              >
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                required 
                class="form-input"
                placeholder="Enter your password"
                minlength="6"
              >
            </div>

            <button type="submit" class="auth-button">Register</button>
            <p class="auth-link">
              Already have an account? <a href="#/login">Login here</a>
            </p>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('register-form');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      try {
        LoadingIndicator.show();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!name || !email || !password) {
          throw new Error('All fields are required');
        }

        const result = await RegisterPresenter.register({
          name,
          email,
          password,
        });

        if (result.success) {
          alert('Registration successful! Please login.');
          window.location.hash = '#/login';
        }
      } catch (error) {
        console.error('Registration error:', error);
        alert(error.message || 'Registration failed. Please try again.');
      } finally {
        LoadingIndicator.hide();
      }
    });
  }
}