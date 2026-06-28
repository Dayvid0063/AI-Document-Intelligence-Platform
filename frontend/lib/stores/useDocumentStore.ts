import { create } from "zustand";
import { Document } from "@/types/document";
import api from "@/lib/api";

interface DocumentState {
  documents: Document[];
  total: number;
  loading: boolean;
  initialized: boolean;

  // Actions
  fetchDocuments: () => Promise<void>;
  addDocument: (doc: Document) => void;
  updateDocument: (doc: Document) => void;
  removeDocument: (id: string) => void;
  reset: () => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  total: 0,
  loading: false,
  initialized: false,

  fetchDocuments: async () => {
    // Skip if already initialized — avoids duplicate fetches
    if (get().initialized) return;

    set({ loading: true });
    try {
      const { data } = await api.get<{ documents: Document[]; total: number }>(
        "/api/v1/documents/"
      );
      set({ documents: data.documents, total: data.total, initialized: true });
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      set({ loading: false });
    }
  },

  addDocument: (doc: Document) => {
    set((state) => ({
      documents: [doc, ...state.documents],
      total: state.total + 1,
    }));
  },

  updateDocument: (doc: Document) => {
    set((state) => ({
      documents: state.documents.map((d) => (d.id === doc.id ? doc : d)),
    }));
  },

  removeDocument: (id: string) => {
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
      total: state.total - 1,
    }));
  },

  reset: () => {
    set({ documents: [], total: 0, initialized: false, loading: false });
  },
}));
