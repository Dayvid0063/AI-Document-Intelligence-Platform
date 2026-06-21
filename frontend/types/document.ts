export type DocumentStatus = "pending" | "processing" | "completed" | "failed";

export interface Document {
  id: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  status: DocumentStatus;
  document_type: string | null;
  summary: string | null;
  extracted_text: string | null;
  extracted_fields: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentListResponse {
  total: number;
  documents: Document[];
}
