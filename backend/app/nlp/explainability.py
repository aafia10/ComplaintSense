from typing import Dict, List, Any, Optional
import numpy as np
from app.nlp.tfidf import get_vectorizer
from app.nlp.classification import load_models

def explain_classification(text: str, category: Optional[str] = None) -> Dict[str, Any]:
    """
    Computes explainability metrics for a given complaint text and predicted category.
    Returns:
      - top_terms: list of {term, weight, contribution}
      - reasoning_factors: bullet points explaining why this classification was made
      - key_signals: list of signals detected (urgency, sentiment, domain keywords)
    """
    if not text:
        return {
            "top_terms": [],
            "reasoning_factors": ["No text provided for analysis."],
            "key_signals": []
        }

    vec = get_vectorizer()
    models = load_models()
    logreg = models.get("Logistic Regression")

    top_terms = []
    reasoning = []
    key_signals = []

    # 1. TF-IDF feature analysis
    if hasattr(vec, "vocabulary_"):
        try:
            X_vec = vec.transform([text])
            feature_names = np.array(vec.get_feature_names_out())
            nonzero_indices = X_vec.nonzero()[1]
            tfidf_scores = X_vec.data

            # Combine terms with tfidf scores
            term_scores = []
            for idx, score in zip(nonzero_indices, tfidf_scores):
                term = str(feature_names[idx])
                weight = float(score)

                # If logreg is available and category is known, multiply by class coefficient
                contribution = weight
                if logreg is not None and hasattr(logreg, "classes_") and category in logreg.classes_:
                    class_idx = list(logreg.classes_).index(category)
                    if hasattr(logreg, "coef_") and class_idx < len(logreg.coef_):
                        coef = float(logreg.coef_[class_idx][idx])
                        contribution = weight * coef

                term_scores.append({
                    "term": term,
                    "weight": round(weight, 4),
                    "contribution": round(contribution, 4)
                })

            # Sort by contribution descending
            term_scores.sort(key=lambda x: x["contribution"], reverse=True)
            top_terms = term_scores[:8]
        except Exception:
            pass

    # 2. Rule and signal checks
    t = text.lower()
    if any(k in t for k in ["refund", "money back", "deducted", "double charge", "charged twice"]):
        key_signals.append("Financial dispute / refund request triggers")
        reasoning.append("Direct mention of monetary loss or refund demands detected.")

    if any(k in t for k in ["delay", "delayed", "late", "where is", "delivery", "courier", "package"]):
        key_signals.append("Logistics / delivery timeline failure")
        reasoning.append("Delivery status inquiry or shipment delay phrasing identified.")

    if any(k in t for k in ["damaged", "broken", "defective", "crack", "not working", "poor quality"]):
        key_signals.append("Physical / product defect assertion")
        reasoning.append("Product degradation or physical damage terminology found.")

    if any(k in t for k in ["lawyer", "legal", "court", "consumer forum", "sue", "police"]):
        key_signals.append("Legal escalation language")
        reasoning.append("Explicit mention of external dispute escalation or legal counsel.")

    if any(k in t for k in ["urgent", "immediately", "asap", "emergency", "within 24 hours"]):
        key_signals.append("High time-sensitivity markers")
        reasoning.append("Customer included explicit deadlines or high-urgency demands.")

    if any(k in t for k in ["again", "second time", "third time", "repeated", "still waiting"]):
        key_signals.append("Repeated grievance indicator")
        reasoning.append("Signals prior unaddressed outreach or chronic issue.")

    if not reasoning:
        reasoning.append("General customer inquiry or standard issue description without severe operational flags.")

    if top_terms:
        leading_words = ", ".join([f"'{t['term']}'" for t in top_terms[:3]])
        reasoning.insert(0, f"Primary lexical drivers in the complaint corpus include: {leading_words}.")

    return {
        "top_terms": top_terms,
        "reasoning_factors": reasoning,
        "key_signals": key_signals
    }
