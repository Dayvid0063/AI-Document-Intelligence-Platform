"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { documentService } from "@/lib/documents";
import { Document } from "@/types/document";

const ACCEPTED = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/tiff"];
const MAX_MB = 10;

interface UploadingFile {
  file: File;
  progress: number;
  error: string | null;
  done: boolean;
  processing: boolean;
}

interface Props {
  onUploaded: (doc: Document) => void;
}

export default function DocumentUpload({ onUploaded }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadingFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (file: File) => {
    if (!ACCEPTED.includes(file.type)) return "Unsupported type. Use PDF, PNG, JPG, or TIFF.";
    if (file.size > MAX_MB * 1024 * 1024) return `Exceeds ${MAX_MB}MB limit.`;
    return null;
  };

  const handleFiles = useCallback(async (fileList: FileList) => {
    for (const file of Array.from(fileList)) {
      const error = validate(file);
      setUploads((p) => [...p, { file, progress: 0, error, done: false, processing: false }]);
      if (error) continue;

      try {
        setUploads((p) => p.map((u) => u.file === file ? { ...u, processing: true } : u));
        const doc = await documentService.upload(file, (pct) => {
          setUploads((p) => p.map((u) => u.file === file ? { ...u, progress: pct } : u));
        });
        setUploads((p) => p.map((u) => u.file === file ? { ...u, done: true, progress: 100, processing: false } : u));
        onUploaded(doc);
      } catch {
        setUploads((p) => p.map((u) => u.file === file ? { ...u, error: "Upload failed.", processing: false } : u));
      }
    }
  }, [onUploaded]);

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200",
          isDragging ? "border-[var(--primary)] bg-[var(--primary-muted)]" : "border-[var(--border-strong)] hover:border-[var(--primary)] hover:bg-[var(--surface-elevated)]"
        )}
      >
        <input ref={inputRef} type="file" multiple accept={ACCEPTED.join(",")} className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)} />
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "var(--primary-muted)" }}>
            <UploadCloud className="h-5 w-5" style={{ color: "var(--primary)" }} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
              Drop files or <span style={{ color: "var(--primary)" }}>browse</span>
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>
              PDF, PNG, JPG, TIFF — up to {MAX_MB}MB
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--foreground-subtle)" }}>
              OCR, AI analysis &amp; embedding run automatically
            </p>
          </div>
        </div>
      </div>

      {uploads.length > 0 && (
        <div className="space-y-1.5">
          {uploads.map((u, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <FileText className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--foreground-subtle)" }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: "var(--foreground)" }}>{u.file.name}</p>
                {u.error ? (
                  <p className="text-xs mt-0.5" style={{ color: "var(--destructive)" }}>{u.error}</p>
                ) : u.processing ? (
                  <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "var(--foreground-muted)" }}>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Processing pipeline...
                  </p>
                ) : !u.done ? (
                  <div className="h-1 rounded-full mt-1.5 overflow-hidden" style={{ background: "var(--border)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${u.progress}%`, background: "var(--primary)" }} />
                  </div>
                ) : (
                  <p className="text-xs mt-0.5" style={{ color: "var(--success)" }}>Ready to search</p>
                )}
              </div>
              {u.error ? <AlertCircle className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--destructive)" }} />
                : u.done ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--success)" }} />
                : u.processing ? <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" style={{ color: "var(--foreground-muted)" }} />
                : <span className="text-xs shrink-0" style={{ color: "var(--foreground-muted)" }}>{u.progress}%</span>}
              {(u.done || u.error) && (
                <button onClick={() => setUploads((p) => p.filter((_, j) => j !== i))} style={{ color: "var(--foreground-subtle)" }}>
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
