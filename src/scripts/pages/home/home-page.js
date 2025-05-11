import HomePresenter from './home-presenter';
import LoadingIndicator from '../../utils/loading';

export default class HomePage {
  async render() {
    return `
      <section class="container" view-transition-name="page-container">
        <h1 view-transition-name="page-title">Home Page</h1>
        <div id="story-list" class="card-container" view-transition-name="story-list">
          <!-- Stories akan dimuat di sini -->
        </div>
      </section>
    `;
  }

  async afterRender() {
    const storyListElement = document.getElementById('story-list');

    try {
      LoadingIndicator.show();
      const stories = await HomePresenter.getStories();

      if (stories?.listStory?.length > 0) {
        storyListElement.innerHTML = '';

        stories.listStory.forEach((story) => {
          const storyElement = document.createElement('div');
          storyElement.classList.add('card');
          storyElement.setAttribute('view-transition-name', `story-${story.id}`);
          storyElement.innerHTML = `
            <img src="${story.photoUrl}" alt="${story.name}" class="card-image" view-transition-name="story-image-${story.id}" />
            <div class="card-content" view-transition-name="story-content-${story.id}">
              <h2 class="card-title">${story.name}</h2>
              <p class="card-description">${story.description}</p>
              ${
                story.lat && story.lon
                  ? `<p class="card-location">📍 Lokasi: ${story.lat}, ${story.lon}</p>`
                  : `<p class="card-location">📍 Lokasi tidak tersedia</p>`
              }
              <button class="detail-button" data-id="${story.id}">Detail</button>
            </div>
          `;
          storyListElement.appendChild(storyElement);
        });

        const detailButtons = document.querySelectorAll('.detail-button');
        detailButtons.forEach((button) => {
          button.addEventListener('click', async (event) => {
            const storyId = event.target.dataset.id;
            
            // Use View Transitions API if supported
            if (document.startViewTransition) {
              const transition = document.startViewTransition(() => {
                window.location.hash = `#/detail/${storyId}`;
              });
              
              try {
                await transition.finished;
              } catch (error) {
                console.error('Transition failed:', error);
              }
            } else {
              // Fallback for browsers that don't support View Transitions
              window.location.hash = `#/detail/${storyId}`;
            }
          });
        });
      } else {
        storyListElement.innerHTML = `<p class="error-message">Tidak ada cerita yang tersedia.</p>`;
      }
    } catch (error) {
      storyListElement.innerHTML = `<p class="error-message">Gagal memuat cerita: ${error.message}</p>`;
    } finally {
      LoadingIndicator.hide();
    }
  }
}