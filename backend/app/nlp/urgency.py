import re
from typing import Dict, List, Any

# Urgency signal definitions with point weights and human explanations
SIGNAL_DEFINITIONS = [
    {
        "type": "Safety",
        "weight": 40,
        "keywords": ["unsafe", "dangerous", "injury", "harm", "hazard", "fire", "electric shock", "exploded", "burning", "toxic"],
        "description": "Safety or physical harm risk detected"
    },
    {
        "type": "Legal",
        "weight": 35,
        "keywords": ["consumer court", "lawyer", "fir", "court", "legal action", "police", "consumer forum", "advocate", "legal notice", "sue"],
        "description": "Legal, police, or regulatory litigation threat"
    },
    {
        "type": "Financial",
        "weight": 25,
        "keywords": ["money lost", "charged twice", "payment deducted", "wrong amount", "unauthorized charge", "double debited", "overcharged", "fraudulent transaction", "bank debit"],
        "description": "Financial loss or direct account debit discrepancy"
    },
    {
        "type": "Repeated complaints",
        "weight": 25,
        "keywords": ["again", "third time", "multiple times", "already contacted", "still no response", "second time", "several times", "unresolved", "no reply", "ignored my email", "follow up for the 4th time"],
        "description": "Repeated outreach without prior customer resolution"
    },
    {
        "type": "Time pressure",
        "weight": 20,
        "keywords": ["urgent", "immediately", "today", "tomorrow", "deadline", "asap", "emergency", "right now", "promptly", "critical deadline", "without delay"],
        "description": "Explicit time constraint or fast turnaround requirement"
    }
]

def calculate_urgency(text: str, sentiment_compound: float = 0.0) -> Dict[str, Any]:
    """
    Transparent rule-based urgency scoring engine.
    Computes an urgency score from 0 to 100 and returns all triggered signals.
    Score tiers:
      0–25 = Low
      26–50 = Medium
      51–75 = High
      76–100 = Critical
    """
    if not text:
        return {"score": 10, "level": "Low", "signals": []}

    lower_text = text.lower()
    total_score = 15  # Baseline score for any formal complaint
    detected_signals: List[Dict[str, str]] = []
    seen_types = set()

    for signal_def in SIGNAL_DEFINITIONS:
        sig_type = signal_def["type"]
        weight = signal_def["weight"]
        description = signal_def["description"]

        for kw in signal_def["keywords"]:
            # Check keyword match using regex or word boundary
            pattern = r"\b" + re.escape(kw) + r"\b"
            if re.search(pattern, lower_text):
                if sig_type not in seen_types:
                    total_score += weight
                    seen_types.add(sig_type)
                    detected_signals.append({
                        "type": sig_type,
                        "keyword": kw,
                        "description": description
                    })
                break

    # If severe negative sentiment, add modest modifier (+10)
    if sentiment_compound <= -0.6 and "High Sentiment Intensity" not in seen_types:
        total_score += 10

    # Clamp score to 0 - 100
    clamped_score = max(5, min(100, total_score))

    # Determine urgency tier
    if clamped_score <= 25:
        level = "Low"
    elif clamped_score <= 50:
        level = "Medium"
    elif clamped_score <= 75:
        level = "High"
    else:
        level = "Critical"

    return {
        "score": clamped_score,
        "level": level,
        "signals": detected_signals
    }
