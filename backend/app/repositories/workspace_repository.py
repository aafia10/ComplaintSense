from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.workspace import Workspace
from app.models.ticket import Ticket
from app.repositories.base import BaseRepository

class WorkspaceRepository(BaseRepository[Workspace]):
    def __init__(self, db: Session):
        super().__init__(Workspace, db)

    def get_all_workspaces(self) -> List[Workspace]:
        return self.db.query(Workspace).all()

    def get_workspace_categories(self, workspace_id: str) -> List[str]:
        rows = (
            self.db.query(Ticket.category)
            .filter(Ticket.workspace_id == workspace_id, Ticket.category.isnot(None))
            .distinct()
            .all()
        )
        return sorted([r[0] for r in rows if r[0]])

    def get_workspace_departments(self, workspace_id: str) -> List[str]:
        rows = (
            self.db.query(Ticket.assigned_department)
            .filter(Ticket.workspace_id == workspace_id, Ticket.assigned_department.isnot(None))
            .distinct()
            .all()
        )
        depts = set([r[0] for r in rows if r[0]])
        # Add recommended depts as well
        rec_rows = (
            self.db.query(Ticket.recommended_department)
            .filter(Ticket.workspace_id == workspace_id, Ticket.recommended_department.isnot(None))
            .distinct()
            .all()
        )
        for r in rec_rows:
            if r[0]:
                depts.add(r[0])
        return sorted(list(depts))
