from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def find_similar_complaints(
    target_text: str,
    candidate_tickets: List[Dict[str, Any]],
    top_k: int = 5,
    min_threshold: float = 0.15
) -> List[Dict[str, Any]]:
    """
    Computes cosine similarity between target_text and a list of candidate tickets.
    Candidate tickets should be dicts containing: id, message, subject, category, status, created_at.
    Returns the top_k most similar complaints.
    """
    if not target_text or not candidate_tickets:
        return []

    corpus = [t["message"] + " " + (t.get("subject") or "") for t in candidate_tickets]

    # Use TF-IDF vectorizer fit on the current corpus + query
    try:
        vec = TfidfVectorizer(
            ngram_range=(1, 2),
            stop_words="english",
            max_features=2500,
            sublinear_tf=True
        )
        tfidf_matrix = vec.fit_transform(corpus)
        target_vec = vec.transform([target_text])

        sim_scores = cosine_similarity(target_vec, tfidf_matrix)[0]

        scored_tickets = []
        for idx, score in enumerate(sim_scores):
            fscore = float(score)
            if fscore >= min_threshold:
                t = candidate_tickets[idx]
                scored_tickets.append({
                    "ticket_id": t["id"],
                    "similarity_score": round(fscore, 4),
                    "subject": t.get("subject", ""),
                    "category": t.get("category"),
                    "status": t.get("status"),
                    "created_at": str(t.get("created_at", "")),
                    "snippet": (t.get("message") or "")[:140] + ("..." if len(t.get("message") or "") > 140 else "")
                })

        # Sort descending by similarity score
        scored_tickets.sort(key=lambda x: x["similarity_score"], reverse=True)
        return scored_tickets[:top_k]
    except Exception:
        return []
