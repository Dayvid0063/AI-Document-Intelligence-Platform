import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

/**
 * Request interceptor — attaches JWT from Zustand persisted store.
 * Reads directly from localStorage (where zustand/persist stores it)
 * to avoid circular imports with useAuthStore.
 */
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("docintel-auth");
      const parsed = raw ? JSON.parse(raw) : null;
      const token = parsed?.state?.access_token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore parse errors
    }
  }
  return config;
});

/**
 * Response interceptor — on 401, clear auth store and redirect to login.
 * Uses dynamic import to avoid circular dependency with useAuthStore.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // Clear persisted auth state
        localStorage.removeItem("docintel-auth");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
