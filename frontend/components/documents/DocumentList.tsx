"use client";

import { useState } from "react";
import { FileText, MoreVertical, Play, Trash2, Eye, Sparkles, Cpu } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StatusBadge from "./StatusBadge";
import DocumentPreview from "./DocumentPreview";
import { Document } from "@/types/document";
import { documentService } from "@/lib/documents";

interface Props {
  documents: Document[];
  onUpdated: (doc: Document) => void;
  onDeleted: (id: string) => void;
}

const fmtBytes = (b: number) => b < 1024 ? `${b}B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(0)}KB` : `${(b / (1024 * 1024)).toFixed(1)}MB`;
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function DocumentList({ documents, onUpdated, onDeleted }: Props) {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const [embeddingIds, setEmbeddingIds] = useState<Set<string>>(new Set());
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  const addId = (set: Set<string>, id: string) => new Set([...set, id]);
  const removeId = (set: Set<string>, id: string) => { const n = new Set(set); n.delete(id); return n; };

  const handleProcess = async (doc: Document) => {
    setProcessingIds((p) => addId(p, doc.id));
    try { onUpdated(await documentService.process(doc.id)); }
    finally { setProcessingIds((p) => removeId(p, doc.id)); }
  };

  const handleAnalyze = async (doc: Document) => {
    setAnalyzingIds((p) => addId(p, doc.id));
    try {
      const updated = await documentService.analyze(doc.id);
      onUpdated(updated);
      setPreviewDoc(updated);
    } finally { setAnalyzingIds((p) => removeId(p, doc.id)); }
  };

  const handleEmbed = async (doc: Document) => {
    setEmbeddingIds((p) => addId(p, doc.id));
    try { onUpdated(await documentService.embed(doc.id)); }
    finally { setEmbeddingIds((p) => removeId(p, doc.id)); }
  };

  const handleDelete = async (doc: Document) => {
    await documentService.remove(doc.id);
    onDeleted(doc.id);
  };

  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center" style={{ borderColor: "var(--border-strong)" }}>
        <FileText className="h-7 w-7 mx-auto mb-2" style={{ color: "var(--foreground-subtle)" }} />
        <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>No documents yet</p>
        <p className="text-xs mt-1" style={{ color: "var(--foreground-muted)" }}>Upload a file above to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        {/* Desktop table */}
        <div className="hidden sm:block">
          <div className="grid grid-cols-[1fr_80px_100px_90px_40px] px-4 py-2.5 border-b" style={{ background: "var(--surface-elevated)", borderColor: "var(--border)" }}>
            {["Name", "Size", "Uploaded", "Status", ""].map((h) => (
              <span key={h} className="text-xs font-medium" style={{ color: "var(--foreground-subtle)" }}>{h}</span>
            ))}
          </div>
          {documents.map((doc) => (
            <div key={doc.id} className="grid grid-cols-[1fr_80px_100px_90px_40px] px-4 py-3 border-b last:border-0 transition-colors hover:bg-[var(--surface-elevated)]" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--foreground-subtle)" }} />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: "var(--foreground)" }}>{doc.original_filename}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {doc.document_type && <span className="text-xs capitalize" style={{ color: "var(--foreground-subtle)" }}>{doc.document_type.replace(/_/g, " ")}</span>}
                    {doc.is_embedded && <span className="text-xs flex items-center gap-0.5" style={{ color: "var(--success)" }}><Cpu className="h-2.5 w-2.5" />embedded</span>}
                  </div>
                </div>
              </div>
              <span className="text-xs self-center" style={{ color: "var(--foreground-muted)" }}>{fmtBytes(doc.file_size)}</span>
              <span className="text-xs self-center" style={{ color: "var(--foreground-muted)" }}>{fmtDate(doc.created_at)}</span>
              <div className="self-center"><StatusBadge status={doc.status} /></div>
              <div className="self-center flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger className="p-1 rounded hover:bg-[var(--border)]">
                    <MoreVertical className="h-3.5 w-3.5" style={{ color: "var(--foreground-muted)" }} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="text-xs">
                    {(doc.extracted_text || doc.summary) && (
                      <DropdownMenuItem onClick={() => setPreviewDoc(doc)} className="cursor-pointer text-xs">
                        <Eye className="h-3 w-3 mr-2" />View details
                      </DropdownMenuItem>
                    )}
                    {doc.status === "pending" && (
                      <DropdownMenuItem onClick={() => handleProcess(doc)} disabled={processingIds.has(doc.id)} className="cursor-pointer text-xs">
                        <Play className="h-3 w-3 mr-2" />{processingIds.has(doc.id) ? "Extracting..." : "Run OCR"}
                      </DropdownMenuItem>
                    )}
                    {doc.status === "completed" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAnalyze(doc)} disabled={analyzingIds.has(doc.id)} className="cursor-pointer text-xs">
                          <Sparkles className="h-3 w-3 mr-2" />{analyzingIds.has(doc.id) ? "Analyzing..." : "Analyze with AI"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEmbed(doc)} disabled={embeddingIds.has(doc.id)} className="cursor-pointer text-xs">
                          <Cpu className="h-3 w-3 mr-2" />{embeddingIds.has(doc.id) ? "Embedding..." : "Generate embedding"}
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDelete(doc)} className="cursor-pointer text-xs text-destructive focus:text-destructive">
                      <Trash2 className="h-3 w-3 mr-2" />Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile card list */}
        <div className="sm:hidden divide-y" style={{ borderColor: "var(--border)" }}>
          {documents.map((doc) => (
            <div key={doc.id} className="p-3 flex items-center gap-3">
              <FileText className="h-4 w-4 shrink-0" style={{ color: "var(--foreground-subtle)" }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: "var(--foreground)" }}>{doc.original_filename}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={doc.status} />
                  <span className="text-xs" style={{ color: "var(--foreground-subtle)" }}>{fmtBytes(doc.file_size)}</span>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="p-1 rounded">
                  <MoreVertical className="h-4 w-4" style={{ color: "var(--foreground-muted)" }} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {(doc.extracted_text || doc.summary) && (
                    <DropdownMenuItem onClick={() => setPreviewDoc(doc)} className="cursor-pointer text-xs">
                      <Eye className="h-3 w-3 mr-2" />View details
                    </DropdownMenuItem>
                  )}
                  {doc.status === "completed" && (
                    <>
                      <DropdownMenuItem onClick={() => handleAnalyze(doc)} disabled={analyzingIds.has(doc.id)} className="cursor-pointer text-xs">
                        <Sparkles className="h-3 w-3 mr-2" />Analyze with AI
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEmbed(doc)} disabled={embeddingIds.has(doc.id)} className="cursor-pointer text-xs">
                        <Cpu className="h-3 w-3 mr-2" />Generate embedding
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleDelete(doc)} className="cursor-pointer text-xs text-destructive focus:text-destructive">
                    <Trash2 className="h-3 w-3 mr-2" />Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>

      {previewDoc && <DocumentPreview document={previewDoc} onClose={() => setPreviewDoc(null)} />}
    </>
  );
}
