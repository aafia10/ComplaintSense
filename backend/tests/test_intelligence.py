import pytest
from app.intelligence.trends import calculate_time_series_trends, calculate_period_over_period
from app.intelligence.root_cause import detect_root_cause_patterns
from app.intelligence.recurring import analyze_recurring_issues

def test_trend_calculation():
    tickets = [
        {"id": "1", "created_at": "2026-09-20T10:00:00", "sentiment": "Negative", "subject": "Delay", "message": "Late delivery"},
        {"id": "2", "created_at": "2026-09-20T11:00:00", "sentiment": "Positive", "subject": "Good", "message": "Great service"},
        {"id": "3", "created_at": "2026-09-21T12:00:00", "sentiment": "Negative", "subject": "Broken", "message": "Damaged screen"}
    ]
    trends = calculate_time_series_trends(tickets)
    assert len(trends) == 2
    assert trends[0]["count"] == 2
    assert trends[0]["positive"] == 1
    assert trends[0]["negative"] == 1

def test_period_over_period():
    tickets = [
        {"created_at": "2026-09-25T10:00:00"},
        {"created_at": "2026-09-24T10:00:00"},
        {"created_at": "2026-09-10T10:00:00"},
    ]
    res = calculate_period_over_period(tickets, days_window=7)
    assert "change_pct" in res
    assert res["current_period_count"] == 2
    assert res["previous_period_count"] == 0

def test_root_cause_pattern():
    tickets = [
        {
            "subject": "SpeedFast courier delay in Mumbai",
            "message": "Express Delivery with SpeedFast Logistics has been delayed in Mumbai for 3 days",
            "entities": [
                {"entity_type": "LOCATION", "entity_text": "Mumbai"},
                {"entity_type": "ORGANIZATION", "entity_text": "SpeedFast Logistics"}
            ]
        },
        {
            "subject": "Still waiting in Mumbai",
            "message": "SpeedFast Logistics tracking stuck at Mumbai hub",
            "entities": [
                {"entity_type": "LOCATION", "entity_text": "Mumbai"},
                {"entity_type": "ORGANIZATION", "entity_text": "SpeedFast Logistics"}
            ]
        }
    ]
    hypothesis = detect_root_cause_patterns("Delivery Delays", tickets)
    assert hypothesis["confidence_label"] == "Possible root-cause pattern"
    assert "Mumbai" in str(hypothesis["affected_location"])
    assert "SpeedFast Logistics" in str(hypothesis["affected_entity"])
