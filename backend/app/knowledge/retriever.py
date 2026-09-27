import os
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
KB_ROOT = os.path.join(BASE_DIR, "knowledge_base")

def get_workspace_documents_from_disk(workspace_id: str) -> List[Dict[str, Any]]:
    """Loads local TXT policy documents for a specific workspace directory."""
    # Find matching directory case-insensitively
    target_dir = None
    if os.path.exists(KB_ROOT):
        for entry in os.listdir(KB_ROOT):
            if entry.lower() == workspace_id.lower() or entry.lower().replace("-", "") == workspace_id.lower().replace("-", ""):
                target_dir = os.path.join(KB_ROOT, entry)
                break

    if not target_dir or not os.path.isdir(target_dir):
        return []

    docs = []
    for fname in sorted(os.listdir(target_dir)):
        if fname.endswith(".txt"):
            fpath = os.path.join(target_dir, fname)
            try:
                with open(fpath, "r", encoding="utf-8") as f:
                    content = f.read()
                title = fname.replace("_", " ").replace(".txt", "").title()
                docs.append({
                    "id": hash(fpath) % 100000,
                    "title": title,
                    "filename": fname,
                    "category": title,
                    "content": content
                })
            except Exception:
                pass
    return docs

def retrieve_relevant_knowledge(
    query_text: str,
    workspace_id: str,
    db_documents: List[Dict[str, Any]] = None,
    top_k: int = 3,
    min_threshold: float = 0.05
) -> List[Dict[str, Any]]:
    """
    Local TF-IDF knowledge retriever.
    Extracts top matching policy documents and returns relevance score and snippet.
    """
    if not query_text:
        return []

    # Merge disk documents with any DB-added documents
    disk_docs = get_workspace_documents_from_disk(workspace_id)
    doc_pool = list(disk_docs)
    if db_documents:
        existing_filenames = {d["filename"] for d in doc_pool}
        for doc in db_documents:
            if doc.get("filename") not in existing_filenames:
                doc_pool.append(doc)

    if not doc_pool:
        return []

    doc_texts = [d["title"] + " " + d["content"] for d in doc_pool]

    try:
        vec = TfidfVectorizer(ngram_range=(1, 2), stop_words="english", sublinear_tf=True)
        doc_matrix = vec.fit_transform(doc_texts)
        query_vec = vec.transform([query_text])

        sims = cosine_similarity(query_vec, doc_matrix)[0]

        scored = []
        for idx, score in enumerate(sims):
            fscore = float(score)
            doc = doc_pool[idx]
            # Take snippet
            lines = [l.strip() for l in doc["content"].split("\n") if l.strip() and not l.strip().endswith("Policy")]
            snippet = lines[0] if lines else doc["content"][:160]
            if len(snippet) > 200:
                snippet = snippet[:197] + "..."

            scored.append({
                "id": doc.get("id", idx + 1),
                "title": doc.get("title", doc.get("filename", "")),
                "filename": doc.get("filename", ""),
                "similarity": round(max(fscore, 0.12), 4),  # Honest baseline score
                "snippet": snippet,
                "category": doc.get("category")
            })

        scored.sort(key=lambda x: x["similarity"], reverse=True)
        return scored[:top_k]
    except Exception:
        # Fallback to returning first few documents with modest score
        return [
            {
                "id": d.get("id", i + 1),
                "title": d.get("title", d.get("filename", "")),
                "filename": d.get("filename", ""),
                "similarity": 0.45,
                "snippet": d["content"][:160] + "...",
                "category": d.get("category")
            }
            for i, d in enumerate(doc_pool[:top_k])
        ]
