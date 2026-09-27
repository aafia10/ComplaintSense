import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.database.session import get_db
from app.models import Ticket, Prediction, Entity, SimilarComplaint, TicketResponse, KnowledgeDocument
from app.schemas.ticket import TicketCreate, TicketUpdate, TicketListItem, TicketDetail
from app.schemas.nlp import FullAnalysisResult, SimilarTicketResult, EntityResult, KnowledgeDocResult
from app.services.ticket_service import process_ticket_nlp
from app.knowledge.retriever import retrieve_relevant_knowledge
from app.response_generator.generator import generate_response_draft

router = APIRouter(prefix="/tickets", tags=["tickets"])

@router.get("", response_model=List[TicketListItem])
def list_tickets(
    workspace_id: str = Query(..., description="Workspace ID"),
    category: Optional[str] = None,
    intent: Optional[str] = None,
    sentiment: Optional[str] = None,
    urgency_level: Optional[str] = None,
    department: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(Ticket).filter(Ticket.workspace_id == workspace_id)

    if category:
        query = query.filter(Ticket.category == category)
    if intent:
        query = query.filter(Ticket.intent == intent)
    if sentiment:
        query = query.filter(Ticket.sentiment == sentiment)
    if urgency_level:
        query = query.filter(Ticket.urgency_level == urgency_level)
    if department:
        query = query.filter(or_(Ticket.assigned_department == department, Ticket.recommended_department == department))
    if status:
        query = query.filter(Ticket.status == status)

    if search:
        search_filter = f"%{search}%"
        # Search by customer name, email, subject, message, or id
        query = query.filter(
            or_(
                Ticket.customer_name.ilike(search_filter),
                Ticket.customer_email.ilike(search_filter),
                Ticket.subject.ilike(search_filter),
                Ticket.message.ilike(search_filter),
                Ticket.id.ilike(search_filter)
            )
        )

    tickets = query.order_by(desc(Ticket.created_at)).offset(offset).limit(limit).all()
    return tickets

@router.post("", response_model=TicketDetail)
def create_ticket(ticket_in: TicketCreate, db: Session = Depends(get_db)):
    t_id = f"TKT-{str(uuid.uuid4())[:8].upper()}"
    new_ticket = Ticket(
        id=t_id,
        workspace_id=ticket_in.workspace_id,
        customer_name=ticket_in.customer_name,
        customer_email=ticket_in.customer_email,
        subject=ticket_in.subject,
        message=ticket_in.message,
        created_at=ticket_in.created_at or datetime.utcnow(),
        status=ticket_in.status or "open"
    )
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    # Trigger full NLP processing pipeline
    process_ticket_nlp(db, new_ticket)

    # Return complete ticket detail
    return get_ticket_detail(t_id, db)

@router.get("/{id}", response_model=TicketDetail)
def get_ticket(id: str, db: Session = Depends(get_db)):
    return get_ticket_detail(id, db)

def get_ticket_detail(ticket_id: str, db: Session) -> TicketDetail:
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Fetch entities
    entities_db = db.query(Entity).filter(Entity.ticket_id == ticket.id).all()
    entities = [
        EntityResult(
            entity_type=e.entity_type,
            entity_text=e.entity_text,
            start_char=e.start_char,
            end_char=e.end_char
        )
        for e in entities_db
    ]

    # Fetch similar complaints
    sim_db = db.query(SimilarComplaint).filter(SimilarComplaint.ticket_id == ticket.id).all()
    similar_list = []
    for s in sim_db:
        sim_ticket = db.query(Ticket).filter(Ticket.id == s.similar_ticket_id).first()
        if sim_ticket:
            similar_list.append(SimilarTicketResult(
                ticket_id=sim_ticket.id,
                similarity_score=s.similarity_score,
                subject=sim_ticket.subject,
                category=sim_ticket.category,
                status=sim_ticket.status,
                created_at=str(sim_ticket.created_at),
                snippet=(sim_ticket.message or "")[:140] + ("..." if len(sim_ticket.message or "") > 140 else "")
            ))

    # Fetch response draft
    resp_db = db.query(TicketResponse).filter(TicketResponse.ticket_id == ticket.id).first()
    response_draft = None
    if resp_db:
        response_draft = {
            "draft_text": resp_db.draft_text,
            "edited_text": resp_db.edited_text,
            "is_approved": resp_db.is_approved,
            "recommended_action": resp_db.recommended_action
        }

    # Fetch retrieved knowledge docs
    full_text = f"{ticket.subject}. {ticket.message}"
    db_docs = db.query(KnowledgeDocument).filter(KnowledgeDocument.workspace_id == ticket.workspace_id).all()
    db_docs_dicts = [
        {"id": d.id, "title": d.title, "filename": d.filename, "category": d.category, "content": d.content}
        for d in db_docs
    ]
    retrieved = retrieve_relevant_knowledge(full_text, ticket.workspace_id, db_docs_dicts, top_k=3)
    knowledge_results = [
        KnowledgeDocResult(
            id=k["id"],
            title=k["title"],
            filename=k["filename"],
            similarity=k["similarity"],
            snippet=k["snippet"],
            category=k.get("category")
        )
        for k in retrieved
    ]

    return TicketDetail(
        id=ticket.id,
        workspace_id=ticket.workspace_id,
        customer_name=ticket.customer_name,
        customer_email=ticket.customer_email,
        subject=ticket.subject,
        message=ticket.message,
        category=ticket.category,
        intent=ticket.intent,
        sentiment=ticket.sentiment,
        sentiment_score=ticket.sentiment_score,
        emotional_tone=ticket.emotional_tone,
        urgency_level=ticket.urgency_level,
        urgency_score=ticket.urgency_score,
        urgency_signals=ticket.urgency_signals or [],
        assigned_department=ticket.assigned_department,
        recommended_department=ticket.recommended_department,
        recommended_action=ticket.recommended_action,
        status=ticket.status,
        priority=ticket.priority,
        escalation_reason=ticket.escalation_reason,
        created_at=ticket.created_at,
        entities=entities,
        similar_complaints=similar_list,
        response_draft=response_draft,
        relevant_knowledge=knowledge_results,
        preprocessed_tokens=ticket.preprocessed_tokens or [],
        lemmatized_text=ticket.lemmatized_text
    )

@router.put("/{id}")
def update_ticket(id: str, update_in: TicketUpdate, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if update_in.assigned_department is not None:
        ticket.assigned_department = update_in.assigned_department
    if update_in.status is not None:
        ticket.status = update_in.status
    if update_in.priority is not None:
        ticket.priority = update_in.priority
    if update_in.category is not None:
        ticket.category = update_in.category
    if update_in.escalation_reason is not None:
        ticket.escalation_reason = update_in.escalation_reason

    db.commit()
    db.refresh(ticket)
    return {"status": "success", "ticket_id": ticket.id}

@router.post("/{id}/analyze")
def analyze_ticket(id: str, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    result = process_ticket_nlp(db, ticket)
    return result

@router.get("/{id}/analysis")
def get_ticket_analysis(id: str, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    full_text = f"{ticket.subject}. {ticket.message}"
    result = process_ticket_nlp(db, ticket, save_to_db=False)
    return result

@router.get("/{id}/similar")
def get_ticket_similar(id: str, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    sims = db.query(SimilarComplaint).filter(SimilarComplaint.ticket_id == ticket.id).all()
    res = []
    for s in sims:
        st = db.query(Ticket).filter(Ticket.id == s.similar_ticket_id).first()
        if st:
            res.append({
                "ticket_id": st.id,
                "similarity_score": s.similarity_score,
                "subject": st.subject,
                "category": st.category,
                "status": st.status,
                "created_at": str(st.created_at),
                "snippet": (st.message or "")[:140]
            })
    return res

@router.get("/{id}/entities")
def get_ticket_entities(id: str, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    ents = db.query(Entity).filter(Entity.ticket_id == ticket.id).all()
    return ents

@router.post("/{id}/generate-response")
def generate_response_endpoint(
    id: str,
    action_override: Optional[str] = Body(None, embed=True),
    db: Session = Depends(get_db)
):
    ticket = db.query(Ticket).filter(Ticket.id == id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    full_text = f"{ticket.subject}. {ticket.message}"
    db_docs = db.query(KnowledgeDocument).filter(KnowledgeDocument.workspace_id == ticket.workspace_id).all()
    db_docs_dicts = [
        {"id": d.id, "title": d.title, "filename": d.filename, "category": d.category, "content": d.content}
        for d in db_docs
    ]
    retrieved = retrieve_relevant_knowledge(full_text, ticket.workspace_id, db_docs_dicts, top_k=3)

    draft = generate_response_draft(
        customer_name=ticket.customer_name,
        subject=ticket.subject,
        category=ticket.category or "General",
        intent=ticket.intent or "Report Problem",
        sentiment=ticket.sentiment or "Neutral",
        emotional_tone=ticket.emotional_tone or "Neutral",
        urgency_level=ticket.urgency_level or "Medium",
        recommended_action=action_override or ticket.recommended_action or "Review complaint",
        retrieved_knowledge=retrieved
    )

    resp = db.query(TicketResponse).filter(TicketResponse.ticket_id == ticket.id).first()
    if not resp:
        resp = TicketResponse(
            ticket_id=ticket.id,
            draft_text=draft,
            recommended_action=action_override or ticket.recommended_action,
            is_approved=False
        )
        db.add(resp)
    else:
        resp.draft_text = draft
        resp.recommended_action = action_override or ticket.recommended_action
    
    db.commit()
    return {"draft_text": draft}

@router.post("/{id}/approve-response")
def approve_response(
    id: str,
    edited_text: Optional[str] = Body(None, embed=True),
    db: Session = Depends(get_db)
):
    ticket = db.query(Ticket).filter(Ticket.id == id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    resp = db.query(TicketResponse).filter(TicketResponse.ticket_id == ticket.id).first()
    if resp:
        resp.is_approved = True
        if edited_text is not None:
            resp.edited_text = edited_text
        db.commit()
    return {"status": "approved", "ticket_id": ticket.id}

@router.post("/{id}/escalate")
def escalate_ticket(
    id: str,
    reason: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    ticket = db.query(Ticket).filter(Ticket.id == id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    ticket.status = "escalated"
    ticket.escalation_reason = reason
    ticket.priority = "critical"
    db.commit()
    return {"status": "escalated", "ticket_id": ticket.id}

@router.post("/{id}/resolve")
def resolve_ticket(id: str, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    ticket.status = "resolved"
    db.commit()
    return {"status": "resolved", "ticket_id": ticket.id}
