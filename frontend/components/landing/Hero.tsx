"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, FileText, Brain, Search } from "lucide-react";

const floatingCards = [
  {
    icon: FileText,
    label: "Invoice_Q2.pdf",
    sub: "Classified · 0.3s",
    color: "var(--primary)",
    delay: "0s",
    position: "top-6 -left-2 md:-left-10",
  },
  {
    icon: Brain,
    label: "AI Extracted",
    sub: "12 structured fields",
    color: "var(--secondary)",
    delay: "1s",
    position: "top-4 -right-2 md:-right-10",
  },
  {
    icon: Search,
    label: "Semantic Search",
    sub: "Found in 48ms",
    color: "var(--success)",
    delay: "2s",
    position: "-bottom-4 -left-2 md:-left-10",
  },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-glow grid-bg">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-15" style={{ background: "var(--primary)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-10" style={{ background: "var(--secondary)" }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-12 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] mb-6 animate-fade-in">
          <Sparkles className="h-3 w-3 text-[var(--primary)]" />
          <span className="text-xs text-[var(--foreground-muted)]">
            Powered by DeepSeek AI + OpenAI Embeddings
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-4 animate-fade-up">
          <span className="text-[var(--foreground)]">Turn documents into</span>
          <br />
          <span className="text-gradient">structured intelligence</span>
        </h1>

        {/* Subheadline */}
        <p className="text-sm sm:text-base md:text-lg text-[var(--foreground-muted)] max-w-xl mx-auto mb-8 leading-relaxed animate-fade-up delay-100">
          Upload any PDF, image, or scanned document. DocIntel automatically extracts text,
          classifies the document type, pulls structured data, and makes it
          conversational — in seconds.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14 animate-fade-up delay-200">
          <Link
            href="/register"
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 shadow-glow hover:shadow-[0_0_60px_rgba(99,102,241,0.4)] w-full sm:w-auto justify-center"
            style={{ background: "var(--gradient-hero)" }}
          >
            Start for free
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
          <Link
            href="https://github.com/Dayvid0063/AI-Document-Intelligence-Platform"
            target="_blank"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-[var(--foreground-muted)] border border-[var(--border-strong)] bg-[var(--surface)] hover:text-[var(--foreground)] transition-all duration-200 w-full sm:w-auto justify-center"
          >
            View on GitHub
          </Link>
        </div>

        {/* Dashboard preview */}
        <div className="relative max-w-3xl mx-auto animate-fade-up delay-300">
          {/* Floating cards — hidden on small screens */}
          {floatingCards.map((card) => (
            <div
              key={card.label}
              className={`absolute ${card.position} z-10 hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] shadow-lg animate-float`}
              style={{ animationDelay: card.delay }}
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg" style={{ background: `${card.color}20` }}>
                <card.icon className="h-3 w-3" style={{ color: card.color }} />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-[var(--foreground)] whitespace-nowrap">{card.label}</p>
                <p className="text-xs text-[var(--foreground-muted)] whitespace-nowrap">{card.sub}</p>
              </div>
            </div>
          ))}

          {/* Main preview window */}
          <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] shadow-lg overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--surface-elevated)]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444] opacity-70" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] opacity-70" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] opacity-70" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 px-3 py-0.5 rounded-md bg-[var(--background)] border border-[var(--border)]">
                  <span className="text-xs text-[var(--foreground-subtle)]">docintel.app/dashboard</span>
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-4 grid grid-cols-4 gap-3">
              {[
                { label: "Total Documents", value: "248", color: "var(--foreground)" },
                { label: "Processed", value: "241", color: "var(--success)" },
                { label: "Pending", value: "7", color: "var(--warning)" },
                { label: "Failed", value: "0", color: "var(--destructive)" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs text-[var(--foreground-muted)] mb-1 truncate">{stat.label}</p>
                  <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                </div>
              ))}

              <div className="col-span-4 rounded-xl border border-[var(--border)] bg-[var(--background)] overflow-hidden">
                <div className="grid grid-cols-4 px-4 py-2 border-b border-[var(--border)] bg-[var(--surface-elevated)]">
                  {["Name", "Type", "Status", "Uploaded"].map((h) => (
                    <span key={h} className="text-xs font-medium text-[var(--foreground-subtle)]">{h}</span>
                  ))}
                </div>
                {[
                  { name: "Invoice_June_2026.pdf", type: "invoice", status: "Completed", statusColor: "var(--success)" },
                  { name: "David_Orji_Resume.pdf", type: "resume", status: "Completed", statusColor: "var(--success)" },
                  { name: "Service_Contract_Q2.pdf", type: "contract", status: "Completed", statusColor: "var(--success)" },
                ].map((row) => (
                  <div key={row.name} className="grid grid-cols-4 px-4 py-2.5 border-b border-[var(--border)] last:border-0">
                    <span className="text-xs text-[var(--foreground)] truncate pr-2">{row.name}</span>
                    <span className="text-xs text-[var(--foreground-muted)] capitalize">{row.type}</span>
                    <span className="text-xs font-medium" style={{ color: row.statusColor }}>{row.status}</span>
                    <span className="text-xs text-[var(--foreground-subtle)]">Jun 22, 2026</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none" style={{ background: "linear-gradient(to top, var(--background), transparent)" }} />
        </div>
      </div>
    </section>
  );
}
