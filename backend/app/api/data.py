import os
import io
import csv
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from app.database.session import get_db, DB_PATH
from app.models.ticket import Ticket
from app.models.workspace import Workspace
from app.repositories.ticket_repository import TicketRepository
from app.nlp.preprocessing import preprocess_complaint
from app.nlp.classification import classify_complaint
from app.nlp.intent import detect_intent
from app.nlp.sentiment import analyze_sentiment
from app.nlp.urgency import calculate_urgency
from app.nlp.ner import extract_entities
from app.routing.department import route_department

router = APIRouter(prefix="/data", tags=["data-management"])

@router.get("/export-db")
def export_database():
    """Streams a direct backup copy of the SQLite database file."""
    if not os.path.exists(DB_PATH):
        raise HTTPException(status_code=404, detail="Database file not found")
    
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    return FileResponse(
        path=DB_PATH,
        media_type="application/x-sqlite3",
        filename=f"complaintsense_backup_{timestamp}.db"
    )

@router.get("/export-csv")
def export_csv(
    workspace_id: str = Query(...),
    status: str = Query(None),
    category: str = Query(None),
    db: Session = Depends(get_db)
):
    """Generates and streams a CSV export of complaints for the given workspace."""
    repo = TicketRepository(db)
    tickets, _ = repo.get_filtered_tickets(
        workspace_id=workspace_id,
        status=status,
        category=category,
        limit=5000
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Ticket ID",
        "Date",
        "Customer Name",
        "Customer Email",
        "Subject",
        "Message",
        "Category",
        "Intent",
        "Sentiment",
        "Urgency Level",
        "Urgency Score",
        "Status",
        "Assigned Department",
    ])

    for t in tickets:
        writer.writerow([
            t.id,
            t.created_at.strftime("%Y-%m-%d %H:%M:%S") if t.created_at else "",
            t.customer_name,
            t.customer_email,
            t.subject,
            t.message,
            t.category or "",
            t.intent or "",
            t.sentiment or "",
            t.urgency_level or "",
            t.urgency_score or "",
            t.status,
            t.assigned_department or t.recommended_department or "",
        ])

    output.seek(0)
    filename = f"complaints_{workspace_id}_{datetime.utcnow().strftime('%Y%m%d')}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.post("/validate-csv")
async def validate_csv(file: UploadFile = File(...)):
    """
    Validates CSV file headers and returns a preview of detected columns and first 5 rows.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    content = await file.read()
    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = content.decode("latin-1")

    reader = csv.DictReader(io.StringIO(text))
    fieldnames = reader.fieldnames or []
    
    rows = []
    for i, row in enumerate(reader):
        if i >= 5:
            break
        rows.append(row)

    # Check for core required fields (or fuzzy matches)
    fnames_lower = [f.lower().strip() for f in fieldnames]
    has_message = any(k in fnames_lower for k in ["message", "complaint", "description", "body", "text"])
    has_subject = any(k in fnames_lower for k in ["subject", "title", "issue"])
    has_customer = any(k in fnames_lower for k in ["customer", "customer_name", "name", "client"])

    return {
        "filename": file.filename,
        "total_columns": len(fieldnames),
        "columns": fieldnames,
        "preview_rows": rows,
        "is_valid": has_message or has_subject,
        "detected_mapping": {
            "message_column": next((f for f in fieldnames if any(k in f.lower() for k in ["message", "complaint", "description", "text"])), None),
            "subject_column": next((f for f in fieldnames if any(k in f.lower() for k in ["subject", "title", "issue"])), None),
            "customer_column": next((f for f in fieldnames if any(k in f.lower() for k in ["customer", "name", "user"])), None),
            "email_column": next((f for f in fieldnames if any(k in f.lower() for k in ["email", "mail"])), None),
        }
    }

@router.post("/bulk-import")
async def bulk_import_csv(
    workspace_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Imports complaints from CSV, executes NLP analysis on each, and persists to DB.
    """
    content = await file.read()
    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = content.decode("latin-1")

    reader = csv.DictReader(io.StringIO(text))
    imported_tickets = []
    
    import uuid
    for i, row in enumerate(reader):
        if i >= 200:  # Safety cap for local import
            break
        
        # Extract fields flexibly
        subject = row.get("Subject") or row.get("subject") or row.get("Title") or row.get("title") or "Customer Complaint"
        message = row.get("Message") or row.get("message") or row.get("Description") or row.get("description") or row.get("Complaint") or ""
        customer_name = row.get("Customer Name") or row.get("customer_name") or row.get("Name") or row.get("name") or f"Customer #{i+1}"
        customer_email = row.get("Customer Email") or row.get("customer_email") or row.get("Email") or row.get("email") or f"customer_{i+1}@example.com"

        if not message and not subject:
            continue

        full_text = f"{subject}. {message}"
        t_id = f"IMP-{str(uuid.uuid4())[:8].upper()}"

        # Run fast NLP pipeline
        prep = preprocess_complaint(full_text)
        preds = classify_complaint(prep["lemmatized"])
        top_cat = preds[0]["predicted_category"] if preds else "General Inquiry"
        intent_res = detect_intent(full_text)
        sentiment_res = analyze_sentiment(full_text)
        urgency_res = calculate_urgency(full_text, sentiment_score=sentiment_res["compound_score"])
        routing_res = route_department(top_cat, intent_res["primary_intent"])

        ticket = Ticket(
            id=t_id,
            workspace_id=workspace_id,
            customer_name=customer_name,
            customer_email=customer_email,
            subject=subject,
            message=message,
            category=top_cat,
            intent=intent_res["primary_intent"],
            sentiment=sentiment_res["sentiment_label"],
            sentiment_score=sentiment_res["compound_score"],
            emotional_tone=sentiment_res["emotional_tone"],
            urgency_score=urgency_res["urgency_score"],
            urgency_level=urgency_res["urgency_level"].lower(),
            urgency_signals=urgency_res["signals_detected"],
            recommended_department=routing_res["recommended_department"],
            assigned_department=routing_res["recommended_department"],
            recommended_action=routing_res["recommended_action"],
            status="open",
            priority=urgency_res["urgency_level"].lower(),
            preprocessed_tokens=prep["tokens"],
            lemmatized_text=prep["lemmatized"],
            created_at=datetime.utcnow()
        )
        db.add(ticket)
        imported_tickets.append(t_id)

    db.commit()
    return {
        "status": "success",
        "imported_count": len(imported_tickets),
        "workspace_id": workspace_id,
        "sample_ids": imported_tickets[:5]
    }

@router.post("/reset-demo")
def reset_demo_data(db: Session = Depends(get_db)):
    """
    Executes seed_demo logic to refresh workspace demo complaints to pristine state.
    """
    from scripts.seed_demo import seed_all
    try:
        seed_all()
        return {"status": "success", "message": "Demo data successfully reset to pristine baseline"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reset demo failed: {str(e)}")
