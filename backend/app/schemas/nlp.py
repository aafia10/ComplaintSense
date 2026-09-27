from typing import List, Dict, Optional, Any
from pydantic import BaseModel

class PreprocessingResult(BaseModel):
    original: str
    cleaned: str
    tokens: List[str]
    stopwords_removed: List[str]
    lemmatized: str

class EntityResult(BaseModel):
    entity_type: str
    entity_text: str
    start_char: Optional[int] = None
    end_char: Optional[int] = None

class ClassificationPrediction(BaseModel):
    model_name: str
    predicted_category: str
    confidence: float
    probabilities: Dict[str, float] = {}

class SentimentResult(BaseModel):
    sentiment: str # Positive, Neutral, Negative
    score: float # -1.0 to 1.0 compound
    emotional_tone: str # Frustrated, Angry, Disappointed, Anxious, Threatening, Satisfied, Neutral
    details: Dict[str, float] = {}

class UrgencySignal(BaseModel):
    type: str # Legal, Time pressure, Repeated complaints, Financial, Safety
    keyword: str
    description: str

class UrgencyResult(BaseModel):
    score: int # 0-100
    level: str # Low, Medium, High, Critical
    signals: List[UrgencySignal] = []

class SimilarTicketResult(BaseModel):
    ticket_id: str
    similarity_score: float
    subject: str
    category: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[str] = None
    snippet: str

class KnowledgeDocResult(BaseModel):
    id: int
    title: str
    filename: str
    similarity: float
    snippet: str
    category: Optional[str] = None

class RootCauseHypothesis(BaseModel):
    pattern_name: str
    associated_factor: str
    confidence_label: str = "Possible root-cause pattern"
    evidence_count: int
    common_terms: List[str] = []
    affected_entity: Optional[str] = None
    affected_location: Optional[str] = None
    recommendation: Optional[str] = None

class FullAnalysisResult(BaseModel):
    preprocessing: PreprocessingResult
    classification: List[ClassificationPrediction]
    predicted_category: str
    intent: str
    sentiment: SentimentResult
    urgency: UrgencyResult
    entities: List[EntityResult]
    similar_complaints: List[SimilarTicketResult]
    recommended_department: str
    recommended_action: str
    retrieved_knowledge: List[KnowledgeDocResult]
    possible_root_cause: Optional[RootCauseHypothesis] = None
    draft_response: Optional[str] = None
