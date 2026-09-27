import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models import Workspace, Ticket
from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate, WorkspaceResponse

router = APIRouter(prefix="/workspaces", tags=["workspaces"])

@router.get("", response_model=List[WorkspaceResponse])
def get_workspaces(db: Session = Depends(get_db)):
    workspaces = db.query(Workspace).all()
    res = []
    for w in workspaces:
        t_count = db.query(func.count(Ticket.id)).filter(Ticket.workspace_id == w.id).scalar() or 0
        w_dict = {
            "id": w.id,
            "name": w.name,
            "industry": w.industry,
            "description": w.description,
            "categories": w.categories or [],
            "departments": w.departments or [],
            "created_at": w.created_at,
            "ticket_count": t_count
        }
        res.append(w_dict)
    return res

@router.post("", response_model=WorkspaceResponse)
def create_workspace(workspace_in: WorkspaceCreate, db: Session = Depends(get_db)):
    ws_id = workspace_in.id or workspace_in.name.lower().replace(" ", "-") + "-" + str(uuid.uuid4())[:6]
    existing = db.query(Workspace).filter(Workspace.id == ws_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Workspace ID already exists.")
    
    ws = Workspace(
        id=ws_id,
        name=workspace_in.name,
        industry=workspace_in.industry,
        description=workspace_in.description,
        categories=workspace_in.categories,
        departments=workspace_in.departments
    )
    db.add(ws)
    db.commit()
    db.refresh(ws)
    return {
        "id": ws.id,
        "name": ws.name,
        "industry": ws.industry,
        "description": ws.description,
        "categories": ws.categories or [],
        "departments": ws.departments or [],
        "created_at": ws.created_at,
        "ticket_count": 0
    }

@router.get("/{id}", response_model=WorkspaceResponse)
def get_workspace(id: str, db: Session = Depends(get_db)):
    ws = db.query(Workspace).filter(Workspace.id == id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    t_count = db.query(func.count(Ticket.id)).filter(Ticket.workspace_id == ws.id).scalar() or 0
    return {
        "id": ws.id,
        "name": ws.name,
        "industry": ws.industry,
        "description": ws.description,
        "categories": ws.categories or [],
        "departments": ws.departments or [],
        "created_at": ws.created_at,
        "ticket_count": t_count
    }

@router.put("/{id}", response_model=WorkspaceResponse)
def update_workspace(id: str, update_in: WorkspaceUpdate, db: Session = Depends(get_db)):
    ws = db.query(Workspace).filter(Workspace.id == id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    if update_in.name is not None:
        ws.name = update_in.name
    if update_in.industry is not None:
        ws.industry = update_in.industry
    if update_in.description is not None:
        ws.description = update_in.description
    if update_in.categories is not None:
        ws.categories = update_in.categories
    if update_in.departments is not None:
        ws.departments = update_in.departments

    db.commit()
    db.refresh(ws)
    t_count = db.query(func.count(Ticket.id)).filter(Ticket.workspace_id == ws.id).scalar() or 0
    return {
        "id": ws.id,
        "name": ws.name,
        "industry": ws.industry,
        "description": ws.description,
        "categories": ws.categories or [],
        "departments": ws.departments or [],
        "created_at": ws.created_at,
        "ticket_count": t_count
    }
