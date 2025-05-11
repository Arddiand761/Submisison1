import NewPresenter from "./new-presenter";
import LoadingIndicator from "../../utils/loading";
import Map from "../../utils/map";

export default class NewPage {
  #map = null;
  #mediaStream = null;
  #marker = null;
  #photoBlob = null;
  #stopCameraStream = null;

  async render() {
    return `
      <section class="container">
        <h1>Create New Story</h1>
        <form id="new-story-form" class="new-story-form">
          <div class="form-group">
            <label for="title">Story Title</label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              required 
              class="form-input"
              placeholder="Enter your story title"
            >
          </div>

          <div class="form-group">
            <label for="description">Story Content</label>
            <textarea 
              id="description" 
              name="description" 
              required 
              class="form-textarea"
              placeholder="Write your story here..."
            ></textarea>
          </div>
          
<div class="form-group">
        <label>Photo (Optional)</label>
        <div class="photo-input-container">
          <div class="input-methods">
            <input 
              type="file" 
              id="photo-input" 
              accept="image/*" 
              class="form-input"
            >
            <button type="button" id="toggle-camera" class="button">
              <i class="fas fa-camera"></i> Use Camera
            </button>
          </div>

          <div id="camera-section" class="camera-section" style="display: none;">
            <video id="camera-preview" autoplay playsinline></video>
            <div class="camera-controls">
              <button type="button" id="take-photo" class="button">
                <i class="fas fa-camera"></i> Take Photo
              </button>
              <button type="button" id="retry-photo" class="button" style="display: none;">
                <i class="fas fa-redo"></i> Retry
              </button>
              <button type="button" id="close-camera" class="button danger">
                <i class="fas fa-times"></i> Close Camera
              </button>
            </div>
          </div>

          <div class="preview-section">
  <img id="photo-preview" class="photo-preview" style="display: none;" />
  <button type="button" id="confirm-photo" class="button" style="display: none; margin-top: 10px;">
    <i class="fas fa-check"></i> Gunakan Foto Ini
          </div>
        </div>
      </div>

          

          <div class="form-group">
            <label>Location (Required)</label>
            <div id="map" class="map-container"></div>
            <p id="selected-location" class="selected-location">Click on map to select location</p>
          </div>

          <button type="submit" class="submit-button">Create Story</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById("new-story-form");
    const startCameraButton = document.getElementById("start-camera");
    const selectedLocationElement =
      document.getElementById("selected-location");
    let selectedLocation = null;

    // Initialize map
    try {
      this.#map = await Map.build("#map", {
        zoom: 5,
        center: [-6.2, 106.816666], // Jakarta center
      });

      // Add click event directly using the map's on method
      this.#map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        selectedLocation = {
          lat: parseFloat(lat.toFixed(6)),
          lng: parseFloat(lng.toFixed(6)),
        };
        selectedLocationElement.textContent = `Selected: ${selectedLocation.lat}, ${selectedLocation.lng}`;

        // Clear existing markers
        this.#map.clearMarkers();

        // Add new marker
        this.#marker = this.#map.addMarker(
          selectedLocation.lat,
          selectedLocation.lng,
          "Story location"
        );
      });
    } catch (error) {
      console.error("Error initializing map:", error);
    }


    const toggleCameraBtn = document.getElementById("toggle-camera");
    const cameraSection = document.getElementById("camera-section");
    const cameraPreview = document.getElementById("camera-preview");
    const takePhotoBtn = document.getElementById("take-photo");
    const retryPhotoBtn = document.getElementById("retry-photo");
    const closeCameraBtn = document.getElementById("close-camera");
    const photoPreview = document.getElementById("photo-preview");
    const photoInput = document.getElementById("photo-input");
    const confirmPhotoBtn = document.getElementById('confirm-photo');


    // Helper function to stop camera stream
    const stopCameraStream = () => {
      if (this.#mediaStream) {
        this.#mediaStream.getTracks().forEach((track) => track.stop());
        this.#mediaStream = null;
      }
    };

    // Toggle camera
    toggleCameraBtn.addEventListener("click", async () => {
      try {
        this.#mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        cameraPreview.srcObject = this.#mediaStream;
        cameraSection.style.display = "block";
        toggleCameraBtn.style.display = "none";
        photoInput.value = ""; // Clear file input
      } catch (error) {
        console.error("Error accessing camera:", error);
        alert("Could not access camera. Please check permissions.");
      }
    });

    window.addEventListener("hashchange", () => {
      if (typeof this.#mediaStream !== "undefined" && this.#mediaStream) {
        this.#mediaStream.getTracks().forEach((track) => track.stop());
        this.#mediaStream = null;
      }
    });

    takePhotoBtn.addEventListener("click", () => {
      const canvas = document.createElement("canvas");
      canvas.width = cameraPreview.videoWidth;
      canvas.height = cameraPreview.videoHeight;
      canvas.getContext("2d").drawImage(cameraPreview, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) {
          alert("Failed to capture photo. Please try again.");
          return;
        }
        this.#photoBlob = blob;
        photoPreview.src = URL.createObjectURL(blob);
        photoPreview.style.display = "block";
        takePhotoBtn.style.display = "none";
        retryPhotoBtn.style.display = "inline-block";
        confirmPhotoBtn.style.display = "inline-block"; // Tampilkan tombol konfirmasi
      }, "image/jpeg");
    });

    // Saat klik "Gunakan Foto Ini"
    confirmPhotoBtn.addEventListener("click", () => {
      // Sembunyikan kamera dan tombol konfirmasi
      cameraSection.style.display = "none";
      toggleCameraBtn.style.display = "inline-block";
      confirmPhotoBtn.style.display = "none";
      // Kamera dimatikan agar resource tidak terpakai
      stopCameraStream();
    });

    // Saat retry, sembunyikan tombol konfirmasi
    retryPhotoBtn.addEventListener("click", () => {
      this.#photoBlob = null;
      photoPreview.style.display = "none";
      takePhotoBtn.style.display = "inline-block";
      retryPhotoBtn.style.display = "none";
      confirmPhotoBtn.style.display = "none";
    });

    // Saat close camera, sembunyikan tombol konfirmasi
    closeCameraBtn.addEventListener("click", () => {
      stopCameraStream();
      cameraSection.style.display = "none";
      toggleCameraBtn.style.display = "inline-block";
      confirmPhotoBtn.style.display = "none";
      if (!this.#photoBlob && !photoInput.files[0]) {
        photoPreview.style.display = "none";
      }
    });
    // Handle file input change
    photoInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        this.#photoBlob = null; // Clear any camera captured photo
        photoPreview.src = URL.createObjectURL(file);
        photoPreview.style.display = "block";
      }
    });

    // // Update form submission to include photo blob
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!selectedLocation) {
        alert("Please select a location on the map");
        return;
      }

      try {
        LoadingIndicator.show();

        const title = document.getElementById("title").value.trim();
        const description = document.getElementById("description").value.trim();
        const photo = this.#photoBlob || photoInput.files[0];

        if (!title || !description) {
          throw new Error("Title and description are required");
        }

        const result = await NewPresenter.createStory({
          description: `${title}\n\n${description}`,
          photo,
          lat: selectedLocation.lat,
          lon: selectedLocation.lng,
        });

        if (result.success) {
          this.#stopCameraStream?.();
          alert("Story created successfully!");
          window.location.hash = "#/";
        }
      } catch (error) {
        console.error("Error creating story:", error);
        alert(error.message || "Failed to create story");
      } finally {
        LoadingIndicator.hide();
      }
    });
  }
}
