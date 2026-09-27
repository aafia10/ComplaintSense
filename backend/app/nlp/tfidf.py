import os
import joblib
from typing import List, Tuple, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)
VECTORIZER_PATH = os.path.join(MODELS_DIR, "tfidf_vectorizer.joblib")

_global_vectorizer: TfidfVectorizer = None

def get_vectorizer(ngram_range=(1, 2), max_features=5000) -> TfidfVectorizer:
    global _global_vectorizer
    if _global_vectorizer is not None:
        return _global_vectorizer
    
    if os.path.exists(VECTORIZER_PATH):
        try:
            _global_vectorizer = joblib.load(VECTORIZER_PATH)
            return _global_vectorizer
        except Exception:
            pass

    _global_vectorizer = TfidfVectorizer(
        ngram_range=ngram_range,
        max_features=max_features,
        sublinear_tf=True,
        stop_words="english"
    )
    return _global_vectorizer

def save_vectorizer(vectorizer: TfidfVectorizer):
    global _global_vectorizer
    _global_vectorizer = vectorizer
    joblib.dump(vectorizer, VECTORIZER_PATH)

def extract_top_terms(text: str, vectorizer: TfidfVectorizer = None, top_n: int = 10) -> List[Tuple[str, float]]:
    """Extract top TF-IDF terms from a single document against the vectorizer vocabulary."""
    if not text or not text.strip():
        return []
    vec = vectorizer or get_vectorizer()
    try:
        # Check if vectorizer is fitted
        if not hasattr(vec, "vocabulary_"):
            return []
        tfidf_matrix = vec.transform([text])
        feature_names = vec.get_feature_names_out()
        scores = tfidf_matrix.toarray()[0]
        top_indices = scores.argsort()[::-1][:top_n]
        return [(str(feature_names[i]), float(scores[i])) for i in top_indices if scores[i] > 0]
    except Exception:
        return []

def get_vocab_summary(vectorizer: TfidfVectorizer = None) -> Dict[str, Any]:
    """Returns vocabulary size and sample features for academic inspection."""
    vec = vectorizer or get_vectorizer()
    if not hasattr(vec, "vocabulary_"):
        return {"vocab_size": 0, "sample_unigrams": [], "sample_bigrams": []}
    
    vocab = list(vec.vocabulary_.keys())
    unigrams = [w for w in vocab if " " not in w][:20]
    bigrams = [w for w in vocab if " " in w][:20]
    return {
        "vocab_size": len(vocab),
        "sample_unigrams": unigrams,
        "sample_bigrams": bigrams
    }
