import { Document } from "./document";

export interface ChatSource {
  id: string;
  filename: string;
  document_type: string | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  timestamp: Date;
}

export interface ChatResponse {
  question: string;
  answer: string;
  sources: ChatSource[];
}

export interface SearchResponse {
  query: string;
  results: Document[];
  total: number;
}
