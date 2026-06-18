"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DocumentUpload from "@/components/documents/DocumentUpload";
import DocumentList from "@/components/documents/DocumentList";
import { documentService } from "@/lib/documents";
import { Document } from "@/types/document";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    documentService
      .list()
      .then((res) => setDocuments(res.documents))
      .finally(() => setLoading(false));
  }, []);

  const handleUploaded = (doc: Document) => {
    setDocuments((prev) => [doc, ...prev]);
  };

  const handleUpdated = (doc: Document) => {
    setDocuments((prev) => prev.map((d) => (d.id === doc.id ? doc : d)));
  };

  const handleDeleted = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <DashboardLayout title="Documents">
      <div className="space-y-8 max-w-5xl">
        <DocumentUpload onUploaded={handleUploaded} />

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <DocumentList
            documents={documents}
            onUpdated={handleUpdated}
            onDeleted={handleDeleted}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
