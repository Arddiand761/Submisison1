const CONFIG = {
  BASE_URL: "https://story-api.dicoding.dev/v1",
  // Anda bisa menambahkan endpoint spesifik di sini jika diperlukan
  ENDPOINTS: {
    REGISTER: "/register",
    LOGIN: "/login",
    STORIES: "/stories",
    ADD_STORY: "/stories",
    PUSH_SUBSCRIBE: "/notifications/subscribe",
    PUSH_UNSUBSCRIBE: "/notifications/subscribe", // Uses same endpoint with DELETE method
  },
};

export default CONFIG;
