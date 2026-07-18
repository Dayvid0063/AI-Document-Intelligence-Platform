"use client";

import { ReactNode, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ToastContainer from "@/components/ui/Toast";
import { useDocumentPolling } from "@/lib/hooks/useDocumentPolling";
import { useThemeStore } from "@/lib/stores/useThemeStore";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  // Polls for pending/processing documents across every dashboard route
  // (Dashboard, Documents, Chat, Settings) so status updates — like a
  // background embed finishing — are visible no matter which page is open.
  useDocumentPolling();

  // Reconcile the theme store with whatever the pre-hydration inline
  // script already applied to the DOM (system preference or localStorage).
  useEffect(() => {
    const applied = document.documentElement.getAttribute("data-theme") as "dark" | "light" | null;
    const stored = useThemeStore.getState().theme;
    if (applied && applied !== stored) {
      useThemeStore.getState().setTheme(applied);
    }
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Sidebar />
      <div className="md:pl-56">
        <Topbar title={title} />
        <main className="px-4 md:px-6 py-5">{children}</main>
      </div>
      <ToastContainer />
    </div>
  );
}
