"use client";

import { useAuthStore } from "@/lib/stores/useAuthStore";

/**
 * Thin wrapper around useAuthStore for backward compatibility.
 * Components that previously used useAuth() still work unchanged.
 */
export function useAuth() {
  const { user, loading, isAuthenticated } = useAuthStore();
  return { user, loading, isAuthenticated };
}
