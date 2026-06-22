"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/hooks/useAuth";
import { User, Key, Download, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { documentService } from "@/lib/documents";
import { Button } from "@/components/ui/button";

function Section({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <Card className="border-border shadow-none">
        <CardContent className="p-5 space-y-4">{children}</CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();

  const handleExportCsv = async () => {
    try {
      await documentService.exportAllCsv();
    } catch {
      console.error("Export failed");
    }
  };

  const handleExportExcel = async () => {
    try {
      await documentService.exportAllExcel();
    } catch {
      console.error("Export failed");
    }
  };

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-2xl space-y-8">

        {/* Profile */}
        <Section title="Profile" icon={User}>
          <Field label="Full name" value={user?.full_name || "—"} />
          <div className="border-t border-border" />
          <Field label="Email" value={user?.email || "—"} />
          <div className="border-t border-border" />
          <Field
            label="Account status"
            value={user?.is_active ? "Active" : "Inactive"}
          />
          <div className="border-t border-border" />
          <Field
            label="Member since"
            value={
              user?.created_at
                ? new Date(user.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"
            }
          />
        </Section>

        {/* Export */}
        <Section title="Export data" icon={Download}>
          <p className="text-xs text-muted-foreground">
            Download all your documents and AI-extracted fields as a spreadsheet.
          </p>
          <div className="flex gap-3 pt-1">
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <Download className="h-3.5 w-3.5 mr-2" />
              Export all as CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <Download className="h-3.5 w-3.5 mr-2" />
              Export all as Excel
            </Button>
          </div>
        </Section>

        {/* API Access — Phase 4 placeholder */}
        <Section title="API access" icon={Key}>
          <p className="text-xs text-muted-foreground">
            Programmatic API access with personal tokens is coming in a future update.
            You&apos;ll be able to integrate DocIntel directly into your own applications.
          </p>
          <Button variant="outline" size="sm" disabled>
            <Key className="h-3.5 w-3.5 mr-2" />
            Generate API key — coming soon
          </Button>
        </Section>

        {/* Notifications — Phase 3 placeholder */}
        <Section title="Notifications" icon={Bell}>
          <p className="text-xs text-muted-foreground">
            Email notifications for document processing completion and usage alerts
            are coming in a future update.
          </p>
          <Button variant="outline" size="sm" disabled>
            <Bell className="h-3.5 w-3.5 mr-2" />
            Configure notifications — coming soon
          </Button>
        </Section>

      </div>
    </DashboardLayout>
  );
}
