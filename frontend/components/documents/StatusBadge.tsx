import { Badge } from "@/components/ui/badge";
import { DocumentStatus } from "@/types/document";
import { cn } from "@/lib/utils";

const statusStyles: Record<DocumentStatus, string> = {
  pending: "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
  processing: "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
  failed: "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400",
};

const statusLabels: Record<DocumentStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

export default function StatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <Badge variant="secondary" className={cn("font-medium border-0", statusStyles[status])}>
      {statusLabels[status]}
    </Badge>
  );
}
