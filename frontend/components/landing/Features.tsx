import { ScanText, Brain, Search, MessageSquare, Download, Zap, Shield, FileStack } from "lucide-react";

const features = [
  {
    icon: ScanText,
    title: "OCR Text Extraction",
    description: "Extracts text from PDFs, scanned images, and photos. Automatically falls back to Tesseract OCR for image-only documents.",
    color: "var(--primary)",
    tag: "Core",
  },
  {
    icon: Brain,
    title: "AI Classification",
    description: "Identifies document type — invoice, resume, contract, receipt, bank statement, and more — using DeepSeek AI.",
    color: "var(--secondary)",
    tag: "AI",
  },
  {
    icon: Zap,
    title: "Structured Extraction",
    description: "Pulls key fields into clean JSON. Invoice amounts, due dates, candidate skills, contract parties — per document type.",
    color: "var(--primary)",
    tag: "AI",
  },
  {
    icon: Search,
    title: "Semantic Search",
    description: "Search by meaning, not keywords. Find documents about 'payment obligations' even if that phrase never appears.",
    color: "var(--secondary)",
    tag: "AI",
  },
  {
    icon: MessageSquare,
    title: "RAG Chat",
    description: "Ask questions in natural language. Chat with a single file or across your entire library — grounded in your content.",
    color: "var(--primary)",
    tag: "AI",
  },
  {
    icon: Download,
    title: "CSV & Excel Export",
    description: "Download extracted fields as structured spreadsheets. Bulk export all documents or per-file — ready for any tool.",
    color: "var(--success)",
    tag: "Export",
  },
  {
    icon: FileStack,
    title: "Auto Pipeline",
    description: "Upload once, get everything. OCR, AI analysis, and vector embedding all run automatically — no manual steps.",
    color: "var(--secondary)",
    tag: "Core",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    description: "JWT auth, per-user data isolation, files in Cloudflare R2 with private access. Your documents are only yours.",
    color: "var(--warning)",
    tag: "Security",
  },
];

const tagColors: Record<string, string> = {
  Core: "var(--primary-muted)", AI: "var(--secondary-muted)",
  Export: "var(--success-muted)", Security: "var(--warning-muted)",
};
const tagText: Record<string, string> = {
  Core: "var(--primary)", AI: "var(--secondary)",
  Export: "var(--success)", Security: "var(--warning)",
};

export default function Features() {
  return (
    <section id="features" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] mb-3 text-xs text-[var(--foreground-muted)]">
            Everything you need
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-3">
            Enterprise intelligence,{" "}
            <span className="text-gradient">without the enterprise price</span>
          </h2>
          <p className="text-sm md:text-base text-[var(--foreground-muted)] max-w-xl mx-auto">
            The same capabilities as Azure AI Document Intelligence and Google Document AI —
            built on open models, deployable anywhere.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 hover:border-[var(--border-strong)] hover:bg-[var(--surface-elevated)] transition-all duration-300"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg mb-3 transition-transform duration-300 group-hover:scale-110" style={{ background: `${feature.color}18` }}>
                  <Icon className="h-4 w-4" style={{ color: feature.color }} />
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mb-2" style={{ background: tagColors[feature.tag], color: tagText[feature.tag] }}>
                  {feature.tag}
                </span>
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1.5">{feature.title}</h3>
                <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">{feature.description}</p>
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${feature.color}06 0%, transparent 70%)` }} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
