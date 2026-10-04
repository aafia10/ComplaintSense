from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class FeedbackRecord(Base):
    __tablename__ = "feedback_records"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    ticket_id = Column(String, ForeignKey("tickets.id"), nullable=False, index=True)
    original_category = Column(String, nullable=True)
    corrected_category = Column(String, nullable=True)
    original_intent = Column(String, nullable=True)
    corrected_intent = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    ticket = relationship("Ticket", back_populates="feedbacks")
