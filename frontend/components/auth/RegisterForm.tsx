"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, Eye, EyeOff, Check } from "lucide-react";
import { useAuthStore } from "@/lib/stores/useAuthStore";

const perks = [
  "Free forever — no credit card required",
  "Auto-pipeline: OCR → AI → embed on upload",
  "Semantic search across all your documents",
  "RAG chat grounded in your document content",
];

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
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
      await register(form);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Registration failed. Please try again."
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
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: "var(--cyan)" }} />

        <Link href="/" className="flex items-center gap-2.5 relative z-10 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] group-hover:shadow-glow transition-shadow duration-300">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>DocIntel</span>
        </Link>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
              Start extracting <span className="text-gradient-cyan">intelligence</span>
              <br />from your documents
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
              Join users and teams who use DocIntel to automate document processing with AI.
            </p>
          </div>
          <ul className="space-y-3">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--success-muted)" }}>
                  <Check className="h-3 w-3" style={{ color: "var(--success)" }} />
                </div>
                <span className="text-sm" style={{ color: "var(--foreground-muted)" }}>{perk}</span>
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "10+", label: "Doc types" },
              { value: "1536", label: "Vector dims" },
              { value: "~0s", label: "Setup time" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border p-3 text-center" style={{ borderColor: "var(--border-strong)", background: "var(--surface-elevated)" }}>
                <p className="text-lg font-bold text-gradient">{stat.value}</p>
                <p className="text-xs" style={{ color: "var(--foreground-subtle)" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* <div className="relative z-10 text-xs" style={{ color: "var(--foreground-subtle)" }}>
          Already have an account?{" "}
          <Link href="/login" className="hover:underline" style={{ color: "var(--primary)" }}>Sign in</Link>
        </div> */}
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
            <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>Create your account</h1>
            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>Start extracting intelligence from your documents</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "var(--destructive-muted)", color: "var(--destructive)", border: "1px solid rgba(239,68,68,0.2)" }}>
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="full_name" className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>Full name</label>
              <input
                id="full_name" name="full_name" type="text"
                placeholder="David Orji"
                value={form.full_name} onChange={handleChange}
                className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-shadow"
                style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", color: "var(--foreground)" }}
              />
            </div>

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
                  placeholder="Min. 8 characters" required
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
              {loading ? "Creating account..." : "Create account"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>

            <p className="text-xs text-center" style={{ color: "var(--foreground-subtle)" }}>
              By creating an account you agree to our{" "}
              <Link href="#" style={{ color: "var(--foreground-muted)" }}>Terms</Link>{" "}
              and{" "}
              <Link href="#" style={{ color: "var(--foreground-muted)" }}>Privacy Policy</Link>
            </p>
          </form>

          <p className="text-center text-sm" style={{ color: "var(--foreground-muted)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-medium transition-colors" style={{ color: "var(--primary)" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
