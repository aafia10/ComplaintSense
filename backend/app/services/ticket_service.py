from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models import Ticket, Prediction, Entity, SimilarComplaint, TicketResponse, KnowledgeDocument
from app.nlp.preprocessing import preprocess_complaint
from app.nlp.classification import classify_complaint
from app.nlp.intent import detect_intent
from app.nlp.sentiment import analyze_sentiment
from app.nlp.urgency import calculate_urgency
from app.nlp.ner import extract_entities
from app.nlp.similarity import find_similar_complaints
from app.routing.department import recommend_department_and_action
from app.knowledge.retriever import retrieve_relevant_knowledge
from app.response_generator.generator import generate_response_draft

def process_ticket_nlp(
    db: Session,
    ticket: Ticket,
    candidate_tickets: List[Dict[str, Any]] = None,
    save_to_db: bool = True
) -> Dict[str, Any]:
    """
    Executes the complete ComplaintSense NLP Pipeline:
    1. Preprocessing (Tokens, Stopwords, Lemmatization)
    2. Category Classification (MultinomialNB, Logistic Regression, Linear SVM)
    3. Customer Intent Detection
    4. Sentiment & Emotional Tone Analysis
    5. Urgency Signal Detection & Scoring (0-100)
    6. Named Entity Recognition
    7. Similar Complaint Detection
    8. Recommended Department & Operational Action
    9. Local Knowledge Document Retrieval
    10. Context-Aware Response Draft Generation
    """
    full_text = f"{ticket.subject}. {ticket.message}"

    # 1. Preprocessing
    preproc = preprocess_complaint(full_text)
    ticket.preprocessed_tokens = preproc["tokens"]
    ticket.lemmatized_text = preproc["lemmatized"]

    # 2. Issue Classification
    preds = classify_complaint(full_text)
    top_pred = preds[0] if preds else {"predicted_category": "General Inquiry", "confidence": 0.5}
    ticket.category = top_pred["predicted_category"]

    # 3. Intent Detection
    intent = detect_intent(full_text, ticket.category)
    ticket.intent = intent

    # 4. Sentiment & Tone
    sentiment_res = analyze_sentiment(full_text)
    ticket.sentiment = sentiment_res["sentiment"]
    ticket.sentiment_score = sentiment_res["score"]
    ticket.emotional_tone = sentiment_res["emotional_tone"]

    # 5. Urgency Detection
    urgency_res = calculate_urgency(full_text, ticket.sentiment_score or 0.0)
    ticket.urgency_score = urgency_res["score"]
    ticket.urgency_level = urgency_res["level"]
    ticket.urgency_signals = urgency_res["signals"]
    ticket.priority = urgency_res["level"].lower()

    # 6. Recommended Department & Action
    rec_dept, rec_action = recommend_department_and_action(ticket.category, ticket.intent, ticket.urgency_level)
    ticket.recommended_department = rec_dept
    if not ticket.assigned_department:
        ticket.assigned_department = rec_dept
    ticket.recommended_action = rec_action

    # 7. Named Entity Recognition
    entities = extract_entities(full_text)

    # 8. Local Knowledge Retrieval
    db_docs = db.query(KnowledgeDocument).filter(KnowledgeDocument.workspace_id == ticket.workspace_id).all()
    db_docs_dicts = [
        {"id": d.id, "title": d.title, "filename": d.filename, "category": d.category, "content": d.content}
        for d in db_docs
    ]
    retrieved_docs = retrieve_relevant_knowledge(full_text, ticket.workspace_id, db_docs_dicts, top_k=3)

    # 9. Similar Complaints
    if candidate_tickets is None:
        other_tickets = db.query(Ticket).filter(
            Ticket.workspace_id == ticket.workspace_id,
            Ticket.id != ticket.id
        ).all()
        candidate_tickets = [
            {"id": t.id, "message": t.message, "subject": t.subject, "category": t.category, "status": t.status, "created_at": t.created_at}
            for t in other_tickets
        ]
    
    similar_res = find_similar_complaints(full_text, candidate_tickets, top_k=5)

    # 10. Response Draft Generation
    draft_text = generate_response_draft(
        customer_name=ticket.customer_name,
        subject=ticket.subject,
        category=ticket.category,
        intent=ticket.intent,
        sentiment=ticket.sentiment,
        emotional_tone=ticket.emotional_tone,
        urgency_level=ticket.urgency_level,
        recommended_action=ticket.recommended_action,
        retrieved_knowledge=retrieved_docs
    )

    if save_to_db:
        # Clear prior predictions and entities if re-analyzing
        db.query(Prediction).filter(Prediction.ticket_id == ticket.id).delete()
        db.query(Entity).filter(Entity.ticket_id == ticket.id).delete()
        db.query(SimilarComplaint).filter(SimilarComplaint.ticket_id == ticket.id).delete()

        # Save predictions
        for p in preds:
            db.add(Prediction(
                ticket_id=ticket.id,
                model_name=p["model_name"],
                predicted_category=p["predicted_category"],
                confidence=p["confidence"],
                all_probabilities=p.get("probabilities", {})
            ))

        # Save entities
        for e in entities:
            db.add(Entity(
                ticket_id=ticket.id,
                entity_type=e["entity_type"],
                entity_text=e["entity_text"],
                start_char=e.get("start_char"),
                end_char=e.get("end_char")
            ))

        # Save similar complaints
        for sim in similar_res:
            db.add(SimilarComplaint(
                ticket_id=ticket.id,
                similar_ticket_id=sim["ticket_id"],
                similarity_score=sim["similarity_score"]
            ))

        # Save or update response draft
        resp = db.query(TicketResponse).filter(TicketResponse.ticket_id == ticket.id).first()
        if not resp:
            resp = TicketResponse(
                ticket_id=ticket.id,
                draft_text=draft_text,
                recommended_action=ticket.recommended_action,
                is_approved=False
            )
            db.add(resp)
        else:
            resp.draft_text = draft_text
            resp.recommended_action = ticket.recommended_action

        db.commit()
        db.refresh(ticket)

    return {
        "preprocessing": preproc,
        "classification": preds,
        "predicted_category": ticket.category,
        "intent": ticket.intent,
        "sentiment": sentiment_res,
        "urgency": urgency_res,
        "entities": entities,
        "similar_complaints": similar_res,
        "recommended_department": ticket.recommended_department,
        "recommended_action": ticket.recommended_action,
        "retrieved_knowledge": retrieved_docs,
        "draft_response": draft_text
    }
