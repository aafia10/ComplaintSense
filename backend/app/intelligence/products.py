from typing import List, Dict, Any
from collections import defaultdict
from sqlalchemy.orm import Session
from app.models.ticket import Ticket
from app.models.nlp_results import Entity

def get_product_intelligence(db: Session, workspace_id: str) -> List[Dict[str, Any]]:
    """
    Aggregates complaint analytics by product:
    Volume, average urgency, dominant category, negative sentiment percentage, and risk score.
    """
    tickets = db.query(Ticket).filter(Ticket.workspace_id == workspace_id).all()
    if not tickets:
        return []

    # Map tickets by id
    ticket_map = {t.id: t for t in tickets}

    # Query product entities
    product_entities = (
        db.query(Entity)
        .join(Ticket)
        .filter(Ticket.workspace_id == workspace_id, Entity.entity_type == "PRODUCT")
        .all()
    )

    product_data = defaultdict(lambda: {
        "ticket_ids": set(),
        "categories": defaultdict(int),
        "intents": defaultdict(int),
        "urgency_scores": [],
        "sentiments": defaultdict(int)
    })

    for ent in product_entities:
        clean_name = ent.entity_value.strip().title()
        if len(clean_name) < 3:
            continue
        p = product_data[clean_name]
        p["ticket_ids"].add(ent.ticket_id)
        t = ticket_map.get(ent.ticket_id)
        if t:
            if t.category:
                p["categories"][t.category] += 1
            if t.intent:
                p["intents"][t.intent] += 1
            if t.urgency_score is not None:
                p["urgency_scores"].append(t.urgency_score)
            if t.sentiment:
                p["sentiments"][t.sentiment] += 1

    # Fallback / heuristic scan if entities table is sparse
    if len(product_data) < 2:
        keywords = ["Pro Headphones", "Ultra Smartphone", "Smart Watch", "Cloud Plan Enterprise", "Fiber Broadband", "4G SIM Card", "SpeedFast Express", "Express Delivery"]
        for t in tickets:
            full_text = f"{t.subject} {t.message}".lower()
            for kw in keywords:
                if kw.lower() in full_text:
                    p = product_data[kw]
                    p["ticket_ids"].add(t.id)
                    if t.category:
                        p["categories"][t.category] += 1
                    if t.intent:
                        p["intents"][t.intent] += 1
                    if t.urgency_score is not None:
                        p["urgency_scores"].append(t.urgency_score)
                    if t.sentiment:
                        p["sentiments"][t.sentiment] += 1

    result = []
    for prod_name, data in product_data.items():
        count = len(data["ticket_ids"])
        if count == 0:
            continue
        avg_urgency = round(sum(data["urgency_scores"]) / len(data["urgency_scores"]), 1) if data["urgency_scores"] else 50.0
        dominant_cat = max(data["categories"], key=data["categories"].get) if data["categories"] else "General"
        top_intent = max(data["intents"], key=data["intents"].get) if data["intents"] else "Inquiry"
        neg_count = data["sentiments"].get("negative", 0)
        neg_pct = round((neg_count / count) * 100, 1) if count else 0.0

        # Risk score calculated from volume, urgency, and negative sentiment ratio
        risk_score = round((count * 1.5) + (avg_urgency * 0.4) + (neg_pct * 0.2), 1)

        result.append({
            "product_name": prod_name,
            "complaint_count": count,
            "average_urgency": avg_urgency,
            "dominant_category": dominant_cat,
            "top_intent": top_intent,
            "negative_sentiment_pct": neg_pct,
            "risk_score": risk_score,
            "severity": "High" if risk_score > 60 else ("Medium" if risk_score > 35 else "Low")
        })

    # Sort descending by risk score
    result.sort(key=lambda x: x["risk_score"], reverse=True)
    return result
