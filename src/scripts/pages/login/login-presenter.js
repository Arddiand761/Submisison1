import { login } from '../../data/api';

const LoginPresenter = {
  async handleLogin({ email, password }) {
    try {
      // Panggil fungsi login dari api.js
      const result = await login({ email, password });

      // Simpan token ke localStorage
      localStorage.setItem('authToken', result.loginResult.token);

      // Redirect ke halaman utama
      window.location.hash = '#/';

      return { success: true, message: 'Login successful!' };
    } catch (error) {
      // Return error message
      return { success: false, message: error.message || 'Login failed. Please try again.' };
    }
  },
};

export default LoginPresenter;