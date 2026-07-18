"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { User, Download, Key, Bell, Shield, Activity } from "lucide-react";
import { documentService } from "@/lib/documents";
import { UsageSummary, AuditLog } from "@/types/usage";

const ACTION_LABELS: Record<string, string> = {
  "user.register": "Account created",
  "user.login": "Signed in",
  "user.login_failed": "Failed login attempt",
  "document.upload": "Document uploaded",
  "document.process": "OCR extraction run",
  "document.analyze": "AI analysis run",
  "document.embed": "Embedding generated",
  "document.delete": "Document deleted",
  "document.export_csv": "Exported as CSV",
  "document.export_excel": "Exported as Excel",
  "chat.query": "Chat query",
  "search.query": "Search performed",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function extraDataSummary(log: AuditLog): string | null {
  if (!log.extra_data) return null;
  if (typeof log.extra_data.filename === "string") return log.extra_data.filename;
  if (typeof log.extra_data.query === "string") return `"${log.extra_data.query}"`;
  if (typeof log.extra_data.question === "string") return `"${log.extra_data.question}"`;
  if (typeof log.extra_data.email === "string") return log.extra_data.email;
  return null;
}

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

function SkeletonLine({ width = "60%" }: { width?: string }) {
  return (
    <div
      className="h-3 rounded animate-shimmer"
      style={{ width, background: "var(--surface-elevated)" }}
    />
  );
}

function ErrorNote({ message }: { message: string }) {
  return (
    <p className="text-xs" style={{ color: "var(--foreground-subtle)" }}>{message}</p>
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

  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [usageError, setUsageError] = useState(false);
  const [usageLoading, setUsageLoading] = useState(true);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditError, setAuditError] = useState(false);
  const [auditLoading, setAuditLoading] = useState(true);

  useEffect(() => {
    documentService
      .getUsage()
      .then(setUsage)
      .catch(() => setUsageError(true))
      .finally(() => setUsageLoading(false));

    documentService
      .getAuditLogs(10)
      .then((res) => setAuditLogs(res.logs))
      .catch(() => setAuditError(true))
      .finally(() => setAuditLoading(false));
  }, []);

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
          {usageLoading ? (
            <div className="space-y-3">
              <SkeletonLine width="40%" />
              <SkeletonLine width="55%" />
              <SkeletonLine width="35%" />
            </div>
          ) : usageError || !usage ? (
            <ErrorNote message="Unable to load usage data." />
          ) : (
            <>
              <Field label="Total AI calls" value={String(usage.total_calls)} />
              <div className="h-px" style={{ background: "var(--border)" }} />
              <Field
                label="Total tokens used"
                value={(usage.total_input_tokens + usage.total_output_tokens).toLocaleString()}
              />
              <div className="h-px" style={{ background: "var(--border)" }} />
              <Field label="Estimated cost" value={`$${usage.total_cost_usd.toFixed(4)}`} />

              {Object.keys(usage.breakdown).length > 0 && (
                <>
                  <div className="h-px" style={{ background: "var(--border)" }} />
                  <div className="space-y-1.5 pt-1">
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-subtle)" }}>
                      By operation
                    </p>
                    {Object.entries(usage.breakdown).map(([operation, stats]) => (
                      <div key={operation} className="flex items-center justify-between py-0.5">
                        <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                          {ACTION_LABELS[operation] || operation} <span style={{ color: "var(--foreground-subtle)" }}>({stats.calls})</span>
                        </span>
                        <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
                          ${stats.cost_usd.toFixed(4)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </Section>

        {/* Recent activity */}
        <Section title="Recent activity" icon={Activity}>
          {auditLoading ? (
            <div className="space-y-3">
              <SkeletonLine width="70%" />
              <SkeletonLine width="50%" />
              <SkeletonLine width="65%" />
            </div>
          ) : auditError ? (
            <ErrorNote message="Unable to load activity." />
          ) : auditLogs.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>No recent activity yet.</p>
          ) : (
            <div className="space-y-2.5">
              {auditLogs.map((log) => {
                const summary = extraDataSummary(log);
                return (
                  <div key={log.id} className="flex items-center justify-between gap-2 py-0.5">
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: "var(--foreground)" }}>
                        {ACTION_LABELS[log.action] || log.action}
                        {summary && <span style={{ color: "var(--foreground-muted)" }}> — {summary}</span>}
                      </p>
                    </div>
                    <span className="text-xs shrink-0" style={{ color: "var(--foreground-subtle)" }}>
                      {timeAgo(log.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
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
