"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { documentService } from "@/lib/documents";
import { Document } from "@/types/document";

const ACCEPTED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/tiff"];
const MAX_SIZE_MB = 10;

interface UploadingFile {
  file: File;
  progress: number;
  error: string | null;
  done: boolean;
}

interface DocumentUploadProps {
  onUploaded: (document: Document) => void;
}

export default function DocumentUpload({ onUploaded }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadingFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Unsupported file type. Use PDF, PNG, JPG, or TIFF.";
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File exceeds ${MAX_SIZE_MB}MB limit.`;
    }
    return null;
  };

  const handleFiles = useCallback(async (fileList: FileList) => {
    const files = Array.from(fileList);

    for (const file of files) {
      const error = validateFile(file);
      const entry: UploadingFile = { file, progress: 0, error, done: false };

      setUploads((prev) => [...prev, entry]);

      if (error) continue;

      try {
        const doc = await documentService.upload(file, (percent) => {
          setUploads((prev) =>
            prev.map((u) => (u.file === file ? { ...u, progress: percent } : u))
          );
        });

        setUploads((prev) =>
          prev.map((u) => (u.file === file ? { ...u, done: true, progress: 100 } : u))
        );
        onUploaded(doc);
      } catch {
        setUploads((prev) =>
          prev.map((u) =>
            u.file === file ? { ...u, error: "Upload failed. Try again." } : u
          )
        );
      }
    }
  }, [onUploaded]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const dismiss = (file: File) => {
    setUploads((prev) => prev.filter((u) => u.file !== file));
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/40"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <UploadCloud className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Drop files here or <span className="text-primary">browse</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, PNG, JPG, TIFF — up to {MAX_SIZE_MB}MB
            </p>
          </div>
        </div>
      </div>

      {/* Upload progress list */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((u, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
            >
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{u.file.name}</p>
                {u.error ? (
                  <p className="text-xs text-destructive mt-0.5">{u.error}</p>
                ) : !u.done ? (
                  <div className="h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${u.progress}%` }}
                    />
                  </div>
                ) : null}
              </div>
              {u.error ? (
                <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
              ) : u.done ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : (
                <span className="text-xs text-muted-foreground shrink-0">{u.progress}%</span>
              )}
              <button
                onClick={() => dismiss(u.file)}
                className="text-muted-foreground hover:text-foreground shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
