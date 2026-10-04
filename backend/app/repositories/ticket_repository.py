from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, func, desc
from app.models.ticket import Ticket
from app.models.nlp_results import Prediction, Entity, SimilarComplaint, TicketResponse
from app.models.feedback import FeedbackRecord
from app.repositories.base import BaseRepository

class TicketRepository(BaseRepository[Ticket]):
    def __init__(self, db: Session):
        super().__init__(Ticket, db)

    def get_ticket_detail(self, ticket_id: str) -> Optional[Ticket]:
        return (
            self.db.query(Ticket)
            .options(
                joinedload(Ticket.predictions),
                joinedload(Ticket.entities),
                joinedload(Ticket.similar_from).joinedload(SimilarComplaint.similar_ticket),
                joinedload(Ticket.response_draft),
                joinedload(Ticket.feedbacks)
            )
            .filter(Ticket.id == ticket_id)
            .first()
        )

    def get_filtered_tickets(
        self,
        workspace_id: str,
        category: Optional[str] = None,
        intent: Optional[str] = None,
        sentiment: Optional[str] = None,
        urgency: Optional[str] = None,
        department: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        needs_review: Optional[bool] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 50
    ) -> Tuple[List[Ticket], int]:
        query = self.db.query(Ticket).filter(Ticket.workspace_id == workspace_id)

        if category:
            query = query.filter(Ticket.category == category)
        if intent:
            query = query.filter(Ticket.intent == intent)
        if sentiment:
            query = query.filter(Ticket.sentiment == sentiment)
        if urgency:
            query = query.filter(Ticket.urgency_level == urgency)
        if department:
            query = query.filter(or_(Ticket.assigned_department == department, Ticket.recommended_department == department))
        if status:
            query = query.filter(Ticket.status == status)
        if start_date:
            query = query.filter(Ticket.created_at >= start_date)
        if end_date:
            query = query.filter(Ticket.created_at <= end_date)

        if needs_review:
            # Join with predictions to check if max confidence < 0.60 or confidence is low
            query = query.join(Prediction).filter(Prediction.confidence < 0.60)

        if search:
            search_filter = f"%{search}%"
            query = query.filter(
                or_(
                    Ticket.id.ilike(search_filter),
                    Ticket.customer_name.ilike(search_filter),
                    Ticket.customer_email.ilike(search_filter),
                    Ticket.subject.ilike(search_filter),
                    Ticket.message.ilike(search_filter),
                )
            )

        total = query.distinct().count()
        tickets = query.order_by(desc(Ticket.created_at)).offset(skip).limit(limit).all()
        return tickets, total

    def get_kpis(self, workspace_id: str, days: int = 30) -> Dict[str, Any]:
        now = datetime.utcnow()
        current_period_start = now - timedelta(days=days)
        previous_period_start = now - timedelta(days=days * 2)

        # Current period counts
        curr_total = self.db.query(Ticket).filter(Ticket.workspace_id == workspace_id, Ticket.created_at >= current_period_start).count()
        curr_open = self.db.query(Ticket).filter(Ticket.workspace_id == workspace_id, Ticket.created_at >= current_period_start, Ticket.status.in_(["open", "new", "in_review"])).count()
        curr_critical = self.db.query(Ticket).filter(Ticket.workspace_id == workspace_id, Ticket.created_at >= current_period_start, Ticket.urgency_level == "critical").count()
        curr_escalated = self.db.query(Ticket).filter(Ticket.workspace_id == workspace_id, Ticket.created_at >= current_period_start, Ticket.status == "escalated").count()

        # Prior period counts for delta calculations
        prev_total = self.db.query(Ticket).filter(Ticket.workspace_id == workspace_id, Ticket.created_at >= previous_period_start, Ticket.created_at < current_period_start).count()
        prev_open = self.db.query(Ticket).filter(Ticket.workspace_id == workspace_id, Ticket.created_at >= previous_period_start, Ticket.created_at < current_period_start, Ticket.status.in_(["open", "new", "in_review"])).count()
        prev_critical = self.db.query(Ticket).filter(Ticket.workspace_id == workspace_id, Ticket.created_at >= previous_period_start, Ticket.created_at < current_period_start, Ticket.urgency_level == "critical").count()
        prev_escalated = self.db.query(Ticket).filter(Ticket.workspace_id == workspace_id, Ticket.created_at >= previous_period_start, Ticket.created_at < current_period_start, Ticket.status == "escalated").count()

        def calc_pct(curr, prev):
            if prev == 0:
                return 0.0 if curr == 0 else 100.0
            return round(((curr - prev) / prev) * 100, 1)

        return {
            "total_complaints": curr_total,
            "total_change_pct": calc_pct(curr_total, prev_total),
            "open_complaints": curr_open,
            "open_change_pct": calc_pct(curr_open, prev_open),
            "critical_complaints": curr_critical,
            "critical_change_pct": calc_pct(curr_critical, prev_critical),
            "escalated_complaints": curr_escalated,
            "escalated_change_pct": calc_pct(curr_escalated, prev_escalated),
            "period_days": days,
        }

    def get_needs_attention(self, workspace_id: str, limit: int = 5) -> List[Ticket]:
        return (
            self.db.query(Ticket)
            .filter(
                Ticket.workspace_id == workspace_id,
                Ticket.status.in_(["open", "new", "escalated", "in_review"])
            )
            .order_by(
                # Prioritize escalated, then critical urgency score, then newest
                desc(Ticket.status == "escalated"),
                desc(Ticket.urgency_score),
                desc(Ticket.created_at)
            )
            .limit(limit)
            .all()
        )
