from typing import List, Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def detect_duplicate(
    target_text: str,
    target_id: Optional[str],
    candidate_tickets: List[Dict[str, Any]],
    threshold: float = 0.85
) -> Optional[Dict[str, Any]]:
    """
    Checks if target_text has high cosine similarity (>= threshold) with any ticket in candidate_tickets,
    excluding target_id itself.
    Returns details of the highest match if threshold is met, else None.
    """
    if not target_text or not candidate_tickets:
        return None

    # Filter out self
    valid_candidates = [t for t in candidate_tickets if t.get("id") != target_id]
    if not valid_candidates:
        return None

    corpus = [(t.get("subject", "") + " " + t.get("message", "")).strip() for t in valid_candidates]

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

        max_idx = int(sim_scores.argmax())
        max_score = float(sim_scores[max_idx])

        if max_score >= threshold:
            best_match = valid_candidates[max_idx]
            match_pct = round(max_score * 100, 1)
            return {
                "is_duplicate": True,
                "similarity_score": round(max_score, 4),
                "similarity_percentage": match_pct,
                "matched_ticket_id": best_match.get("id"),
                "matched_customer_name": best_match.get("customer_name"),
                "matched_subject": best_match.get("subject"),
                "matched_status": best_match.get("status"),
                "matched_created_at": str(best_match.get("created_at")),
                "matched_snippet": (best_match.get("message") or "")[:150] + ("..." if len(best_match.get("message") or "") > 150 else ""),
                "warning_message": f"Potential duplicate detected: {match_pct}% match with ticket #{best_match.get('id')} ({best_match.get('customer_name')})"
            }
        return None
    except Exception:
        return None
