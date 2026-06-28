import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out DocIntel and personal projects.",
    cta: "Get started",
    ctaHref: "/register",
    highlighted: false,
    features: ["Up to 20 documents", "OCR text extraction", "AI classification & summarization", "Structured field extraction", "Semantic search", "CSV export", "Community support"],
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "For professionals processing documents at scale.",
    cta: "Start free trial",
    ctaHref: "/register",
    highlighted: true,
    badge: "Most popular",
    features: ["Unlimited documents", "Everything in Free", "RAG chat interface", "Excel export", "API access", "Webhook notifications", "Priority processing", "Email support"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "For organizations with high-volume or compliance needs.",
    cta: "Contact sales",
    ctaHref: "mailto:orjidavid0063@gmail.com",
    highlighted: false,
    features: ["Everything in Pro", "Team workspaces", "SSO / SAML", "Custom document types", "SLA guarantee", "Dedicated support", "On-premise deployment"],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] mb-3 text-xs text-[var(--foreground-muted)]">
            Simple pricing
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-3">
            Start free. <span className="text-gradient">Scale when ready.</span>
          </h2>
          <p className="text-sm md:text-base text-[var(--foreground-muted)] max-w-md mx-auto">
            No credit card required. No hidden fees. Cancel anytime.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="relative rounded-xl p-6 flex flex-col"
              style={{
                background: plan.highlighted ? "var(--surface-elevated)" : "var(--surface)",
                border: plan.highlighted ? "1px solid var(--primary)" : "1px solid var(--border)",
                boxShadow: plan.highlighted ? "var(--shadow-glow)" : "none",
              }}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-semibold text-white" style={{ background: "var(--gradient-hero)" }}>
                  {plan.badge}
                </div>
              )}
              <div className="mb-5">
                <p className="text-xs font-semibold text-[var(--foreground-muted)] mb-1.5">{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-1.5">
                  <span className="text-3xl font-bold text-[var(--foreground)]">{plan.price}</span>
                  <span className="text-xs text-[var(--foreground-muted)]">/{plan.period}</span>
                </div>
                <p className="text-xs text-[var(--foreground-muted)]">{plan.description}</p>
              </div>
              <Link
                href={plan.ctaHref}
                className="block text-center py-2 rounded-lg text-sm font-semibold mb-6 transition-all duration-200"
                style={plan.highlighted
                  ? { background: "var(--gradient-hero)", color: "white" }
                  : { background: "var(--surface-elevated)", color: "var(--foreground)", border: "1px solid var(--border-strong)" }
                }
              >
                {plan.cta}
              </Link>
              <ul className="space-y-2.5 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: plan.highlighted ? "var(--primary)" : "var(--success)" }} />
                    <span className="text-xs text-[var(--foreground-muted)]">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-[var(--foreground-subtle)] mt-8">
          Azure AI Document Intelligence starts at $0.001/page. DocIntel gives you unlimited pages for a flat monthly fee.
        </p>
      </div>
    </section>
  );
}
