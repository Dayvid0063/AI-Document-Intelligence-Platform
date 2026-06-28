import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, LoginPayload, RegisterPayload, AuthTokens } from "@/types/auth";
import api from "@/lib/api";

interface AuthState {
  user: User | null;
  access_token: string | null;
  refresh_token: string | null;
  isAuthenticated: boolean;
  loading: boolean;

  // Actions
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  setTokens: (tokens: AuthTokens) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      access_token: null,
      refresh_token: null,
      isAuthenticated: false,
      loading: false,

      setTokens: (tokens: AuthTokens) => {
        set({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          isAuthenticated: true,
        });
      },

      login: async (payload: LoginPayload) => {
        const { data } = await api.post<AuthTokens>("/api/v1/auth/login", payload);
        get().setTokens(data);
        // Fetch profile after login
        await get().fetchProfile();
      },

      register: async (payload: RegisterPayload) => {
        const { data } = await api.post<AuthTokens>("/api/v1/auth/register", payload);
        get().setTokens(data);
        await get().fetchProfile();
      },

      fetchProfile: async () => {
        try {
          set({ loading: true });
          const { data } = await api.get<User>("/api/v1/auth/me");
          set({ user: data, isAuthenticated: true });
        } catch {
          get().logout();
        } finally {
          set({ loading: false });
        }
      },

      logout: () => {
        set({
          user: null,
          access_token: null,
          refresh_token: null,
          isAuthenticated: false,
          loading: false,
        });
        // Redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      },
    }),
    {
      name: "docintel-auth",
      // Only persist tokens — user profile is fetched fresh on load
      partialize: (state) => ({
        access_token: state.access_token,
        refresh_token: state.refresh_token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
