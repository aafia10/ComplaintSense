from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    industry = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    categories = Column(JSON, default=list)
    departments = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    tickets = relationship("Ticket", back_populates="workspace", cascade="all, delete-orphan")
    documents = relationship("KnowledgeDocument", back_populates="workspace", cascade="all, delete-orphan")
    clusters = relationship("ComplaintCluster", back_populates="workspace", cascade="all, delete-orphan")
