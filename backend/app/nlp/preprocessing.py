import re
import html
from typing import List, Dict, Any

try:
    from nltk.tokenize import word_tokenize
    from nltk.corpus import stopwords
    from nltk.stem import WordNetLemmatizer
    from nltk import pos_tag
    NLTK_AVAILABLE = True
except Exception:
    NLTK_AVAILABLE = False

# Fallback English stopwords if NLTK is initializing
DEFAULT_STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", 
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", 
    "by", "can", "did", "do", "does", "doing", "don", "down", "during", "each", "few", "for", 
    "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", 
    "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "just", 
    "me", "more", "most", "my", "myself", "no", "nor", "not", "now", "of", "off", "on", "once", 
    "only", "or", "other", "our", "ours", "ourselves", "out", "over", "own", "s", "same", "she", 
    "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves", 
    "then", "there", "these", "they", "this", "those", "through", "to", "too", "under", "until", 
    "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", 
    "why", "will", "with", "you", "your", "yours", "yourself", "yourselves"
}

_lemmatizer = None
_stop_words = None

def _get_resources():
    global _lemmatizer, _stop_words
    if _stop_words is None:
        try:
            _stop_words = set(stopwords.words("english"))
        except Exception:
            _stop_words = DEFAULT_STOPWORDS
    if _lemmatizer is None:
        try:
            _lemmatizer = WordNetLemmatizer()
        except Exception:
            _lemmatizer = None
    return _stop_words, _lemmatizer

def clean_text(text: str) -> str:
    """Removes HTML, URLs, cleans punctuation and whitespace."""
    if not text:
        return ""
    # Unescape HTML
    text = html.unescape(text)
    # Remove HTML tags
    text = re.sub(r"<[^>]+>", " ", text)
    # Remove URLs
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    # Normalize excessive punctuation but keep word characters and sentence structure
    text = re.sub(r"[\r\n\t]+", " ", text)
    text = re.sub(r"[^\w\s\$\#₹\.\-\,\@]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def tokenize(text: str) -> List[str]:
    """Tokenizes text into words."""
    cleaned = clean_text(text).lower()
    try:
        tokens = word_tokenize(cleaned)
    except Exception:
        # Robust regex fallback
        tokens = re.findall(r"\b[\w\$\#₹\-]+\b", cleaned)
    # Filter pure punctuation tokens
    return [t for t in tokens if re.search(r"\w", t)]

def remove_stopwords(tokens: List[str]) -> List[str]:
    """Removes stop words while preserving key domain negations."""
    stop_set, _ = _get_resources()
    # Keep key sentiment/urgency modifiers like not, never, no
    preserve_words = {"not", "no", "never", "again", "urgent"}
    effective_stops = stop_set - preserve_words
    return [t for t in tokens if t.lower() not in effective_stops and len(t) > 1]

def lemmatize_token(token: str, pos_tag_val: str = "n") -> str:
    _, lemmatizer = _get_resources()
    if lemmatizer:
        try:
            # Map NLTK POS tag to WordNet POS
            wn_pos = "n"
            if pos_tag_val.startswith("J"):
                wn_pos = "a"
            elif pos_tag_val.startswith("V"):
                wn_pos = "v"
            elif pos_tag_val.startswith("R"):
                wn_pos = "r"
            return lemmatizer.lemmatize(token, wn_pos)
        except Exception:
            return lemmatizer.lemmatize(token)
    # Basic suffix strip fallback if WordNet not loaded
    for suffix in ("ing", "ed", "es", "s"):
        if token.endswith(suffix) and len(token) > len(suffix) + 2:
            return token[:-len(suffix)]
    return token

def preprocess_complaint(text: str) -> Dict[str, Any]:
    """
    Full preprocessing pipeline returning all intermediate steps for UI inspection:
    Original -> Cleaned -> Tokens -> Stopwords Removed -> Lemmatized Text
    """
    cleaned = clean_text(text)
    tokens = tokenize(cleaned)
    stops_removed = remove_stopwords(tokens)

    # Lemmatize
    lemmatized_tokens = []
    try:
        tagged = pos_tag(stops_removed)
        for token, tag in tagged:
            lemmatized_tokens.append(lemmatize_token(token, tag))
    except Exception:
        for token in stops_removed:
            lemmatized_tokens.append(lemmatize_token(token))

    lemmatized_str = " ".join(lemmatized_tokens)

    return {
        "original": text,
        "cleaned": cleaned,
        "tokens": tokens,
        "stopwords_removed": stops_removed,
        "lemmatized": lemmatized_str
    }
