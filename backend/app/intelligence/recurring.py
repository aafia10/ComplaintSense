from typing import List, Dict, Any
from collections import defaultdict
from app.intelligence.trends import calculate_period_over_period
from app.intelligence.root_cause import detect_root_cause_patterns

def analyze_recurring_issues(tickets: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Groups tickets by category and intent, detects recurring volume, calculates real period trends,
    and identifies possible root-cause associations.
    """
    if not tickets:
        return []

    groups = defaultdict(list)
    for t in tickets:
        cat = t.get("category") or "General Inquiry"
        intent = t.get("intent") or "Report Problem"
        # Thematic grouping
        key = f"{cat} - {intent}"
        groups[key].append(t)

    recurring_issues = []

    for theme, group_tickets in groups.items():
        if len(group_tickets) < 2:
            continue

        trend_metrics = calculate_period_over_period(group_tickets, days_window=14)
        pct_change = trend_metrics["change_pct"]

        root_cause_info = detect_root_cause_patterns(theme, group_tickets)

        # Cluster display name
        cluster_name = theme.replace(" - Report Problem", "").replace(" - General", "")

        is_emerging = pct_change > 15.0 and len(group_tickets) >= 5
        urg_scores = [t.get("urgency_score") for t in group_tickets if t.get("urgency_score") is not None]
        avg_urg = round(sum(urg_scores) / len(urg_scores), 1) if urg_scores else 50.0

        recurring_issues.append({
            "cluster_name": cluster_name,
            "category": cat,
            "complaint_count": len(group_tickets),
            "count": len(group_tickets),
            "avg_urgency": avg_urg,
            "trend_pct": pct_change,
            "common_terms": root_cause_info["common_terms"],
            "possible_root_cause": root_cause_info["associated_factor"],
            "affected_entity": root_cause_info["affected_entity"],
            "affected_location": root_cause_info["affected_location"],
            "recommended_action": root_cause_info["recommendation"],
            "is_emerging": is_emerging
        })

    # Sort descending by complaint count
    recurring_issues.sort(key=lambda x: x["complaint_count"], reverse=True)
    return recurring_issues
