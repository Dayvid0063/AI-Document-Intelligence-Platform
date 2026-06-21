"use client";

import { useState } from "react";
import { FileText, MoreVertical, Play, Trash2, Eye, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StatusBadge from "./StatusBadge";
import DocumentPreview from "./DocumentPreview";
import { Document } from "@/types/document";
import { documentService } from "@/lib/documents";

interface DocumentListProps {
  documents: Document[];
  onUpdated: (doc: Document) => void;
  onDeleted: (id: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DocumentList({ documents, onUpdated, onDeleted }: DocumentListProps) {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  const handleProcess = async (doc: Document) => {
    setProcessingIds((prev) => new Set(prev).add(doc.id));
    try {
      const updated = await documentService.process(doc.id);
      onUpdated(updated);
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(doc.id);
        return next;
      });
    }
  };

  const handleAnalyze = async (doc: Document) => {
    setAnalyzingIds((prev) => new Set(prev).add(doc.id));
    try {
      const updated = await documentService.analyze(doc.id);
      onUpdated(updated);
      // Auto-open preview after analysis so user sees results immediately
      setPreviewDoc(updated);
    } finally {
      setAnalyzingIds((prev) => {
        const next = new Set(prev);
        next.delete(doc.id);
        return next;
      });
    }
  };

  const handleDelete = async (doc: Document) => {
    await documentService.remove(doc.id);
    onDeleted(doc.id);
  };

  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center">
        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium">No documents yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Upload a file above to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left font-medium text-muted-foreground px-4 py-3">Name</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Size</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Uploaded</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">Status</th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr
                key={doc.id}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium truncate max-w-[180px] sm:max-w-xs">
                        {doc.original_filename}
                      </p>
                      {doc.document_type && (
                        <p className="text-xs text-muted-foreground capitalize mt-0.5">
                          {doc.document_type.replace("_", " ")}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                  {formatBytes(doc.file_size)}
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                  {formatDate(doc.created_at)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={doc.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-1.5 rounded-md hover:bg-muted">
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* View — available if there's any content to show */}
                      {(doc.extracted_text || doc.summary) && (
                        <DropdownMenuItem
                          onClick={() => setPreviewDoc(doc)}
                          className="cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 mr-2" />
                          View details
                        </DropdownMenuItem>
                      )}

                      {/* Run OCR — only if pending */}
                      {doc.status === "pending" && (
                        <DropdownMenuItem
                          onClick={() => handleProcess(doc)}
                          disabled={processingIds.has(doc.id)}
                          className="cursor-pointer"
                        >
                          <Play className="h-3.5 w-3.5 mr-2" />
                          {processingIds.has(doc.id) ? "Extracting..." : "Run OCR"}
                        </DropdownMenuItem>
                      )}

                      {/* Analyze — available once OCR is done */}
                      {doc.status === "completed" && (
                        <>
                          {(doc.extracted_text || doc.summary) && (
                            <DropdownMenuSeparator />
                          )}
                          <DropdownMenuItem
                            onClick={() => handleAnalyze(doc)}
                            disabled={analyzingIds.has(doc.id)}
                            className="cursor-pointer"
                          >
                            <Sparkles className="h-3.5 w-3.5 mr-2" />
                            {analyzingIds.has(doc.id) ? "Analyzing..." : "Analyze with AI"}
                          </DropdownMenuItem>
                        </>
                      )}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(doc)}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {previewDoc && (
        <DocumentPreview document={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}
    </>
  );
}
