"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import DocumentUpload from "@/components/documents/DocumentUpload";
import DocumentList from "@/components/documents/DocumentList";
import { useDocumentStore } from "@/lib/stores/useDocumentStore";
import { Document } from "@/types/document";

export default function DocumentsPage() {
  const { documents, loading, addDocument, updateDocument, removeDocument } = useDocumentStore();

  return (
    <DashboardLayout title="Documents">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
              Your documents
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>
              {documents.length} document{documents.length !== 1 ? "s" : ""} in your workspace
            </p>
          </div>
        </div>

        <DocumentUpload onUploaded={(doc: Document) => addDocument(doc)} />

        {loading ? (
          <p className="text-xs py-6 text-center" style={{ color: "var(--foreground-muted)" }}>Loading...</p>
        ) : (
          <DocumentList
            documents={documents}
            onUpdated={(doc: Document) => updateDocument(doc)}
            onDeleted={(id: string) => removeDocument(id)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
