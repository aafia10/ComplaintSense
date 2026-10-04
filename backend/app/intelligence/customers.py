from typing import List, Dict, Any
from collections import defaultdict
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.ticket import Ticket

def get_customer_intelligence(db: Session, workspace_id: str) -> List[Dict[str, Any]]:
    """
    Analyzes customer complaint histories to identify repeat complainants,
    chronic escalation patterns, and churn-risk accounts.
    """
    tickets = (
        db.query(Ticket)
        .filter(Ticket.workspace_id == workspace_id)
        .order_by(desc(Ticket.created_at))
        .all()
    )

    if not tickets:
        return []

    customer_map = defaultdict(lambda: {
        "name": "",
        "email": "",
        "tickets": [],
        "categories": defaultdict(int),
        "escalations": 0,
        "open_count": 0,
        "urgency_scores": [],
        "sentiments": defaultdict(int)
    })

    for t in tickets:
        key = (t.customer_email or t.customer_name).lower().strip()
        c = customer_map[key]
        c["name"] = t.customer_name
        c["email"] = t.customer_email
        c["tickets"].append(t)
        if t.status in ["open", "new", "in_review"]:
            c["open_count"] += 1
        if t.status == "escalated":
            c["escalations"] += 1
        if t.urgency_score is not None:
            c["urgency_scores"].append(t.urgency_score)
        if t.sentiment:
            c["sentiments"][t.sentiment] += 1
        if t.category:
            c["categories"][t.category] += 1

    records = []
    for key, data in customer_map.items():
        count = len(data["tickets"])
        avg_urgency = round(sum(data["urgency_scores"]) / len(data["urgency_scores"]), 1) if data["urgency_scores"] else 50.0
        most_recent = data["tickets"][0]
        dominant_cat = max(data["categories"], key=data["categories"].get) if data["categories"] else "General"

        # Risk level determination
        if count >= 3 or data["escalations"] >= 2 or avg_urgency >= 80:
            risk_level = "Critical"
        elif count >= 2 or data["escalations"] >= 1 or avg_urgency >= 65:
            risk_level = "High"
        elif count > 1 or avg_urgency >= 50:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        records.append({
            "customer_name": data["name"],
            "customer_email": data["email"],
            "total_complaints": count,
            "open_complaints": data["open_count"],
            "escalated_count": data["escalations"],
            "average_urgency": avg_urgency,
            "dominant_category": dominant_cat,
            "risk_level": risk_level,
            "latest_ticket_id": most_recent.id,
            "latest_subject": most_recent.subject,
            "last_complaint_date": str(most_recent.created_at.date()) if most_recent.created_at else ""
        })

    # Sort so customers with highest complaint count and urgency appear first
    records.sort(key=lambda x: (x["total_complaints"], x["escalated_count"], x["average_urgency"]), reverse=True)
    return records
