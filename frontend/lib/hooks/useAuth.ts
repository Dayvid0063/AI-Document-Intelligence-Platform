"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";
import { User } from "@/types/auth";

/**
 * Shared hook for protected pages.
 * Redirects to /login if not authenticated, otherwise fetches and
 * returns the current user profile.
 */
export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/login");
      return;
    }

    authService
      .getMe()
      .then(setUser)
      .catch(() => authService.logout())
      .finally(() => setLoading(false));
  }, [router]);

  return { user, loading };
}
