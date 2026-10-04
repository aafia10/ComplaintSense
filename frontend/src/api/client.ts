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

export interface DuplicateWarning {
  is_duplicate: boolean;
  similarity_score: number;
  similarity_percentage: number;
  matched_ticket_id: string;
  matched_customer_name: string;
  matched_subject: string;
  matched_status: string;
  matched_created_at: string;
  matched_snippet: string;
  warning_message: string;
}

export interface QualityCheckItem {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface ResponseQualityCheck {
  score_pct: number;
  is_ready_to_send: boolean;
  checklist: QualityCheckItem[];
}

export interface FeedbackRecordItem {
  id: number;
  original_category?: string;
  corrected_category?: string;
  original_intent?: string;
  corrected_intent?: string;
  notes?: string;
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
  duplicate_warning?: DuplicateWarning | null;
  quality_check?: ResponseQualityCheck | null;
  feedbacks?: FeedbackRecordItem[];
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

export interface OverviewKPIs {
  total_complaints: number;
  total_change_pct: number;
  open_complaints: number;
  open_change_pct: number;
  critical_complaints: number;
  critical_change_pct: number;
  escalated_complaints: number;
  escalated_change_pct: number;
  period_days: number;
}

export interface OverviewData {
  kpis: OverviewKPIs;
  volume_trends: Array<{
    date: string;
    count: number;
    positive: number;
    neutral: number;
    negative: number;
  }>;
  top_drivers: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  sentiment_breakdown: Array<{
    sentiment: string;
    count: number;
    percentage: number;
  }>;
  needs_attention: Array<{
    id: string;
    customer_name: string;
    subject: string;
    category?: string;
    intent?: string;
    urgency_level?: string;
    urgency_score?: number;
    status: string;
    created_at: string;
  }>;
  emerging_issue?: {
    cluster_name: string;
    complaint_count: number;
    trend_pct: number;
    possible_root_cause?: string;
    affected_entity?: string;
    affected_location?: string;
    recommended_action?: string;
    is_emerging: boolean;
  } | null;
}

export interface ProductIntelligenceItem {
  product_name: string;
  complaint_count: number;
  average_urgency: number;
  dominant_category: string;
  top_intent: string;
  negative_sentiment_pct: number;
  risk_score: number;
  severity: "High" | "Medium" | "Low";
}

export interface CustomerIntelligenceItem {
  customer_name: string;
  customer_email: string;
  total_complaints: number;
  open_complaints: number;
  escalated_count: number;
  average_urgency: number;
  dominant_category: string;
  risk_level: "Critical" | "High" | "Medium" | "Low";
  latest_ticket_id: string;
  latest_subject: string;
  last_complaint_date: string;
}

export interface KnowledgeGapItem {
  cluster_id: number;
  cluster_title: string;
  dominant_category: string;
  complaint_count: number;
  urgency_level: string;
  max_kb_similarity: number;
  closest_policy: string;
  gap_severity: "High" | "Medium";
  suggested_policy_title: string;
  actionable_guidance: string;
}

export interface ModelHealthData {
  total_predictions: number;
  average_confidence: number;
  confidence_distribution: Record<string, number>;
  low_confidence_rate_pct: number;
  human_feedback: {
    total_feedback_records: number;
    category_corrections: number;
    intent_corrections: number;
  };
  status: string;
}
