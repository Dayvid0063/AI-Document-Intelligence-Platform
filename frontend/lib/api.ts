import axios from "axios";

/**
 * Central axios instance for all API calls.
 * baseURL reads from the environment variable so we never hardcode
 * the backend URL — in development it's http://localhost:8000,
 * in production it'll be your deployed backend URL.
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor — automatically attaches the JWT access token
 * to every outgoing request if one exists in localStorage.
 * This means we never have to manually add "Authorization: Bearer ..."
 * in each individual API call.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response interceptor — if any request returns 401 (token expired
 * or invalid), automatically clear stored tokens and redirect to login.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
