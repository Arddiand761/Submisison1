import CONFIG from "../config";

const API_ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  GET_ALL_STORIES: `${CONFIG.BASE_URL}/stories`,
  ADD_NEW_STORY: `${CONFIG.BASE_URL}/stories`,
  GET_STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
};

async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem("authToken");

  // Don't set Content-Type for FormData, let the browser handle it
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const responseJson = await response.json();

  if (!response.ok) {
    throw new Error(responseJson.message || "Something went wrong");
  }

  return responseJson;
}

export async function register({ name, email, password }) {
  const response = await fetch(`${CONFIG.BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  const responseJson = await response.json();

  if (!response.ok) {
    throw new Error(responseJson.message || "Registration failed");
  }

  return responseJson;
}

export async function login({ email, password }) {
  const headers = {
    "Content-Type": "application/json",
  };

  const response = await fetch(API_ENDPOINTS.LOGIN, {
    method: "POST",
    headers,
    body: JSON.stringify({ email, password }),
  });

  const responseJson = await response.json();

  if (!response.ok) {
    throw new Error(responseJson.message || "Login failed");
  }

  // Save token if login successful
  if (responseJson.loginResult?.token) {
    localStorage.setItem("authToken", responseJson.loginResult.token);
  }

  return responseJson;
}

export async function getAllStories() {
  return fetchWithAuth(API_ENDPOINTS.GET_ALL_STORIES);
}

// export async function addNewStory({ photo, description }) {
//   const formData = new FormData();
//   formData.append('photo', photo);
//   formData.append('description', description);

//   return fetchWithAuth(API_ENDPOINTS.ADD_NEW_STORY, {
//     method: 'POST',
//     headers: {
//       // 'Content-Type' akan diatur otomatis oleh browser untuk FormData
//     },
//     body: formData,
//   });
// }

export async function createStory({ description, photo, lat, lon }) {
  const formData = new FormData();
  formData.append("description", description);
  if (photo) {
    // Jika photo hasil kamera (Blob), tambahkan nama file
    const fileName = photo.name || "photo.jpg";
    formData.append("photo", photo, fileName);
  }
  if (lat && lon) {
    formData.append("lat", lat.toString());
    formData.append("lon", lon.toString());
  }

  const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
    body: formData,
  });

  const responseJson = await response.json();
  if (!response.ok)
    throw new Error(responseJson.message || "Failed to create story");
  return responseJson;
}
export async function getStoryDetail(id) {
  const response = await fetchWithAuth(`${API_ENDPOINTS.GET_STORY_DETAIL(id)}`);
  return response;
}
export async function getVapidPublicKey() {
  const response = await fetch(`${CONFIG.BASE_URL}/push/vapid`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to get VAPID key");
  return data.vapidPublicKey;
}

// Add these functions to your api.js file

// export async function subscribeToPushNotifications(subscription) {
//   const token = localStorage.getItem("authToken");
//   if (!token) {
//     throw new Error("Token autentikasi tidak ditemukan");
//   }

//   // Pastikan subscriptionJson adalah hasil .toJSON()
//   const subscriptionJson = subscription.toJSON
//     ? subscription.toJSON()
//     : subscription;

//   try {
//     const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         endpoint: subscriptionJson.endpoint,
//         keys: JSON.stringify(subscriptionJson.keys),
//         p256dh: subscriptionJson.keys.p256dh,
//         auth: subscriptionJson.keys.auth,
//       }),
//     });

//     const responseJson = await response.json();

//     if (!response.ok) {
//       throw new Error(
//         responseJson.message || "Gagal berlangganan push notification"
//       );
//     }

//     return responseJson;
//   } catch (error) {
//     console.error("Error di subscribeToPushNotifications:", error);
//     throw error;
//   }
// }

// export async function unsubscribeFromPushNotifications(endpoint) {
//   const token = localStorage.getItem("authToken");
//   if (!token) {
//     throw new Error("Token autentikasi tidak ditemukan");
//   }

//   try {
//     // Menggunakan path yang benar sesuai dokumentasi API Dicoding
//     const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
//       method: "DELETE",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         endpoint: endpoint,
//       }),
//     });

//     const responseJson = await response.json();

//     if (!response.ok) {
//       throw new Error(
//         responseJson.message || "Gagal berhenti berlangganan push notification"
//       );
//     }

//     return responseJson;
//   } catch (error) {
//     console.error("Error di unsubscribeFromPushNotifications:", error);
//     throw error;
//   }
// }
