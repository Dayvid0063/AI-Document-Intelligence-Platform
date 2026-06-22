"use client";

import { useState } from "react";
import { X, ChevronDown, ChevronUp, Sparkles, FileText, Download } from "lucide-react";
import { Document } from "@/types/document";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DocumentPreviewProps {
  document: Document;
  onClose: () => void;
}

function FieldValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">—</span>;
  }

  if (Array.isArray(value)) {
    if (value.every((v) => typeof v !== "object")) {
      return (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {value.map((v, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium"
            >
              {String(v)}
            </span>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2 mt-1">
        {value.map((item, i) => (
          <div key={i} className="rounded-md bg-muted/50 px-3 py-2 text-xs space-y-0.5">
            {Object.entries(item as Record<string, unknown>).map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="text-muted-foreground capitalize min-w-[80px]">
                  {k.replace(/_/g, " ")}
                </span>
                <span className="font-medium">{String(v)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    return (
      <div className="rounded-md bg-muted/50 px-3 py-2 text-xs space-y-0.5 mt-1">
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <div key={k} className="flex gap-2">
            <span className="text-muted-foreground capitalize min-w-[80px]">
              {k.replace(/_/g, " ")}
            </span>
            <span className="font-medium">{String(v)}</span>
          </div>
        ))}
      </div>
    );
  }

  return <span className="font-medium">{String(value)}</span>;
}

export default function DocumentPreview({ document, onClose }: DocumentPreviewProps) {
  const [showRawText, setShowRawText] = useState(false);
  const hasAiResults = !!document.summary || !!document.extracted_fields;
  const hasExtractedFields =
    document.extracted_fields &&
    Object.keys(document.extracted_fields).length > 0;

  const handleExport = (format: "csv" | "excel") => {
    const ext = format === "csv" ? "csv" : "excel";
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/export/${ext}/${document.id}`;
    const token = localStorage.getItem("access_token");

    // Create a temporary anchor with auth header via fetch + blob
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const filename = `${document.original_filename.replace(/\.[^.]+$/, "")}_export.${format === "csv" ? "csv" : "xlsx"}`;
        const a = window.document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
      });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="min-w-0 pr-4">
            <h3 className="text-sm font-semibold truncate">{document.original_filename}</h3>
            <div className="flex items-center gap-2 mt-1">
              {document.document_type && (
                <span className="inline-flex items-center rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium capitalize">
                  {document.document_type.replace(/_/g, " ")}
                </span>
              )}
              <span className="text-xs text-muted-foreground">{document.mime_type}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {hasExtractedFields && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={() => handleExport("csv")}
                >
                  <Download className="h-3 w-3" />
                  CSV
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={() => handleExport("excel")}
                >
                  <Download className="h-3 w-3" />
                  Excel
                </Button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          {/* AI Summary */}
          {document.summary && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  AI Summary
                </p>
              </div>
              <p className="text-sm leading-relaxed">{document.summary}</p>
            </div>
          )}

          {/* Extracted Fields */}
          {hasExtractedFields && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Extracted Fields
                </p>
              </div>
              <div className="space-y-3">
                {Object.entries(document.extracted_fields as Record<string, unknown>).map(
                  ([key, value]) => (
                    <div key={key}>
                      <p className="text-xs font-medium text-muted-foreground capitalize mb-0.5">
                        {key.replace(/_/g, " ")}
                      </p>
                      <FieldValue value={value} />
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* No AI results yet */}
          {!hasAiResults && document.extracted_text && (
            <div className="rounded-lg border border-dashed border-border p-4 text-center">
              <Sparkles className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                No AI analysis yet. Use &ldquo;Analyze with AI&rdquo; from the document menu.
              </p>
            </div>
          )}

          {/* Raw extracted text — collapsible */}
          {document.extracted_text && (
            <div className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setShowRawText((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-xs font-medium hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Raw extracted text</span>
                </div>
                {showRawText ? (
                  <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
              {showRawText && (
                <div className={cn("border-t border-border px-4 py-3 bg-muted/20")}>
                  <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono text-foreground/80">
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
