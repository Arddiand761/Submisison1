import { createStory } from '../../data/api';

const NewPresenter = {
  async createStory(storyData) {
    try {
      const response = await createStory(storyData);
      return { success: true, data: response };
    } catch (error) {
      console.error('Error in NewPresenter:', error);
      throw error;
    }
  },
};

export default NewPresenter;