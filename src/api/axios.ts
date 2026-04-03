// src/api/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  //timeout: 300000,
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || "";

      // Get redirect path based on last login type
      const lastLoginType = localStorage.getItem("last_login_type");
      const redirectPath =
        lastLoginType === "admin" ? "/login" : "/temporary-login";

      console.log(
        "🔄 401 error - Last login type:",
        lastLoginType,
        "Redirecting to:",
        redirectPath,
      );

      // Clear auth data
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("session_id");
      localStorage.removeItem("auth_timestamp");
      // Keep last_login_type for smart redirect

      // Show message
      if (
        errorMessage.includes("Another user has logged in") ||
        errorMessage.includes("Session is no longer valid")
      ) {
        alert("Your session has been ended because another user logged in.");
      } else if (errorMessage.includes("Session has expired")) {
        alert("Your session has expired. Please log in again.");
      } else if (errorMessage.includes("already been used")) {
        alert("This access token has reached its maximum number of uses.");
      }

      // Smart redirect
      window.location.href = redirectPath;
    }

    return Promise.reject(error);
  },
);

export default api;
