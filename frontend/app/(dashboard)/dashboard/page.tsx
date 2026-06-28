"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import DocumentUpload from "@/components/documents/DocumentUpload";
import DocumentList from "@/components/documents/DocumentList";
import StatCards from "@/components/dashboard/StatCards";
import { useDocumentStore } from "@/lib/stores/useDocumentStore";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Document } from "@/types/document";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { documents, loading, addDocument, updateDocument, removeDocument } = useDocumentStore();

  const handleUploaded = (doc: Document) => addDocument(doc);
  const handleUpdated = (doc: Document) => updateDocument(doc);
  const handleDeleted = (id: string) => removeDocument(id);

  const firstName = user?.full_name?.split(" ")[0] || "there";

  return (
    <DashboardLayout title="Dashboard">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
              Good day, {firstName} 👋
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>
              Here&apos;s an overview of your document workspace
            </p>
          </div>
          <Link
            href="/documents"
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium transition-colors"
            style={{ color: "var(--primary)" }}
          >
            All documents <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Stats */}
        <StatCards documents={documents} />

        {/* Upload */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-subtle)" }}>
            Upload document
          </h3>
          <DocumentUpload onUploaded={handleUploaded} />
        </div>

        {/* Recent */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-subtle)" }}>
              Recent documents
            </h3>
            {documents.length > 5 && (
              <Link href="/documents" className="text-xs" style={{ color: "var(--primary)" }}>
                View all ({documents.length})
              </Link>
            )}
          </div>
          {loading ? (
            <p className="text-xs py-4 text-center" style={{ color: "var(--foreground-muted)" }}>Loading...</p>
          ) : (
            <DocumentList
              documents={documents.slice(0, 5)}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
