import pytest
from app.database.session import SessionLocal, Base, engine
from app.models.ticket import Ticket
from app.models.workspace import Workspace
from app.models.knowledge import KnowledgeDocument
from app.repositories.ticket_repository import TicketRepository
from app.repositories.knowledge_repository import KnowledgeRepository
from app.repositories.feedback_repository import FeedbackRepository
from app.nlp.duplicates import detect_duplicate
from app.nlp.explainability import explain_classification
from app.knowledge.gap_detector import detect_knowledge_gaps
from app.response_generator.generator import generate_response_draft, check_response_quality

@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    yield db
    db.close()

def test_ticket_repository_kpis(db_session):
    repo = TicketRepository(db_session)
    kpis = repo.get_kpis("shopease", days=30)
    assert "total_complaints" in kpis
    assert "open_complaints" in kpis
    assert "critical_complaints" in kpis
    assert "escalated_complaints" in kpis
    assert kpis["period_days"] == 30

def test_duplicate_detection():
    candidates = [
        {
            "id": "TKT-101",
            "subject": "Delayed order delivery",
            "message": "My package with express courier has not arrived for 7 days. Where is my parcel?",
            "customer_name": "Rohan Verma",
            "status": "open",
            "created_at": "2026-09-10"
        }
    ]
    # Exact/near duplicate query
    query = "Delayed order delivery! My package with express courier has not arrived for 7 days. Where is my parcel?"
    res = detect_duplicate(query, target_id="TKT-NEW", candidate_tickets=candidates, threshold=0.75)
    assert res is not None
    assert res["is_duplicate"] is True
    assert res["matched_ticket_id"] == "TKT-101"

    # Completely different text
    diff_query = "Cannot reset my account password using SMS verification code"
    diff_res = detect_duplicate(diff_query, target_id="TKT-NEW", candidate_tickets=candidates, threshold=0.75)
    assert diff_res is None

def test_nlp_explainability():
    text = "I demand an immediate refund for double charge on my credit card. This is fraud!"
    explanation = explain_classification(text, category="Billing & Refund")
    assert "top_terms" in explanation
    assert "reasoning_factors" in explanation
    assert len(explanation["reasoning_factors"]) > 0

def test_response_tone_and_quality():
    tones = ["Professional", "Empathetic", "Concise", "Formal"]
    for tone in tones:
        draft = generate_response_draft(
            customer_name="Priya Sharma",
            subject="Damaged laptop delivered",
            category="Product Defect",
            intent="Request Replacement",
            sentiment="Negative",
            emotional_tone="Frustrated",
            urgency_level="High",
            recommended_action="Dispatch replacement unit",
            retrieved_knowledge=[{"title": "Return Policy", "snippet": "Replacements dispatched within 48 hours"}],
            tone=tone
        )
        assert len(draft) > 30
        quality = check_response_quality(draft, intent="Request Replacement", retrieved_knowledge=[{"title": "Return Policy"}])
        assert quality["score_pct"] >= 75
        assert quality["is_ready_to_send"] is True

def test_knowledge_gap_detector():
    clusters = [
        {
            "cluster_id": 99,
            "cluster_title": "Unlisted Drone Battery Failure",
            "dominant_category": "Hardware",
            "common_intent": "Report Defect",
            "summary": "Battery overheating during flight in hot weather",
            "ticket_count": 8,
            "average_urgency_level": "critical"
        }
    ]
    docs = [
        KnowledgeDocument(id=1, workspace_id="test", title="Standard Refund Policy", filename="refund.txt", content="Refunds take 5 days.")
    ]
    gaps = detect_knowledge_gaps(clusters, docs, threshold=0.35)
    assert len(gaps) == 1
    assert gaps[0]["cluster_title"] == "Unlisted Drone Battery Failure"
    assert gaps[0]["gap_severity"] == "High"

def test_feedback_repository(db_session):
    repo = FeedbackRepository(db_session)
    metrics = repo.get_feedback_metrics()
    assert "total_feedback_records" in metrics
    assert "category_corrections" in metrics
