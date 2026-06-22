import api from "./api";
import { Document, DocumentListResponse } from "@/types/document";

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
};
