from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ticket_id = Column(String, ForeignKey("tickets.id"), nullable=False, index=True)
    model_name = Column(String, nullable=False)
    predicted_category = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    all_probabilities = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    ticket = relationship("Ticket", back_populates="predictions")

class Entity(Base):
    __tablename__ = "entities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ticket_id = Column(String, ForeignKey("tickets.id"), nullable=False, index=True)
    entity_type = Column(String, nullable=False)
    entity_text = Column(String, nullable=False)
    start_char = Column(Integer, nullable=True)
    end_char = Column(Integer, nullable=True)

    ticket = relationship("Ticket", back_populates="entities")

class SimilarComplaint(Base):
    __tablename__ = "similar_complaints"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ticket_id = Column(String, ForeignKey("tickets.id"), nullable=False, index=True)
    similar_ticket_id = Column(String, ForeignKey("tickets.id"), nullable=False, index=True)
    similarity_score = Column(Float, nullable=False)

    ticket = relationship("Ticket", foreign_keys=[ticket_id], back_populates="similar_from")
    similar_ticket = relationship("Ticket", foreign_keys=[similar_ticket_id])

class TicketResponse(Base):
    __tablename__ = "ticket_responses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ticket_id = Column(String, ForeignKey("tickets.id"), nullable=False, unique=True, index=True)
    draft_text = Column(Text, nullable=False)
    edited_text = Column(Text, nullable=True)
    is_approved = Column(Boolean, default=False)
    recommended_action = Column(String, nullable=True)
    generated_at = Column(DateTime, default=datetime.utcnow)

    ticket = relationship("Ticket", back_populates="response_draft")

class ComplaintCluster(Base):
    __tablename__ = "complaint_clusters"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    workspace_id = Column(String, ForeignKey("workspaces.id"), nullable=False, index=True)
    cluster_name = Column(String, nullable=False)
    keywords = Column(JSON, default=list)
    complaint_count = Column(Integer, default=0)
    trend_pct = Column(Float, default=0.0)
    possible_root_cause = Column(String, nullable=True)
    affected_entity = Column(String, nullable=True)
    affected_location = Column(String, nullable=True)
    recommended_action = Column(String, nullable=True)
    is_emerging = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow)

    workspace = relationship("Workspace", back_populates="clusters")
