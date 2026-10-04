from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.feedback import FeedbackRecord
from app.repositories.base import BaseRepository

class FeedbackRepository(BaseRepository[FeedbackRecord]):
    def __init__(self, db: Session):
        super().__init__(FeedbackRecord, db)

    def get_recent_feedback(self, limit: int = 50) -> List[FeedbackRecord]:
        return self.db.query(FeedbackRecord).order_by(desc(FeedbackRecord.created_at)).limit(limit).all()

    def get_feedback_metrics(self) -> Dict[str, Any]:
        total = self.db.query(FeedbackRecord).count()
        category_corrections = self.db.query(FeedbackRecord).filter(
            FeedbackRecord.corrected_category.isnot(None),
            FeedbackRecord.corrected_category != FeedbackRecord.original_category
        ).count()
        intent_corrections = self.db.query(FeedbackRecord).filter(
            FeedbackRecord.corrected_intent.isnot(None),
            FeedbackRecord.corrected_intent != FeedbackRecord.original_intent
        ).count()

        return {
            "total_feedback_records": total,
            "category_corrections": category_corrections,
            "intent_corrections": intent_corrections,
        }
