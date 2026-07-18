export interface UsageBreakdownItem {
  calls: number;
  cost_usd: number;
}

export interface UsageSummary {
  total_calls: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost_usd: number;
  breakdown: Record<string, UsageBreakdownItem>;
  recent_logs: UsageLog[];
}

export interface UsageLog {
  id: string;
  operation: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  document_id: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  resource_id: string | null;
  extra_data: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface AuditLogResponse {
  total: number;
  logs: AuditLog[];
}
