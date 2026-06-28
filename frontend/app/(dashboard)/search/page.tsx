"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { chatService } from "@/lib/chat";
import { Document } from "@/types/document";
import { Search, FileText, Loader2 } from "lucide-react";
import StatusBadge from "@/components/documents/StatusBadge";
import DocumentPreview from "@/components/documents/DocumentPreview";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await chatService.search(query);
      setResults(res.results);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Search">
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Semantic search</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>
            Find documents by meaning — not just keywords. Documents must be embedded to appear.
          </p>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--foreground-subtle)" }} />
            <input
              type="text" value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Try "payment due date" or "software engineer with React"...'
              className="w-full rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-shadow"
              style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", color: "var(--foreground)" }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-opacity"
            style={{ background: "var(--primary)" }}
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Search"}
          </button>
        </form>

        {/* Results */}
        {searched && !loading && (
          <div className="space-y-2">
            <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
              {results.length === 0
                ? "No results found. Make sure your documents have been embedded."
                : `${results.length} result${results.length !== 1 ? "s" : ""} for "${query}"`}
            </p>
            {results.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setPreviewDoc(doc)}
                className="rounded-xl border p-4 cursor-pointer transition-all duration-200 hover:border-[var(--border-strong)] hover:bg-[var(--surface-elevated)]"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--surface-elevated)" }}>
                      <FileText className="h-3.5 w-3.5" style={{ color: "var(--foreground-subtle)" }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{doc.original_filename}</p>
                      {doc.summary && <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--foreground-muted)" }}>{doc.summary}</p>}
                    </div>
                  </div>
                  <StatusBadge status={doc.status} />
                </div>
                {doc.document_type && (
                  <div className="mt-2">
                    <span className="text-xs px-1.5 py-0.5 rounded capitalize" style={{ background: "var(--primary-muted)", color: "var(--primary)" }}>
                      {doc.document_type.replace(/_/g, " ")}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!searched && (
          <div className="rounded-xl border border-dashed p-12 text-center" style={{ borderColor: "var(--border-strong)" }}>
            <Search className="h-7 w-7 mx-auto mb-2" style={{ color: "var(--foreground-subtle)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Search your documents</p>
            <p className="text-xs mt-1" style={{ color: "var(--foreground-muted)" }}>Enter a query above to find relevant documents by meaning</p>
          </div>
        )}
      </div>

      {previewDoc && <DocumentPreview document={previewDoc} onClose={() => setPreviewDoc(null)} />}
    </DashboardLayout>
  );
}
