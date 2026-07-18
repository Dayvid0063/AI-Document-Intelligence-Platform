"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, Sparkles, LayoutDashboard, FileText, Search, MessageSquare, Settings, LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface TopbarProps {
  title: string;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Search", href: "/search", icon: Search },
  { label: "Chat", href: "/chat", icon: MessageSquare },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Topbar({ title }: TopbarProps) {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = (user?.full_name || user?.email || "U")
    .split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <header
        className="h-14 border-b sticky top-0 z-10 flex items-center justify-between px-4 md:px-6 backdrop-blur-sm bg-[var(--background)]/80"
        style={{ borderColor: "var(--border)" }}
      >
        {/* Mobile: logo + hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{ color: "var(--foreground-muted)" }}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--primary)]">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <span className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>DocIntel</span>
          </div>
        </div>

        {/* Desktop: page title */}
        <h1 className="hidden md:block text-sm font-semibold" style={{ color: "var(--foreground)" }}>
          {title}
        </h1>

        {/* Right: theme toggle + user avatar */}
        <div className="flex items-center gap-2">
          <ThemeToggle
            className="p-1.5 rounded-md hover:bg-[var(--surface-elevated)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
          />
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white cursor-pointer"
            style={{ background: "var(--primary)" }}
            title={user?.email}
          >
            {initials}
          </div>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 flex"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-56 h-full flex flex-col border-r shadow-xl"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-4 h-14 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--primary)]">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>DocIntel</span>
            </div>
            <nav className="flex-1 px-2 py-3 space-y-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200", isActive ? "text-white" : "hover:text-[var(--foreground)]")}
                    style={isActive ? { background: "var(--primary)" } : { color: "var(--foreground-muted)" }}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="px-2 py-3 border-t" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium"
                style={{ color: "var(--foreground-muted)" }}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          </div>
          {/* Backdrop */}
          <div className="flex-1 bg-black/50" />
        </div>
      )}
    </>
  );
}
