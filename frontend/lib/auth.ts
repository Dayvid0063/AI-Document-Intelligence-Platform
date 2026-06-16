import api from "./api";
import { AuthTokens, LoginPayload, RegisterPayload, User } from "@/types/auth";

/**
 * Auth service — wraps all auth-related API calls.
 * Components call these functions instead of calling axios directly,
 * keeping API logic out of UI components.
 */

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthTokens> {
    const { data } = await api.post<AuthTokens>("/api/v1/auth/register", payload);
    saveTokens(data);
    return data;
  },

  async login(payload: LoginPayload): Promise<AuthTokens> {
    const { data } = await api.post<AuthTokens>("/api/v1/auth/login", payload);
    saveTokens(data);
    return data;
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<User>("/api/v1/auth/me");
    return data;
  },

  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
  },

  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("access_token");
  },
};

// Helper — saves tokens to localStorage after login/register
function saveTokens(tokens: AuthTokens) {
  localStorage.setItem("access_token", tokens.access_token);
  localStorage.setItem("refresh_token", tokens.refresh_token);
}
