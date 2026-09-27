import pytest
from app.nlp.preprocessing import clean_text, tokenize, remove_stopwords, lemmatize_token, preprocess_complaint
from app.nlp.sentiment import analyze_sentiment
from app.nlp.urgency import calculate_urgency
from app.nlp.intent import detect_intent
from app.nlp.ner import extract_entities
from app.nlp.classification import classify_complaint
from app.nlp.similarity import find_similar_complaints

def test_preprocessing():
    raw = "<p>Order #ORD12345 was <b>delayed</b>! https://example.com</p>"
    res = preprocess_complaint(raw)
    assert "delayed" in res["tokens"]
    assert "https" not in res["cleaned"]
    assert "<p>" not in res["cleaned"]
    assert len(res["stopwords_removed"]) > 0

def test_sentiment_analysis():
    neg_res = analyze_sentiment("I am furious and extremely frustrated with this terrible delay!")
    assert neg_res["sentiment"] == "Negative"
    assert neg_res["score"] < 0
    assert neg_res["emotional_tone"] in ["Angry", "Frustrated"]

    pos_res = analyze_sentiment("Thank you so much! Excellent support and very fast resolution.")
    assert pos_res["sentiment"] == "Positive"
    assert pos_res["score"] > 0

def test_urgency_signals():
    # Legal & time pressure signal
    res = calculate_urgency("I will file a case in Consumer Court immediately unless resolved today!")
    assert res["score"] >= 50
    assert res["level"] in ["High", "Critical"]
    signal_types = [s["type"] for s in res["signals"]]
    assert "Legal" in signal_types or "Time pressure" in signal_types

def test_intent_detection():
    assert detect_intent("I want my money back for this returned shoes") == "Request Refund"
    assert detect_intent("Please replace my broken unit with a new piece") == "Request Replacement"
    assert detect_intent("Where is my package? When will it arrive?") == "Track Order"
    assert detect_intent("Charged twice on credit card") == "Report Payment Problem"

def test_named_entity_recognition():
    text = "My ₹45,000 iPhone order #ORD28491 has not arrived in Mumbai."
    ents = extract_entities(text)
    ent_types = {e["entity_type"]: e["entity_text"] for e in ents}
    assert "ORDER_ID" in ent_types or any("#ORD" in e["entity_text"] for e in ents)
    assert "MONEY" in ent_types
    assert "LOCATION" in ent_types
    assert any("Mumbai" in e["entity_text"] for e in ents)

def test_classification():
    text = "Package delayed in transit with delivery partner. Need shipment today."
    preds = classify_complaint(text)
    assert len(preds) > 0
    top_pred = preds[0]
    assert "predicted_category" in top_pred
    assert "confidence" in top_pred

def test_similarity_search():
    target = "SpeedFast courier is delayed in Mumbai"
    candidates = [
        {"id": "T1", "subject": "SpeedFast courier delay in Mumbai hub", "message": "Still waiting for delivery in Mumbai", "category": "Delivery & Logistics", "status": "open", "created_at": "2026-09-20"},
        {"id": "T2", "subject": "Password reset issue", "message": "Cannot login to corporate email", "category": "Account & Login", "status": "resolved", "created_at": "2026-09-21"}
    ]
    matches = find_similar_complaints(target, candidates, top_k=2)
    assert len(matches) > 0
    assert matches[0]["ticket_id"] == "T1"
    assert matches[0]["similarity_score"] > 0.2
