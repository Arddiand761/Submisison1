import DetailPresenter from './detail-presenter';
import LoadingIndicator from '../../utils/loading';
import Map from '../../utils/map';
import { parseActivePathname } from '../../routes/url-parser';

export default class DetailPage {
  async render() {
    return `
      <section class="container">
        <h1>Detail Story</h1>
        <div id="story-detail" class="story-detail">
          <!-- Detail cerita akan dimuat di sini -->
        </div>
        <div id="map" class="map-container"></div>
      </section>
    `;
  }

  async afterRender() {
    const storyDetailElement = document.getElementById('story-detail');
    const mapElement = document.getElementById('map');

    try {
      LoadingIndicator.show();

      // Get story ID from URL using url-parser
      const url = parseActivePathname();
      const id = url.id;

      // Get story detail from API
      const response = await DetailPresenter.getStoryDetail(id);
      
      // Check if story data exists in response
      if (!response || !response.story) {
        throw new Error('Story not found');
      }

      const story = response.story;

      // Render story details
      storyDetailElement.innerHTML = `
        <img src="${story.photoUrl}" alt="${story.name}" class="detail-image" />
        <div class="detail-content">
          <h2>${story.name}</h2>
          <p class="description">${story.description}</p>
          ${
            story.lat && story.lon
              ? `<p class="detail-location">📍 Lokasi: ${story.lat}, ${story.lon}</p>`
              : `<p class="detail-location">📍 Lokasi tidak tersedia</p>`
          }
        </div>
      `;

      // Initialize map if location is available
      if (story.lat && story.lon) {
        const map = await Map.build('#map', {
          center: [story.lat, story.lon],
          zoom: 13
        });

        // Add marker with popup
        map.addMarker(story.lat, story.lon, `
          <div class="map-popup">
            <h3>${story.name}</h3>
            <img src="${story.photoUrl}" alt="${story.name}" class="popup-image">
            <p>${story.description.substring(0, 100)}...</p>
          </div>
        `);
      } else {
        mapElement.innerHTML = `<p class="error-message">Peta tidak tersedia untuk cerita ini.</p>`;
      }
    } catch (error) {
      console.error('Error loading story:', error);
      storyDetailElement.innerHTML = `<p class="error-message">Gagal memuat detail cerita: ${error.message}</p>`;
    } finally {
      LoadingIndicator.hide();
    }
  }
}