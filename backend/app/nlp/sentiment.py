import re
from typing import Dict, Any

try:
    from nltk.sentiment.vader import SentimentIntensityAnalyzer
    VADER_AVAILABLE = True
except Exception:
    VADER_AVAILABLE = False

_vader_analyzer = None

def get_vader_analyzer():
    global _vader_analyzer
    if _vader_analyzer is None and VADER_AVAILABLE:
        try:
            _vader_analyzer = SentimentIntensityAnalyzer()
        except Exception:
            _vader_analyzer = None
    return _vader_analyzer

def analyze_emotional_tone(text: str, compound: float) -> str:
    """
    Derives support-oriented customer message tone categories:
    Frustrated, Angry, Disappointed, Anxious, Threatening, Satisfied, Neutral.
    Note: These reflect customer communication tone, not clinical psychological states.
    """
    t = text.lower()

    # Threatening tone signals (legal, escalation, extreme warnings)
    if any(k in t for k in ["court", "lawyer", "police", "fir", "sue you", "legal action", "ruin", "expose", "consumer court"]):
        return "Threatening"

    # Angry tone signals (shouting in caps, profanity, exclamation marks, furious words)
    has_caps = bool(re.search(r"\b[A-Z]{4,}\b", text))
    exclamation_count = text.count("!")
    if any(k in t for k in ["furious", "unacceptable", "horrible", "terrible", "worst", "disaster", "pathetic", "fraud", "scam"]) or (exclamation_count >= 3 and compound < -0.4) or (has_caps and compound < -0.3):
        return "Angry"

    # Frustrated tone signals (repeated delays, endless waiting, circular support)
    if any(k in t for k in ["again", "still waiting", "multiple times", "no response", "nobody cares", "third time", "tired of", "wasting my time", "fed up", "run around"]):
        return "Frustrated"

    # Anxious tone signals (worry, urgency, uncertainty, security fears)
    if any(k in t for k in ["worried", "anxious", "scared", "urgent", "hope", "please help", "stranded", "emergency", "fear"]):
        return "Anxious"

    # Disappointed tone signals (let down, quality fail, expectation missed)
    if any(k in t for k in ["disappointed", "expected better", "used to be good", "let down", "poor quality", "regret", "unfortunate"]):
        return "Disappointed"

    # Satisfied tone signals (positive resolution or compliments mixed in)
    if compound >= 0.35:
        return "Satisfied"

    # Default based on compound
    if compound <= -0.5:
        return "Angry"
    elif compound <= -0.15:
        return "Frustrated"
    elif compound < 0.15:
        return "Neutral"
    else:
        return "Satisfied"

def analyze_sentiment(text: str) -> Dict[str, Any]:
    """
    Analyzes sentiment using VADER compound score with polarity breakdown
    and derives a customer-message emotional tone category.
    """
    analyzer = get_vader_analyzer()
    if analyzer:
        try:
            scores = analyzer.polarity_scores(text)
            compound = scores["compound"]
            pos = scores["pos"]
            neu = scores["neu"]
            neg = scores["neg"]
        except Exception:
            compound, pos, neu, neg = -0.4, 0.05, 0.5, 0.45
    else:
        # Rule-based fallback
        t = text.lower()
        neg_count = sum(t.count(w) for w in ["bad", "delay", "broken", "terrible", "worst", "error", "fail", "not", "cannot", "issue", "damaged"])
        pos_count = sum(t.count(w) for w in ["good", "great", "thank", "helpful", "fixed", "resolved", "excellent", "fast"])
        if neg_count > pos_count:
            compound = -0.5
            pos, neu, neg = 0.05, 0.45, 0.5
        elif pos_count > neg_count:
            compound = 0.5
            pos, neu, neg = 0.5, 0.45, 0.05
        else:
            compound = 0.0
            pos, neu, neg = 0.1, 0.8, 0.1

    # Classify overall sentiment
    if compound >= 0.05:
        sentiment = "Positive"
    elif compound <= -0.05:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"

    emotional_tone = analyze_emotional_tone(text, compound)

    return {
        "sentiment": sentiment,
        "score": round(compound, 4),
        "emotional_tone": emotional_tone,
        "details": {
            "compound": round(compound, 4),
            "positive": round(pos, 4),
            "neutral": round(neu, 4),
            "negative": round(neg, 4)
        }
    }
