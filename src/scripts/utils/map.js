import L from 'leaflet';

export default class Map {
  #zoom = 13;
  #map = null;
  #markers = null;

  static async build(selector, options = {}) {
    try {
      // Clear existing map instance if any
      const container = document.querySelector(selector);
      if (container._leaflet_id) {
        container._leaflet_id = null;
        container.innerHTML = '';
      }

      return new Map(selector, options);
    } catch (error) {
      console.error('Error building map:', error);
      throw error;
    }
  }

  constructor(selector, options = {}) {
    const container = document.querySelector(selector);
    if (!container) throw new Error('Map container not found');

    this.#zoom = options.zoom ?? this.#zoom;
    this.#markers = L.layerGroup();

    // Initialize map with default center if not provided
    const defaultCenter = [-6.2, 106.816666]; // Jakarta
    this.#map = L.map(container, {
      center: options.center || defaultCenter,
      zoom: this.#zoom,
    });

    // Add OSM layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.#map);

    // Add markers layer
    this.#markers.addTo(this.#map);
  }

  addMarker(lat, lon, popupContent) {
    try {
      const marker = L.marker([lat, lon]);
      if (popupContent) {
        marker.bindPopup(popupContent);
      }
      marker.addTo(this.#markers);
      return marker;
    } catch (error) {
      console.error('Error adding marker:', error);
      throw error;
    }
  }

  removeMarker(marker) {
    if (marker) {
      this.#markers.removeLayer(marker);
    }
  }

  clearMarkers() {
    this.#markers.clearLayers();
  }

  on(eventName, callback) {
    this.#map.on(eventName, callback);
  }

  setView(lat, lon, zoom = null) {
    this.#map.setView([lat, lon], zoom || this.#zoom);
  }
}