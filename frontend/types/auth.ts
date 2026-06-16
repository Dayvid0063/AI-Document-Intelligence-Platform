// Matches the UserResponse schema from the backend
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

// Matches the Token schema from the backend
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// Request payloads
export interface RegisterPayload {
  email: string;
  password: string;
  full_name?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// Auth state used across the app
export interface AuthState {
  user: User | null;
  access_token: string | null;
  isAuthenticated: boolean;
}
