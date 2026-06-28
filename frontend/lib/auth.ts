/**
 * Auth service — thin API wrapper.
 * State management is handled by useAuthStore.
 * Components should use useAuthStore actions (login, register, logout)
 * rather than calling these directly.
 */
import api from "./api";
import { AuthTokens, User } from "@/types/auth";

export const authService = {
  async login(payload: { email: string; password: string }): Promise<AuthTokens> {
    const { data } = await api.post<AuthTokens>("/api/v1/auth/login", payload);
    return data;
  },

  async register(payload: {
    email: string;
    password: string;
    full_name?: string;
  }): Promise<AuthTokens> {
    const { data } = await api.post<AuthTokens>("/api/v1/auth/register", payload);
    return data;
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<User>("/api/v1/auth/me");
    return data;
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("docintel-auth");
      window.location.href = "/login";
    }
  },

  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    try {
      const raw = localStorage.getItem("docintel-auth");
      const parsed = raw ? JSON.parse(raw) : null;
      return !!parsed?.state?.access_token;
    } catch {
      return false;
    }
  },
};
