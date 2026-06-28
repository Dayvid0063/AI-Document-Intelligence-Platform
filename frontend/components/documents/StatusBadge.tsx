import { DocumentStatus } from "@/types/document";

const styles: Record<DocumentStatus, { bg: string; color: string; label: string }> = {
  pending:    { bg: "var(--warning-muted)",     color: "var(--warning)",     label: "Pending" },
  processing: { bg: "var(--cyan-muted)",         color: "var(--cyan)",        label: "Processing" },
  completed:  { bg: "var(--success-muted)",      color: "var(--success)",     label: "Completed" },
  failed:     { bg: "var(--destructive-muted)",  color: "var(--destructive)", label: "Failed" },
};

export default function StatusBadge({ status }: { status: DocumentStatus }) {
  const s = styles[status];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}
