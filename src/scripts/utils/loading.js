const LoadingIndicator = {
  show() {
    const loadingElement = document.createElement('div');
    loadingElement.id = 'loading-indicator';
    loadingElement.innerHTML = `
      <div class="loading-overlay">
        <div class="spinner"></div>
      </div>
    `;
    document.body.appendChild(loadingElement);
  },

  hide() {
    const loadingElement = document.getElementById('loading-indicator');
    if (loadingElement) {
      loadingElement.remove();
    }
  },
};

export default LoadingIndicator;