import { getAllStories } from '../../data/api';

const HomePresenter = {
  async getStories() {
    try {
      const stories = await getAllStories();
      console.log('Stories fetched:', stories); // Tambahkan log untuk memeriksa respons
      return stories;
    } catch (error) {
      console.error('Error fetching stories:', error);
      throw error;
    }
  },
};

export default HomePresenter;