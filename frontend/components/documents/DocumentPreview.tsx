"use client";

import { useState } from "react";
import { X, ChevronDown, ChevronUp, Sparkles, FileText, Download } from "lucide-react";
import { Document } from "@/types/document";
import { cn } from "@/lib/utils";

interface Props {
  document: Document;
  onClose: () => void;
}

function FieldValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) return <span style={{ color: "var(--foreground-subtle)" }} className="italic text-xs">—</span>;

  if (Array.isArray(value)) {
    if (value.every((v) => typeof v !== "object")) {
      return (
        <div className="flex flex-wrap gap-1 mt-1">
          {value.map((v, i) => (
            <span key={i} className="px-1.5 py-0.5 rounded text-xs" style={{ background: "var(--surface-elevated)", color: "var(--foreground-muted)" }}>{String(v)}</span>
          ))}
        </div>
      );
    }
    return (
      <div className="space-y-1.5 mt-1">
        {value.map((item, i) => (
          <div key={i} className="rounded-lg px-3 py-2 text-xs space-y-0.5" style={{ background: "var(--surface-elevated)" }}>
            {Object.entries(item as Record<string, unknown>).map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="capitalize min-w-[72px]" style={{ color: "var(--foreground-subtle)" }}>{k.replace(/_/g, " ")}</span>
                <span style={{ color: "var(--foreground-muted)" }}>{String(v)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    return (
      <div className="rounded-lg px-3 py-2 text-xs space-y-0.5 mt-1" style={{ background: "var(--surface-elevated)" }}>
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <div key={k} className="flex gap-2">
            <span className="capitalize min-w-[72px]" style={{ color: "var(--foreground-subtle)" }}>{k.replace(/_/g, " ")}</span>
            <span style={{ color: "var(--foreground-muted)" }}>{String(v)}</span>
          </div>
        ))}
      </div>
    );
  }

  return <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>{String(value)}</span>;
}

export default function DocumentPreview({ document, onClose }: Props) {
  const [showRawText, setShowRawText] = useState(false);
  const hasAi = !!document.summary || !!document.extracted_fields;
  const hasFields = document.extracted_fields && Object.keys(document.extracted_fields).length > 0;

  const handleExport = (format: "csv" | "excel") => {
    const ext = format === "csv" ? "csv" : "excel";
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/export/${ext}/${document.id}`;
    const raw = localStorage.getItem("docintel-auth");
    const token = raw ? JSON.parse(raw)?.state?.access_token : null;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const a = window.document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${document.original_filename.replace(/\.[^.]+$/, "")}_export.${format === "csv" ? "csv" : "xlsx"}`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-xl max-h-[85vh] flex flex-col rounded-xl border shadow-xl"
        style={{ background: "var(--surface)", borderColor: "var(--border-strong)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
          <div className="min-w-0 pr-3">
            <h3 className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>{document.original_filename}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              {document.document_type && (
                <span className="text-xs px-1.5 py-0.5 rounded capitalize" style={{ background: "var(--primary-muted)", color: "var(--primary)" }}>
                  {document.document_type.replace(/_/g, " ")}
                </span>
              )}
              <span className="text-xs" style={{ color: "var(--foreground-subtle)" }}>{document.mime_type}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {hasFields && (
              <>
                <button onClick={() => handleExport("csv")} className="flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors hover:bg-[var(--surface-elevated)]" style={{ borderColor: "var(--border-strong)", color: "var(--foreground-muted)" }}>
                  <Download className="h-3 w-3" />CSV
                </button>
                <button onClick={() => handleExport("excel")} className="flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors hover:bg-[var(--surface-elevated)]" style={{ borderColor: "var(--border-strong)", color: "var(--foreground-muted)" }}>
                  <Download className="h-3 w-3" />Excel
                </button>
              </>
            )}
            <button onClick={onClose} className="p-1 rounded hover:bg-[var(--surface-elevated)]" style={{ color: "var(--foreground-muted)" }}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-4">
          {document.summary && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="h-3 w-3" style={{ color: "var(--primary)" }} />
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-subtle)" }}>AI Summary</p>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--foreground-muted)" }}>{document.summary}</p>
            </div>
          )}

          {hasFields && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="h-3 w-3" style={{ color: "var(--primary)" }} />
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-subtle)" }}>Extracted Fields</p>
              </div>
              <div className="space-y-3">
                {Object.entries(document.extracted_fields as Record<string, unknown>).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs font-medium capitalize mb-0.5" style={{ color: "var(--foreground-subtle)" }}>{key.replace(/_/g, " ")}</p>
                    <FieldValue value={value} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {!hasAi && document.extracted_text && (
            <div className="rounded-lg border border-dashed p-4 text-center" style={{ borderColor: "var(--border-strong)" }}>
              <Sparkles className="h-4 w-4 mx-auto mb-1.5" style={{ color: "var(--foreground-subtle)" }} />
              <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                No AI analysis yet. Use &ldquo;Analyze with AI&rdquo; from the document menu.
              </p>
            </div>
          )}

          {document.extracted_text && (
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={() => setShowRawText((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium hover:bg-[var(--surface-elevated)] transition-colors"
                style={{ color: "var(--foreground-muted)" }}
              >
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3 w-3" />
                  <span>Raw extracted text</span>
                </div>
                {showRawText ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
              {showRawText && (
                <div className="border-t px-3 py-3" style={{ borderColor: "var(--border)", background: "var(--surface-elevated)" }}>
                  <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono" style={{ color: "var(--foreground-muted)" }}>
                    {document.extracted_text}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
