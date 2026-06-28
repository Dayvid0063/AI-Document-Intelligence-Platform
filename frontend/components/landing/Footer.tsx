import Link from "next/link";
import { Sparkles, Globe, Code2, User } from "lucide-react";

const links = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Changelog", href: "#" },
  ],
  Developers: [
    { label: "API Reference", href: "#" },
    { label: "GitHub", href: "https://github.com/Dayvid0063/AI-Document-Intelligence-Platform", external: true },
    { label: "Documentation", href: "#" },
    { label: "Status", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ],
};

const socials = [
  { icon: Code2, href: "https://github.com/Dayvid0063", label: "GitHub" },
  { icon: User, href: "https://www.linkedin.com/in/david-orji-", label: "LinkedIn" },
  { icon: Globe, href: "https://david-portfolio-inky.vercel.app", label: "Portfolio" },
];

export default function Footer() {
  return (
    <footer
      className="border-t px-6 pt-16 pb-8"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] group-hover:shadow-glow transition-shadow duration-300">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-sm text-[var(--foreground)]">DocIntel</span>
            </Link>
            <p className="text-sm text-[var(--foreground-muted)] leading-relaxed max-w-xs mb-6">
              AI-powered document intelligence platform. Extract, classify, search,
              and chat with your documents.
            </p>
            <div className="flex items-center gap-3">
              {socials.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:border-[var(--border-strong)] transition-all duration-200"
                    aria-label={social.label}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <p className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider mb-4">
                {category}
              </p>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      target={"external" in item && item.external ? "_blank" : undefined}
                      className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-xs text-[var(--foreground-subtle)]">
            © 2026 DocIntel. Built by{" "}
            <Link
              href="https://david-portfolio-inky.vercel.app"
              target="_blank"
              className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
            >
              David Orji
            </Link>
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
            <span className="text-xs text-[var(--foreground-subtle)]">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
