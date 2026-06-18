import { Card, CardContent } from "@/components/ui/card";
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
    { label: "Total Documents", value: total, icon: FileText, color: "text-foreground" },
    { label: "Processed", value: completed, icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Pending", value: pending, icon: Clock, color: "text-amber-500" },
    { label: "Failed", value: failed, icon: AlertCircle, color: "text-red-500" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="border-border shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                <Icon className={`h-3.5 w-3.5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-semibold mt-2">{stat.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
