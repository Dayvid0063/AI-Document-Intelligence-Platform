"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, Eye, EyeOff, FileText, Brain, Search } from "lucide-react";
import { useAuthStore } from "@/lib/stores/useAuthStore";

const features = [
  { icon: FileText, text: "OCR text extraction from any document" },
  { icon: Brain, text: "AI classification & structured data extraction" },
  { icon: Search, text: "Semantic search & RAG chat interface" },
];

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(form);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--background)" }}>
      {/* Left — Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden" style={{ background: "var(--surface)" }}>
        <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: "var(--primary)" }} />

        <Link href="/" className="flex items-center gap-2.5 relative z-10 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] group-hover:shadow-glow transition-shadow duration-300">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>DocIntel</span>
        </Link>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
              Document intelligence, <span className="text-gradient">simplified</span>
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
              Upload any document and get structured data, AI insights, and natural language search — automatically.
            </p>
          </div>
          <ul className="space-y-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.text} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--primary-muted)" }}>
                    <Icon className="h-4 w-4" style={{ color: "var(--primary)" }} />
                  </div>
                  <span className="text-sm" style={{ color: "var(--foreground-muted)" }}>{f.text}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative z-10 rounded-xl border border-[var(--border-strong)] p-4" style={{ background: "var(--surface-elevated)" }}>
          <p className="text-sm italic leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
            &ldquo;A lightweight alternative to Azure AI Document Intelligence — built for users who need speed and simplicity.&rdquo;
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-6">
          <Link href="/" className="flex items-center gap-2 lg:hidden mb-8">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--primary)]">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>DocIntel</span>
          </Link>

          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>Welcome back</h1>
            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "var(--destructive-muted)", color: "var(--destructive)", border: "1px solid rgba(239,68,68,0.2)" }}>
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>Email address</label>
              <input
                id="email" name="email" type="email"
                placeholder="you@example.com" required
                value={form.email} onChange={handleChange}
                className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-shadow"
                style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", color: "var(--foreground)" }}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>Password</label>
              <div className="relative">
                <input
                  id="password" name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••" required
                  value={form.password} onChange={handleChange}
                  className="w-full rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-shadow"
                  style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", color: "var(--foreground)" }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--foreground-subtle)" }}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60"
              style={{ background: "var(--gradient-hero)" }}
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="text-center text-sm" style={{ color: "var(--foreground-muted)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium transition-colors" style={{ color: "var(--primary)" }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
