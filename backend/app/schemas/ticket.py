from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from app.schemas.nlp import EntityResult, PreprocessingResult, SimilarTicketResult, KnowledgeDocResult

class TicketBase(BaseModel):
    customer_name: str
    customer_email: str
    subject: str
    message: str

class TicketCreate(TicketBase):
    workspace_id: str
    created_at: Optional[datetime] = None
    status: Optional[str] = "open"

class TicketUpdate(BaseModel):
    assigned_department: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    escalation_reason: Optional[str] = None

class TicketResponseDraft(BaseModel):
    draft_text: str
    edited_text: Optional[str] = None
    is_approved: bool = False
    recommended_action: Optional[str] = None

class TicketListItem(BaseModel):
    id: str
    workspace_id: str
    customer_name: str
    customer_email: str
    subject: str
    category: Optional[str] = None
    intent: Optional[str] = None
    sentiment: Optional[str] = None
    urgency_level: Optional[str] = None
    urgency_score: Optional[int] = None
    assigned_department: Optional[str] = None
    recommended_department: Optional[str] = None
    status: str
    priority: str
    created_at: datetime

    class Config:
        from_attributes = True

class FeedbackCreate(BaseModel):
    corrected_category: Optional[str] = None
    corrected_intent: Optional[str] = None
    notes: Optional[str] = None

class TicketDetail(TicketListItem):
    message: str
    sentiment_score: Optional[float] = None
    emotional_tone: Optional[str] = None
    urgency_signals: List[Dict[str, Any]] = []
    recommended_action: Optional[str] = None
    escalation_reason: Optional[str] = None
    entities: List[EntityResult] = []
    similar_complaints: List[SimilarTicketResult] = []
    response_draft: Optional[TicketResponseDraft] = None
    relevant_knowledge: List[KnowledgeDocResult] = []
    preprocessed_tokens: List[str] = []
    lemmatized_text: Optional[str] = None
    duplicate_warning: Optional[Dict[str, Any]] = None
    quality_check: Optional[Dict[str, Any]] = None
    feedbacks: List[Dict[str, Any]] = []

    class Config:
        from_attributes = True
