import api from "./api";
import { ChatResponse, SearchResponse } from "@/types/chat";

export const chatService = {
  async search(query: string): Promise<SearchResponse> {
    const { data } = await api.post<SearchResponse>("/api/v1/search/", { query });
    return data;
  },

  async chatWithDocument(question: string, docId: string): Promise<ChatResponse> {
    const { data } = await api.post<ChatResponse>("/api/v1/chat/", {
      question,
      doc_id: docId,
    });
    return data;
  },

  async chatWithAll(question: string): Promise<ChatResponse> {
    const { data } = await api.post<ChatResponse>("/api/v1/chat/", { question });
    return data;
  },
};
