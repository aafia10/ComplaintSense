const API_BASE = "http://localhost:8000/api";

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorMsg = `API error: ${res.status} ${res.statusText}`;
    try {
      const errorData = await res.json();
      if (errorData.detail) errorMsg = errorData.detail;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export interface Workspace {
  id: string;
  name: string;
  industry: string;
  description: string;
  categories: string[];
  departments: string[];
  created_at: string;
  ticket_count: number;
}

export interface TicketListItem {
  id: string;
  workspace_id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  category?: string;
  intent?: string;
  sentiment?: string;
  urgency_level?: string;
  urgency_score?: number;
  assigned_department?: string;
  recommended_department?: string;
  status: string;
  priority: string;
  created_at: string;
}

export interface TicketDetail extends TicketListItem {
  message: string;
  sentiment_score?: number;
  emotional_tone?: string;
  urgency_signals: Array<{ type: string; keyword: string; description: string }>;
  recommended_action?: string;
  escalation_reason?: string;
  entities: Array<{ entity_type: string; entity_text: string; start_char?: number; end_char?: number }>;
  similar_complaints: Array<{
    ticket_id: string;
    similarity_score: number;
    subject: string;
    category?: string;
    status?: string;
    created_at?: string;
    snippet: string;
  }>;
  response_draft?: {
    draft_text: string;
    edited_text?: string;
    is_approved: boolean;
    recommended_action?: string;
  };
  relevant_knowledge: Array<{
    id: number;
    title: string;
    filename: string;
    similarity: number;
    snippet: string;
    category?: string;
  }>;
  preprocessed_tokens: string[];
  lemmatized_text?: string;
}

export interface DashboardStats {
  total_complaints: number;
  open_complaints: number;
  critical_complaints: number;
  escalated_complaints: number;
  resolved_complaints: number;
  escalation_rate: number;
  sentiment_distribution: Record<string, number>;
  urgency_distribution: Record<string, number>;
  category_distribution: Record<string, number>;
  volume_trends: Array<{
    date: string;
    count: number;
    positive: number;
    neutral: number;
    negative: number;
  }>;
  top_recurring_issues: Array<{
    cluster_name: string;
    complaint_count: number;
    trend_pct: number;
    common_terms: string[];
    possible_root_cause?: string;
    affected_entity?: string;
    affected_location?: string;
    recommended_action?: string;
    is_emerging: boolean;
  }>;
  emerging_issues: Array<{
    cluster_name: string;
    complaint_count: number;
    trend_pct: number;
    common_terms: string[];
    possible_root_cause?: string;
    affected_entity?: string;
    affected_location?: string;
    recommended_action?: string;
    is_emerging: boolean;
  }>;
}
