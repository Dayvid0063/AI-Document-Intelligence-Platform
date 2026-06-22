"use client";

import { useState } from "react";
import { FileText, MoreVertical, Play, Trash2, Eye, Sparkles, Cpu } from "lucide-react";
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
  const [embeddingIds, setEmbeddingIds] = useState<Set<string>>(new Set());
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  const handleProcess = async (doc: Document) => {
    setProcessingIds((prev) => new Set(prev).add(doc.id));
    try {
      const updated = await documentService.process(doc.id);
      onUpdated(updated);
    } finally {
      setProcessingIds((prev) => { const n = new Set(prev); n.delete(doc.id); return n; });
    }
  };

  const handleAnalyze = async (doc: Document) => {
    setAnalyzingIds((prev) => new Set(prev).add(doc.id));
    try {
      const updated = await documentService.analyze(doc.id);
      onUpdated(updated);
      setPreviewDoc(updated);
    } finally {
      setAnalyzingIds((prev) => { const n = new Set(prev); n.delete(doc.id); return n; });
    }
  };

  const handleEmbed = async (doc: Document) => {
    setEmbeddingIds((prev) => new Set(prev).add(doc.id));
    try {
      const updated = await documentService.embed(doc.id);
      onUpdated(updated);
    } finally {
      setEmbeddingIds((prev) => { const n = new Set(prev); n.delete(doc.id); return n; });
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
        <p className="text-xs text-muted-foreground mt-1">Upload a file above to get started</p>
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
              <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium truncate max-w-[180px] sm:max-w-xs">
                        {doc.original_filename}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {doc.document_type && (
                          <p className="text-xs text-muted-foreground capitalize">
                            {doc.document_type.replace("_", " ")}
                          </p>
                        )}
                        {doc.is_embedded && (
                          <span className="inline-flex items-center gap-0.5 text-xs text-emerald-600">
                            <Cpu className="h-2.5 w-2.5" />
                            embedded
                          </span>
                        )}
                      </div>
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
                      {(doc.extracted_text || doc.summary) && (
                        <DropdownMenuItem onClick={() => setPreviewDoc(doc)} className="cursor-pointer">
                          <Eye className="h-3.5 w-3.5 mr-2" />
                          View details
                        </DropdownMenuItem>
                      )}

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

                      {doc.status === "completed" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleAnalyze(doc)}
                            disabled={analyzingIds.has(doc.id)}
                            className="cursor-pointer"
                          >
                            <Sparkles className="h-3.5 w-3.5 mr-2" />
                            {analyzingIds.has(doc.id) ? "Analyzing..." : "Analyze with AI"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEmbed(doc)}
                            disabled={embeddingIds.has(doc.id)}
                            className="cursor-pointer"
                          >
                            <Cpu className="h-3.5 w-3.5 mr-2" />
                            {embeddingIds.has(doc.id) ? "Embedding..." : "Generate embedding"}
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
