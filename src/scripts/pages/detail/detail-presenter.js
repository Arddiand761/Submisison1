import { getStoryDetail } from '../../data/api';

const DetailPresenter = {
  async getStoryDetail(id) {
    try {
      const response = await getStoryDetail(id);
      console.log('Story detail response:', response); // untuk debugging
      return response;
    } catch (error) {
      console.error('Error in DetailPresenter:', error);
      throw error;
    }
  },
};

export default DetailPresenter;