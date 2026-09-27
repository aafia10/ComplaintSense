import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_get_workspaces():
    response = client.get("/api/workspaces")
    assert response.status_code == 200
    workspaces = response.json()
    assert len(workspaces) >= 4
    ws_ids = [w["id"] for w in workspaces]
    assert "shopease" in ws_ids
    assert "clouddesk" in ws_ids

def test_get_dashboard_stats():
    response = client.get("/api/dashboard/stats?workspace_id=shopease")
    assert response.status_code == 200
    data = response.json()
    assert "total_complaints" in data
    assert data["total_complaints"] > 0
    assert "sentiment_distribution" in data
    assert "volume_trends" in data

def test_create_and_fetch_ticket():
    ticket_payload = {
        "workspace_id": "shopease",
        "customer_name": "Test Customer",
        "customer_email": "test@customer.com",
        "subject": "Delivery delayed for order #ORD99182",
        "message": "SpeedFast Logistics delay in Mumbai for order #ORD99182. Need delivery immediately!"
    }
    response = client.post("/api/tickets", json=ticket_payload)
    assert response.status_code == 200
    ticket_data = response.json()
    assert ticket_data["id"].startswith("TKT-")
    assert ticket_data["category"] is not None
    assert ticket_data["intent"] is not None
    assert ticket_data["urgency_level"] in ["Low", "Medium", "High", "Critical"]
    assert ticket_data["response_draft"] is not None

    # Fetch detail
    detail_res = client.get(f"/api/tickets/{ticket_data['id']}")
    assert detail_res.status_code == 200
    assert detail_res.json()["customer_name"] == "Test Customer"

def test_evaluation_metrics():
    response = client.get("/api/evaluation")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    assert "Linear SVM" in data["models"]
    assert "confusion_matrix" in data
