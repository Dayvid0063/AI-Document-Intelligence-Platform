import api from "./api";
import { Document, DocumentListResponse } from "@/types/document";
import { UsageSummary, AuditLogResponse } from "@/types/usage";

export const documentService = {
  async upload(file: File, onProgress?: (percent: number) => void): Promise<Document> {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.post<Document>("/api/v1/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    });
    return data;
  },

  async list(): Promise<DocumentListResponse> {
    const { data } = await api.get<DocumentListResponse>("/api/v1/documents/");
    return data;
  },

  async getById(id: string): Promise<Document> {
    const { data } = await api.get<Document>(`/api/v1/documents/${id}`);
    return data;
  },

  async process(id: string): Promise<Document> {
    const { data } = await api.post<Document>(`/api/v1/documents/${id}/process`);
    return data;
  },

  async analyze(id: string): Promise<Document> {
    const { data } = await api.post<Document>(`/api/v1/documents/${id}/analyze`);
    return data;
  },

  async embed(id: string): Promise<Document> {
    const { data } = await api.post<Document>(`/api/v1/documents/${id}/embed`);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/api/v1/documents/${id}`);
  },

  async exportAllCsv(): Promise<void> {
    await downloadExport("/api/v1/export/csv", "docintel_export.csv");
  },

  async exportAllExcel(): Promise<void> {
    await downloadExport("/api/v1/export/excel", "docintel_export.xlsx");
  },

  async getUsage(): Promise<UsageSummary> {
    const { data } = await api.get<UsageSummary>("/api/v1/usage/");
    return data;
  },

  async getAuditLogs(limit = 20): Promise<AuditLogResponse> {
    const { data } = await api.get<AuditLogResponse>(`/api/v1/audit/?limit=${limit}`);
    return data;
  },
};

async function downloadExport(url: string, defaultFilename: string): Promise<void> {
  const token = localStorage.getItem("access_token");
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${baseUrl}${url}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Export failed");

  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = defaultFilename;
  a.click();
  URL.revokeObjectURL(a.href);
}
