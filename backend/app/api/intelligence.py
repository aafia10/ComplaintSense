from typing import List, Dict, Any
from collections import Counter
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models import Ticket, Entity, ComplaintCluster
from app.schemas.analytics import DashboardStats, IntelligenceTrends
from app.intelligence.trends import calculate_time_series_trends
from app.intelligence.recurring import analyze_recurring_issues

router = APIRouter(prefix="", tags=["intelligence"])

@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(workspace_id: str = Query(...), db: Session = Depends(get_db)):
    tickets = db.query(Ticket).filter(Ticket.workspace_id == workspace_id).all()
    ticket_dicts = [
        {
            "id": t.id,
            "category": t.category,
            "intent": t.intent,
            "sentiment": t.sentiment,
            "urgency_level": t.urgency_level,
            "status": t.status,
            "created_at": t.created_at,
            "message": t.message,
            "subject": t.subject
        }
        for t in tickets
    ]

    total = len(tickets)
    open_c = sum(1 for t in tickets if t.status == "open")
    crit_c = sum(1 for t in tickets if t.urgency_level == "Critical")
    esc_c = sum(1 for t in tickets if t.status == "escalated")
    res_c = sum(1 for t in tickets if t.status == "resolved")
    esc_rate = round((esc_c / total * 100), 1) if total > 0 else 0.0

    # Distributions
    sent_dist = Counter([t.sentiment for t in tickets if t.sentiment])
    urg_dist = Counter([t.urgency_level for t in tickets if t.urgency_level])
    cat_dist = Counter([t.category for t in tickets if t.category])

    # Volume trends
    volume_trends = calculate_time_series_trends(ticket_dicts)

    # Recurring and emerging issues
    recurring_all = analyze_recurring_issues(ticket_dicts)
    top_recurring = recurring_all[:5]
    emerging = [r for r in recurring_all if r.get("is_emerging")]

    return DashboardStats(
        total_complaints=total,
        open_complaints=open_c,
        critical_complaints=crit_c,
        escalated_complaints=esc_c,
        resolved_complaints=res_c,
        escalation_rate=esc_rate,
        sentiment_distribution=dict(sent_dist),
        urgency_distribution=dict(urg_dist),
        category_distribution=dict(cat_dist),
        volume_trends=volume_trends,
        top_recurring_issues=top_recurring,
        emerging_issues=emerging
    )

@router.get("/intelligence/trends", response_model=IntelligenceTrends)
def get_intelligence_trends(workspace_id: str = Query(...), db: Session = Depends(get_db)):
    tickets = db.query(Ticket).filter(Ticket.workspace_id == workspace_id).all()
    ticket_dicts = []
    
    # Load entities
    for t in tickets:
        ents = db.query(Entity).filter(Entity.ticket_id == t.id).all()
        ent_dicts = [{"entity_type": e.entity_type, "entity_text": e.entity_text} for e in ents]
        ticket_dicts.append({
            "id": t.id,
            "category": t.category,
            "intent": t.intent,
            "sentiment": t.sentiment,
            "urgency_level": t.urgency_level,
            "status": t.status,
            "assigned_department": t.assigned_department or t.recommended_department,
            "created_at": t.created_at,
            "message": t.message,
            "subject": t.subject,
            "entities": ent_dicts
        })

    volume_trends = calculate_time_series_trends(ticket_dicts)
    recurring_all = analyze_recurring_issues(ticket_dicts)
    emerging = [r for r in recurring_all if r.get("is_emerging")]

    # Aggregations
    top_intents = [
        {"intent": k, "count": v}
        for k, v in Counter([t["intent"] for t in ticket_dicts if t.get("intent")]).most_common(8)
    ]
    top_categories = [
        {"category": k, "count": v}
        for k, v in Counter([t["category"] for t in ticket_dicts if t.get("category")]).most_common(8)
    ]
    dept_workload = [
        {"department": k, "count": v}
        for k, v in Counter([t["assigned_department"] for t in ticket_dicts if t.get("assigned_department")]).most_common(8)
    ]

    # Entity-based distributions
    products = Counter()
    locations = Counter()
    for t in ticket_dicts:
        for e in t.get("entities", []):
            if e["entity_type"] == "PRODUCT":
                products[e["entity_text"]] += 1
            elif e["entity_type"] == "LOCATION":
                locations[e["entity_text"]] += 1

    affected_products = [{"product": k, "count": v} for k, v in products.most_common(6)]
    affected_locations = [{"location": k, "count": v} for k, v in locations.most_common(6)]

    possible_root_causes = [
        {
            "pattern_name": r["cluster_name"],
            "associated_factor": r["possible_root_cause"],
            "affected_entity": r.get("affected_entity"),
            "affected_location": r.get("affected_location"),
            "count": r["complaint_count"],
            "recommendation": r.get("recommended_action")
        }
        for r in recurring_all[:6] if r.get("possible_root_cause")
    ]

    return IntelligenceTrends(
        trends=volume_trends,
        top_intents=top_intents,
        top_categories=top_categories,
        department_workload=dept_workload,
        affected_products=affected_products,
        affected_locations=affected_locations,
        possible_root_causes=possible_root_causes,
        recurring_issues=recurring_all,
        emerging_issues=emerging
    )

@router.get("/intelligence/recurring")
def get_recurring_issues_endpoint(workspace_id: str = Query(...), db: Session = Depends(get_db)):
    tickets = db.query(Ticket).filter(Ticket.workspace_id == workspace_id).all()
    ticket_dicts = [
        {"id": t.id, "category": t.category, "intent": t.intent, "created_at": t.created_at, "message": t.message, "subject": t.subject}
        for t in tickets
    ]
    return analyze_recurring_issues(ticket_dicts)

@router.get("/intelligence/emerging")
def get_emerging_issues_endpoint(workspace_id: str = Query(...), db: Session = Depends(get_db)):
    tickets = db.query(Ticket).filter(Ticket.workspace_id == workspace_id).all()
    ticket_dicts = [
        {"id": t.id, "category": t.category, "intent": t.intent, "created_at": t.created_at, "message": t.message, "subject": t.subject}
        for t in tickets
    ]
    all_issues = analyze_recurring_issues(ticket_dicts)
    return [i for i in all_issues if i.get("is_emerging")]
