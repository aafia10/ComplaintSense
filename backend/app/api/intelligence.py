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

from app.intelligence.products import get_product_intelligence
from app.intelligence.customers import get_customer_intelligence
from app.repositories.ticket_repository import TicketRepository

@router.get("/intelligence/products")
def get_products_endpoint(workspace_id: str = Query(...), db: Session = Depends(get_db)):
    return get_product_intelligence(db, workspace_id)

@router.get("/intelligence/customers")
def get_customers_endpoint(workspace_id: str = Query(...), db: Session = Depends(get_db)):
    return get_customer_intelligence(db, workspace_id)

@router.get("/intelligence/overview")
def get_overview_endpoint(
    workspace_id: str = Query(...),
    days: int = Query(30),
    db: Session = Depends(get_db)
):
    repo = TicketRepository(db)
    kpis = repo.get_kpis(workspace_id, days=days)
    needs_attention = repo.get_needs_attention(workspace_id, limit=5)
    
    # Needs attention serialized
    serialized_attention = [
        {
            "id": t.id,
            "customer_name": t.customer_name,
            "subject": t.subject,
            "category": t.category,
            "intent": t.intent,
            "urgency_level": t.urgency_level,
            "urgency_score": t.urgency_score,
            "status": t.status,
            "created_at": str(t.created_at)
        }
        for t in needs_attention
    ]

    # Get tickets for charts
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
    volume_trends = calculate_time_series_trends(ticket_dicts)
    recurring_all = analyze_recurring_issues(ticket_dicts)
    emerging = [r for r in recurring_all if r.get("is_emerging")]
    emerging_card = emerging[0] if emerging else (recurring_all[0] if recurring_all else None)

    # Top drivers (percentage of total)
    total_count = len(tickets)
    cat_counts = Counter([t.category for t in tickets if t.category])
    top_drivers = [
        {
            "category": cat,
            "count": count,
            "percentage": round((count / total_count * 100), 1) if total_count else 0
        }
        for cat, count in cat_counts.most_common(5)
    ]

    sent_counts = Counter([t.sentiment for t in tickets if t.sentiment])
    sentiment_breakdown = [
        {
            "sentiment": s.capitalize(),
            "count": cnt,
            "percentage": round((cnt / total_count * 100), 1) if total_count else 0
        }
        for s, cnt in sent_counts.items()
    ]

    return {
        "kpis": kpis,
        "volume_trends": volume_trends,
        "top_drivers": top_drivers,
        "sentiment_breakdown": sentiment_breakdown,
        "needs_attention": serialized_attention,
        "emerging_issue": emerging_card
    }

@router.get("/intelligence/clusters/{cluster_name}/complaints")
def get_cluster_complaints(
    cluster_name: str,
    workspace_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Returns complaints matching a recurring issue cluster name or associated keywords.
    """
    tickets = db.query(Ticket).filter(Ticket.workspace_id == workspace_id).all()
    c_lower = cluster_name.lower()
    
    # Split cluster name into searchable terms
    terms = [w for w in c_lower.replace("&", " ").replace("-", " ").split() if len(w) > 3]
    
    matched = []
    for t in tickets:
        txt = f"{t.subject} {t.message} {t.category or ''} {t.intent or ''}".lower()
        if any(term in txt for term in terms):
            matched.append({
                "id": t.id,
                "customer_name": t.customer_name,
                "subject": t.subject,
                "category": t.category,
                "intent": t.intent,
                "sentiment": t.sentiment,
                "urgency_level": t.urgency_level,
                "urgency_score": t.urgency_score,
                "status": t.status,
                "created_at": str(t.created_at)
            })

    return {"cluster_name": cluster_name, "count": len(matched), "complaints": matched[:25]}
