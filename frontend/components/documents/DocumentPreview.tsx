"use client";

import { X } from "lucide-react";
import { Document } from "@/types/document";

interface DocumentPreviewProps {
  document: Document;
  onClose: () => void;
}

export default function DocumentPreview({ document, onClose }: DocumentPreviewProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold">{document.original_filename}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Extracted text</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto">
          <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono text-foreground/90">
            {document.extracted_text || "No text extracted."}
          </pre>
        </div>
      </div>
    </div>
  );
}
