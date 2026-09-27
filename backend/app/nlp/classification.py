import os
import joblib
import numpy as np
from typing import Dict, List, Any, Tuple
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from app.nlp.tfidf import get_vectorizer

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

NB_MODEL_PATH = os.path.join(MODELS_DIR, "nb_model.joblib")
LOGREG_MODEL_PATH = os.path.join(MODELS_DIR, "logreg_model.joblib")
SVM_MODEL_PATH = os.path.join(MODELS_DIR, "svm_model.joblib")

DEFAULT_CATEGORIES = [
    "Billing & Refund",
    "Delivery & Logistics",
    "Product Defect",
    "Account & Login",
    "Technical Support",
    "Legal & Compliance",
    "General Inquiry"
]

_loaded_models = {}

def load_models():
    global _loaded_models
    for name, path in [
        ("Naive Bayes", NB_MODEL_PATH),
        ("Logistic Regression", LOGREG_MODEL_PATH),
        ("Linear SVM", SVM_MODEL_PATH)
    ]:
        if name not in _loaded_models and os.path.exists(path):
            try:
                _loaded_models[name] = joblib.load(path)
            except Exception:
                pass
    return _loaded_models

def train_and_save_classifiers(X_texts: List[str], y_labels: List[str]) -> Dict[str, Any]:
    """Trains MultinomialNB, LogisticRegression, and LinearSVC on provided texts and labels."""
    from app.nlp.tfidf import save_vectorizer
    from sklearn.feature_extraction.text import TfidfVectorizer

    vec = TfidfVectorizer(ngram_range=(1, 2), max_features=5000, sublinear_tf=True, stop_words="english")
    X_tfidf = vec.fit_transform(X_texts)
    save_vectorizer(vec)

    # 1. Multinomial Naive Bayes
    nb = MultinomialNB(alpha=0.1)
    nb.fit(X_tfidf, y_labels)
    joblib.dump(nb, NB_MODEL_PATH)
    _loaded_models["Naive Bayes"] = nb

    # 2. Logistic Regression
    logreg = LogisticRegression(max_iter=1000, C=1.0, random_state=42)
    logreg.fit(X_tfidf, y_labels)
    joblib.dump(logreg, LOGREG_MODEL_PATH)
    _loaded_models["Logistic Regression"] = logreg

    # 3. Calibrated Linear SVM for accurate posterior probabilities
    base_svm = LinearSVC(C=1.0, random_state=42, dual=False)
    calibrated_svm = CalibratedClassifierCV(estimator=base_svm, cv=3)
    calibrated_svm.fit(X_tfidf, y_labels)
    joblib.dump(calibrated_svm, SVM_MODEL_PATH)
    _loaded_models["Linear SVM"] = calibrated_svm

    return {
        "status": "success",
        "sample_count": len(X_texts),
        "classes": sorted(list(set(y_labels)))
    }

def rule_based_fallback_predict(text: str) -> Tuple[str, float, Dict[str, float]]:
    """Heuristic fallback when models are not yet trained on disk."""
    t = text.lower()
    scores = {cat: 0.05 for cat in DEFAULT_CATEGORIES}

    # Keyword indicators
    if any(k in t for k in ["refund", "charge", "charged", "billing", "invoice", "deducted", "upi", "card", "money", "payment", "recharge"]):
        scores["Billing & Refund"] += 0.8
    if any(k in t for k in ["delay", "delayed", "delivery", "shipping", "shipment", "package", "courier", "speedfast", "arrived", "late"]):
        scores["Delivery & Logistics"] += 0.85
    if any(k in t for k in ["broken", "damaged", "crack", "defect", "defective", "scratch", "poor quality", "malfunction", "hardware"]):
        scores["Product Defect"] += 0.8
    if any(k in t for k in ["login", "password", "otp", "account", "locked", "sso", "authenticator", "mfa", "access"]):
        scores["Account & Login"] += 0.8
    if any(k in t for k in ["crash", "bug", "error", "server", "slow", "down", "api", "outage", "signal", "tower", "network"]):
        scores["Technical Support"] += 0.8
    if any(k in t for k in ["court", "lawyer", "legal", "fir", "police", "consumer forum", "sue", "penalty"]):
        scores["Legal & Compliance"] += 0.9

    total = sum(scores.values())
    probs = {k: round(v / total, 4) for k, v in scores.items()}
    best_cat = max(probs, key=probs.get)
    return best_cat, probs[best_cat], probs

def classify_complaint(text: str) -> List[Dict[str, Any]]:
    """
    Classifies complaint using all available models (Naive Bayes, Logistic Regression, Linear SVM).
    Returns list of prediction dicts.
    """
    models = load_models()
    vec = get_vectorizer()

    # If no trained models exist or vectorizer not fitted, use fallback
    if not models or not hasattr(vec, "vocabulary_"):
        best_cat, conf, probs = rule_based_fallback_predict(text)
        return [
            {"model_name": "Logistic Regression (Heuristic)", "predicted_category": best_cat, "confidence": conf, "probabilities": probs},
            {"model_name": "Naive Bayes (Heuristic)", "predicted_category": best_cat, "confidence": conf, "probabilities": probs},
            {"model_name": "Linear SVM (Heuristic)", "predicted_category": best_cat, "confidence": conf, "probabilities": probs}
        ]

    try:
        X = vec.transform([text])
    except Exception:
        best_cat, conf, probs = rule_based_fallback_predict(text)
        return [{"model_name": "Fallback", "predicted_category": best_cat, "confidence": conf, "probabilities": probs}]

    results = []
    for model_name in ["Logistic Regression", "Naive Bayes", "Linear SVM"]:
        model = models.get(model_name)
        if model is None:
            continue
        try:
            if hasattr(model, "predict_proba"):
                probs = model.predict_proba(X)[0]
                classes = model.classes_
                prob_dict = {str(classes[i]): float(probs[i]) for i in range(len(classes))}
                best_idx = np.argmax(probs)
                best_class = str(classes[best_idx])
                conf = float(probs[best_idx])
            else:
                pred = model.predict(X)[0]
                best_class = str(pred)
                conf = 0.85
                prob_dict = {best_class: conf}
            
            results.append({
                "model_name": model_name,
                "predicted_category": best_class,
                "confidence": round(conf, 4),
                "probabilities": {k: round(v, 4) for k, v in prob_dict.items()}
            })
        except Exception:
            continue

    if not results:
        best_cat, conf, probs = rule_based_fallback_predict(text)
        results.append({
            "model_name": "Logistic Regression",
            "predicted_category": best_cat,
            "confidence": conf,
            "probabilities": probs
        })

    return results
