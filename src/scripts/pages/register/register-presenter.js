import { register } from '../../data/api';

const RegisterPresenter = {
  async register({ name, email, password }) {
    try {
      await register({ name, email, password });
      return { success: true };
    } catch (error) {
      console.error('Error in RegisterPresenter:', error);
      throw error;
    }
  },
};

export default RegisterPresenter;