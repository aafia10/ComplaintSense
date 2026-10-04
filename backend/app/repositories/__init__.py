from app.repositories.base import BaseRepository
from app.repositories.ticket_repository import TicketRepository
from app.repositories.workspace_repository import WorkspaceRepository
from app.repositories.knowledge_repository import KnowledgeRepository
from app.repositories.feedback_repository import FeedbackRepository

__all__ = [
    "BaseRepository",
    "TicketRepository",
    "WorkspaceRepository",
    "KnowledgeRepository",
    "FeedbackRepository",
]
