import { Upload, ScanText, Brain, MessageSquare } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload your document",
    description: "Drag and drop any PDF, PNG, JPG, or TIFF — up to 10MB. Invoices, contracts, resumes, receipts.",
    color: "var(--primary)",
    detail: "Stored in Cloudflare R2",
  },
  {
    icon: ScanText,
    title: "OCR extracts text",
    description: "pypdf handles text-based PDFs instantly. Tesseract OCR reads scanned documents and images.",
    color: "var(--secondary)",
    detail: "Handles scanned + digital",
  },
  {
    icon: Brain,
    title: "AI classifies & extracts",
    description: "DeepSeek identifies the document type, writes a summary, and extracts key fields into JSON.",
    color: "var(--primary)",
    detail: "DeepSeek v4 Flash",
  },
  {
    icon: MessageSquare,
    title: "Search and chat",
    description: "Documents are embedded as vectors. Ask questions — the AI reads your documents before answering.",
    color: "var(--secondary)",
    detail: "OpenAI + pgvector",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-6 relative">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.04) 0%, transparent 70%)" }} />

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] mb-3 text-xs text-[var(--foreground-muted)]">
            How it works
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-3">
            From upload to insight{" "}
            <span className="text-gradient-cyan">in seconds</span>
          </h2>
          <p className="text-sm md:text-base text-[var(--foreground-muted)] max-w-md mx-auto">
            The entire pipeline runs automatically on every upload. No manual steps. No configuration.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative mb-10">
          {/* Connecting line — desktop only */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px" style={{ background: "linear-gradient(90deg, transparent, var(--border-strong), var(--primary), var(--secondary), var(--border-strong), transparent)" }} />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative flex flex-col items-center text-center group">
                <div className="relative mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 transition-all duration-300 group-hover:scale-110" style={{ borderColor: step.color, background: `${step.color}12` }}>
                    <Icon className="h-6 w-6" style={{ color: step.color }} />
                  </div>
                  <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: step.color }}>
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1.5">{step.title}</h3>
                <p className="text-xs text-[var(--foreground-muted)] leading-relaxed mb-2 max-w-[200px]">{step.description}</p>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${step.color}12`, color: step.color }}>{step.detail}</span>
              </div>
            );
          })}
        </div>

        {/* Pipeline visualization */}
        <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] p-5 overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-glow)" }} />
          <p className="text-xs font-medium text-[var(--foreground-muted)] mb-4 text-center uppercase tracking-wider">
            Automatic pipeline — runs on every upload
          </p>
          <div className="flex items-center justify-center gap-0 overflow-x-auto pb-1">
            {[
              { label: "Upload", sub: "R2 Storage", color: "var(--primary)" },
              { label: "OCR", sub: "pypdf + Tesseract", color: "var(--secondary)" },
              { label: "AI Analyze", sub: "DeepSeek", color: "var(--primary)" },
              { label: "Embed", sub: "OpenAI + pgvector", color: "var(--secondary)" },
              { label: "Ready", sub: "Search · Chat · Export", color: "var(--success)" },
            ].map((item, i, arr) => (
              <div key={item.label} className="flex items-center shrink-0">
                <div className="flex flex-col items-center px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] min-w-[90px]">
                  <div className="w-1.5 h-1.5 rounded-full mb-1.5" style={{ background: item.color }} />
                  <p className="text-xs font-medium text-[var(--foreground)] whitespace-nowrap">{item.label}</p>
                  <p className="text-xs text-[var(--foreground-subtle)] whitespace-nowrap mt-0.5">{item.sub}</p>
                </div>
                {i < arr.length - 1 && (
                  <div className="flex items-center px-1">
                    <div className="w-4 h-px" style={{ background: "var(--border-strong)" }} />
                    <div className="w-0 h-0" style={{ borderTop: "3px solid transparent", borderBottom: "3px solid transparent", borderLeft: "5px solid var(--border-strong)" }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
