"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useDocumentStore } from "@/lib/stores/useDocumentStore";
import { Loader2 } from "lucide-react";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, fetchProfile } = useAuthStore();
  const { fetchDocuments, reset } = useDocumentStore();
  const [hydrated, setHydrated] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setHydrated(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (initialized.current) return;
    initialized.current = true;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!user) fetchProfile();
    fetchDocuments();
  }, [hydrated, isAuthenticated, user, fetchProfile, fetchDocuments, router]);

  useEffect(() => {
    return () => {
      if (!useAuthStore.getState().isAuthenticated) {
        reset();
      }
    };
  }, [reset]);

  if (!hydrated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--background)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--primary)" }} />
          <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
            Loading your workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
