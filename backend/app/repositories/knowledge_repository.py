from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.knowledge import KnowledgeDocument
from app.repositories.base import BaseRepository

class KnowledgeRepository(BaseRepository[KnowledgeDocument]):
    def __init__(self, db: Session):
        super().__init__(KnowledgeDocument, db)

    def get_by_workspace(self, workspace_id: str) -> List[KnowledgeDocument]:
        return (
            self.db.query(KnowledgeDocument)
            .filter(KnowledgeDocument.workspace_id == workspace_id)
            .order_by(KnowledgeDocument.title)
            .all()
        )

    def get_by_workspace_and_category(self, workspace_id: str, category: str) -> List[KnowledgeDocument]:
        return (
            self.db.query(KnowledgeDocument)
            .filter(KnowledgeDocument.workspace_id == workspace_id, KnowledgeDocument.category == category)
            .all()
        )
