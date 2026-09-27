from typing import List, Dict, Optional, Any
from pydantic import BaseModel

class DashboardStats(BaseModel):
    total_complaints: int
    open_complaints: int
    critical_complaints: int
    escalated_complaints: int
    resolved_complaints: int
    escalation_rate: float
    sentiment_distribution: Dict[str, int]
    urgency_distribution: Dict[str, int]
    category_distribution: Dict[str, int]
    volume_trends: List[Dict[str, Any]]
    top_recurring_issues: List[Dict[str, Any]]
    emerging_issues: List[Dict[str, Any]]

class TrendItem(BaseModel):
    date: str
    count: int
    positive: int
    neutral: int
    negative: int

class RecurringIssueItem(BaseModel):
    cluster_name: str
    complaint_count: int
    trend_pct: float
    common_terms: List[str]
    possible_root_cause: Optional[str] = None
    affected_entity: Optional[str] = None
    affected_location: Optional[str] = None
    recommended_action: Optional[str] = None
    is_emerging: bool = False

class IntelligenceTrends(BaseModel):
    trends: List[TrendItem]
    top_intents: List[Dict[str, Any]]
    top_categories: List[Dict[str, Any]]
    department_workload: List[Dict[str, Any]]
    affected_products: List[Dict[str, Any]]
    affected_locations: List[Dict[str, Any]]
    possible_root_causes: List[Dict[str, Any]]
    recurring_issues: List[RecurringIssueItem]
    emerging_issues: List[RecurringIssueItem]
