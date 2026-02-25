// src/api/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_BACKEND_URL || "https://usersearchapp.onrender.com",
});

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle 401 errors (session invalidated)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || "";

      // Clear auth data
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("session_id");

      // Show appropriate message based on error
      if (
        errorMessage.includes("Another user has logged in") ||
        errorMessage.includes("Session is no longer valid")
      ) {
        alert("Your session has been ended because another user logged in.");
      } else if (errorMessage.includes("Session has expired")) {
        alert("Your session has expired. Please log in again.");
      } else if (errorMessage.includes("already been used")) {
        alert("This access link has reached its maximum number of uses.");
      } else {
        // Generic 401 - just redirect silently
        console.log("Session expired, redirecting to login...");
      }

      // Redirect to login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;
