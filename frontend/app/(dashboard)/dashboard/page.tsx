"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";
import { User } from "@/types/auth";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authService.isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Fetch current user profile
    authService
      .getMe()
      .then(setUser)
      .catch(() => authService.logout())
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Welcome, {user?.full_name || user?.email}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI Document Intelligence Platform
            </p>
          </div>
          <Button variant="outline" onClick={() => authService.logout()}>
            Sign out
          </Button>
        </div>

        {/* Placeholder content */}
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground text-sm">
            Document upload and processing coming next.
          </p>
        </div>
      </div>
    </div>
  );
}
