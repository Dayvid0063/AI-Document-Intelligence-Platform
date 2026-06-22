"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { chatService } from "@/lib/chat";
import { Document } from "@/types/document";
import { Search, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-sm font-semibold">Semantic search</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Search by meaning — finds relevant documents even without exact keyword matches.
            Documents must be embedded first to appear in results.
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Try "payment due date" or "software engineer with React"...'
              className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button type="submit" disabled={loading || !query.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </form>

        {/* Results */}
        {searched && !loading && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              {results.length === 0
                ? "No results found. Make sure your documents have been embedded."
                : `${results.length} result${results.length !== 1 ? "s" : ""} for "${query}"`}
            </p>

            {results.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setPreviewDoc(doc)}
                className="rounded-xl border border-border bg-card p-4 hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{doc.original_filename}</p>
                      {doc.summary && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {doc.summary}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={doc.status} />
                  </div>
                </div>

                {doc.document_type && (
                  <div className="mt-3">
                    <span className="inline-flex items-center rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium capitalize">
                      {doc.document_type.replace(/_/g, " ")}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty state before search */}
        {!searched && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">Search your documents</p>
            <p className="text-xs text-muted-foreground mt-1">
              Enter a query above to find relevant documents by meaning
            </p>
          </div>
        )}
      </div>

      {previewDoc && (
        <DocumentPreview document={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}
    </DashboardLayout>
  );
}
