"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useDocumentStore } from "@/lib/stores/useDocumentStore";
import { User, Download, Key, Bell, Shield } from "lucide-react";
import { documentService } from "@/lib/documents";

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "var(--border)", background: "var(--surface-elevated)" }}>
        <Icon className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />
        <h2 className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{title}</h2>
      </div>
      <div className="px-4 py-4 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>{label}</span>
      <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{value}</span>
    </div>
  );
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>{label}</span>
      <span className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--surface-elevated)", color: "var(--foreground-subtle)" }}>Coming soon</span>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { documents } = useDocumentStore();

  const embedded = documents.filter((d) => d.is_embedded).length;
  const completed = documents.filter((d) => d.status === "completed").length;

  const handleExport = async (format: "csv" | "excel") => {
    try {
      format === "csv" ? await documentService.exportAllCsv() : await documentService.exportAllExcel();
    } catch { console.error("Export failed"); }
  };

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Profile */}
        <Section title="Profile" icon={User}>
          <Field label="Full name" value={user?.full_name || "—"} />
          <div className="h-px" style={{ background: "var(--border)" }} />
          <Field label="Email" value={user?.email || "—"} />
          <div className="h-px" style={{ background: "var(--border)" }} />
          <Field label="Account status" value={user?.is_active ? "Active" : "Inactive"} />
          <div className="h-px" style={{ background: "var(--border)" }} />
          <Field label="Member since" value={user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"} />
        </Section>

        {/* Usage */}
        <Section title="Usage" icon={Shield}>
          <Field label="Total documents" value={String(documents.length)} />
          <div className="h-px" style={{ background: "var(--border)" }} />
          <Field label="Processed" value={String(completed)} />
          <div className="h-px" style={{ background: "var(--border)" }} />
          <Field label="Embedded (searchable)" value={String(embedded)} />
        </Section>

        {/* Export */}
        <Section title="Export data" icon={Download}>
          <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
            Download all your documents and AI-extracted fields as a spreadsheet.
          </p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => handleExport("csv")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors hover:bg-[var(--surface-elevated)]"
              style={{ borderColor: "var(--border-strong)", color: "var(--foreground-muted)" }}
            >
              <Download className="h-3 w-3" />Export CSV
            </button>
            <button
              onClick={() => handleExport("excel")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors hover:bg-[var(--surface-elevated)]"
              style={{ borderColor: "var(--border-strong)", color: "var(--foreground-muted)" }}
            >
              <Download className="h-3 w-3" />Export Excel
            </button>
          </div>
        </Section>

        {/* API */}
        <Section title="API access" icon={Key}>
          <ComingSoon label="Personal API tokens" />
          <div className="h-px" style={{ background: "var(--border)" }} />
          <ComingSoon label="Webhook endpoints" />
        </Section>

        {/* Notifications */}
        <Section title="Notifications" icon={Bell}>
          <ComingSoon label="Processing complete alerts" />
          <div className="h-px" style={{ background: "var(--border)" }} />
          <ComingSoon label="Usage limit warnings" />
        </Section>

      </div>
    </DashboardLayout>
  );
}
