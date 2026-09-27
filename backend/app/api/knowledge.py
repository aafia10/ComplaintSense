import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import KnowledgeDocument, Workspace
from app.knowledge.retriever import get_workspace_documents_from_disk, retrieve_relevant_knowledge

router = APIRouter(prefix="/knowledge", tags=["knowledge"])

@router.get("")
def list_knowledge_documents(workspace_id: str = Query(...), db: Session = Depends(get_db)):
    # 1. Disk policy documents
    disk_docs = get_workspace_documents_from_disk(workspace_id)
    # 2. DB policy documents
    db_docs = db.query(KnowledgeDocument).filter(KnowledgeDocument.workspace_id == workspace_id).all()
    
    docs = list(disk_docs)
    existing_filenames = {d["filename"] for d in docs}
    for d in db_docs:
        if d.filename not in existing_filenames:
            docs.append({
                "id": d.id,
                "title": d.title,
                "filename": d.filename,
                "category": d.category or "Policy",
                "content": d.content,
                "is_custom": True
            })

    return docs

@router.post("")
async def upload_knowledge_document(
    workspace_id: str = Form(...),
    title: str = Form(...),
    category: Optional[str] = Form("General"),
    file: Optional[UploadFile] = File(None),
    content_text: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    ws = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")

    content = ""
    filename = "custom_document.txt"
    if file:
        filename = file.filename
        raw = await file.read()
        content = raw.decode("utf-8", errors="ignore")
    elif content_text:
        content = content_text
        filename = title.lower().replace(" ", "_") + ".txt"
    else:
        raise HTTPException(status_code=400, detail="Must provide file or content_text")

    doc = KnowledgeDocument(
        workspace_id=workspace_id,
        title=title,
        filename=filename,
        category=category,
        content=content
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return {
        "id": doc.id,
        "title": doc.title,
        "filename": doc.filename,
        "category": doc.category,
        "created_at": doc.created_at
    }

@router.delete("/{id}")
def delete_knowledge_document(id: int, db: Session = Depends(get_db)):
    doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or cannot delete built-in system document")
    db.delete(doc)
    db.commit()
    return {"status": "deleted", "id": id}

@router.get("/search")
def search_knowledge(
    workspace_id: str = Query(...),
    q: str = Query(...),
    db: Session = Depends(get_db)
):
    db_docs = db.query(KnowledgeDocument).filter(KnowledgeDocument.workspace_id == workspace_id).all()
    db_docs_dicts = [
        {"id": d.id, "title": d.title, "filename": d.filename, "category": d.category, "content": d.content}
        for d in db_docs
    ]
    results = retrieve_relevant_knowledge(q, workspace_id, db_docs_dicts, top_k=5)
    return results
