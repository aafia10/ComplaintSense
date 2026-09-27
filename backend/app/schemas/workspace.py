from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class WorkspaceBase(BaseModel):
    name: str
    industry: str
    description: Optional[str] = None
    categories: List[str] = []
    departments: List[str] = []

class WorkspaceCreate(WorkspaceBase):
    id: Optional[str] = None

class WorkspaceUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None
    categories: Optional[List[str]] = None
    departments: Optional[List[str]] = None

class WorkspaceResponse(WorkspaceBase):
    id: str
    created_at: datetime
    ticket_count: Optional[int] = 0

    class Config:
        from_attributes = True
