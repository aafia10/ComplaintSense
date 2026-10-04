from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(String, primary_key=True, index=True)
    workspace_id = Column(String, ForeignKey("workspaces.id"), nullable=False, index=True)
    customer_name = Column(String, nullable=False)
    customer_email = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # NLP derived fields
    category = Column(String, nullable=True, index=True)
    intent = Column(String, nullable=True, index=True)
    sentiment = Column(String, nullable=True, index=True)
    sentiment_score = Column(Float, nullable=True)
    emotional_tone = Column(String, nullable=True)
    urgency_score = Column(Integer, nullable=True)
    urgency_level = Column(String, nullable=True, index=True)
    urgency_signals = Column(JSON, default=list)

    # Resolution & operational fields
    recommended_department = Column(String, nullable=True)
    assigned_department = Column(String, nullable=True, index=True)
    recommended_action = Column(String, nullable=True)
    status = Column(String, default="open", index=True) # open, in_progress, escalated, resolved
    priority = Column(String, default="medium") # low, medium, high, critical
    escalation_reason = Column(Text, nullable=True)

    # Preprocessing inspection cache
    preprocessed_tokens = Column(JSON, default=list)
    lemmatized_text = Column(Text, nullable=True)

    # Relationships
    workspace = relationship("Workspace", back_populates="tickets")
    predictions = relationship("Prediction", back_populates="ticket", cascade="all, delete-orphan")
    entities = relationship("Entity", back_populates="ticket", cascade="all, delete-orphan")
    similar_from = relationship("SimilarComplaint", foreign_keys="SimilarComplaint.ticket_id", back_populates="ticket", cascade="all, delete-orphan")
    response_draft = relationship("TicketResponse", back_populates="ticket", uselist=False, cascade="all, delete-orphan")
    feedbacks = relationship("FeedbackRecord", back_populates="ticket", cascade="all, delete-orphan")
