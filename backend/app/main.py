import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.session import engine, Base
from app.api.workspaces import router as workspaces_router
from app.api.tickets import router as tickets_router
from app.api.intelligence import router as intelligence_router
from app.api.evaluation import router as evaluation_router
from app.api.knowledge import router as knowledge_router

# Ensure tables are created
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ComplaintSense API",
    description="An NLP-Based Customer Complaint Intelligence, Analysis and Resolution Platform",
    version="1.0.0"
)

# CORS configuration for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under /api
app.include_router(workspaces_router, prefix="/api")
app.include_router(tickets_router, prefix="/api")
app.include_router(intelligence_router, prefix="/api")
app.include_router(evaluation_router, prefix="/api")
app.include_router(knowledge_router, prefix="/api")

@app.get("/")
def root():
    return {
        "name": "ComplaintSense API",
        "status": "online",
        "tagline": "Turn customer complaints into actionable intelligence.",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
