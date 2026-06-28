"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Search, MessageSquare, Settings, Sparkles, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/useAuthStore";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Search", href: "/search", icon: Search },
  { label: "Chat", href: "/chat", icon: MessageSquare },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const initials = (user?.full_name || user?.email || "U")
    .split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <aside
      className="hidden md:flex md:w-56 md:flex-col fixed inset-y-0 left-0 border-r"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-14 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--primary)]">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>DocIntel</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200",
                isActive
                  ? "text-white"
                  : "hover:text-[var(--foreground)]"
              )}
              style={isActive ? {
                background: "var(--primary)",
                boxShadow: "0 0 12px rgba(99,102,241,0.3)",
              } : {
                color: "var(--foreground-muted)",
              }}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-2 py-3 border-t space-y-0.5" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg" style={{ background: "var(--surface-elevated)" }}>
          <div
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ background: "var(--primary)" }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate" style={{ color: "var(--foreground)" }}>
              {user?.full_name || "User"}
            </p>
            <p className="text-xs truncate" style={{ color: "var(--foreground-subtle)" }}>
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors duration-200 hover:text-[var(--destructive)]"
          style={{ color: "var(--foreground-muted)" }}
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
