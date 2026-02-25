import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_BACKEND_URL ,
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

      // CHECK ROLE BEFORE CLEARING - This is critical!
      const storedUser = localStorage.getItem("auth_user");
      let isAdmin = false;

      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          isAdmin = user.role === "admin";
        } catch (e) {
          console.error("Error parsing stored user:", e);
        }
      }

      // NOW clear auth data
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
        alert("This access token has reached its maximum number of uses.");
      }

      // Smart redirect based on user type
      console.log("Redirecting user. isAdmin:", isAdmin);
      if (isAdmin) {
        window.location.href = "/login";
      } else {
        window.location.href = "/temporary-login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
