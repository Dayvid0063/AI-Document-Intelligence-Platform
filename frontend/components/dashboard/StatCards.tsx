import { FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Document } from "@/types/document";

interface StatCardsProps {
  documents: Document[];
}

export default function StatCards({ documents }: StatCardsProps) {
  const total = documents.length;
  const completed = documents.filter((d) => d.status === "completed").length;
  const pending = documents.filter((d) => d.status === "pending").length;
  const failed = documents.filter((d) => d.status === "failed").length;

  const stats = [
    { label: "Total", value: total, icon: FileText, color: "var(--foreground-muted)" },
    { label: "Processed", value: completed, icon: CheckCircle2, color: "var(--success)" },
    { label: "Pending", value: pending, icon: Clock, color: "var(--warning)" },
    { label: "Failed", value: failed, icon: AlertCircle, color: "var(--destructive)" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-xl border p-4"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>
                {stat.label}
              </p>
              <Icon className="h-3.5 w-3.5" style={{ color: stat.color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
