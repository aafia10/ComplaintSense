import re
from typing import Dict, List, Tuple

INTENT_RULES: List[Tuple[str, List[str], List[str]]] = [
    (
        "Request Refund",
        [r"refund", r"money back", r"return my money", r"reimburse", r"reimbursement", r"compensate", r"give back.*money"],
        ["want", "need", "demand", "request", "please", "issue", "expect", "give"]
    ),
    (
        "Request Replacement",
        [r"replacement", r"replace", r"exchange", r"swap", r"new piece", r"send another", r"fresh unit"],
        ["want", "need", "demand", "request", "send", "give"]
    ),
    (
        "Track Order",
        [r"where is my", r"where.*package", r"tracking", r"status of.*order", r"when will.*arrive", r"stuck at", r"delivery date"],
        ["know", "track", "check", "tell", "where", "when", "update"]
    ),
    (
        "Cancel Order",
        [r"cancel", r"cancellation", r"revoke", r"stop.*order", r"terminate.*subscription"],
        ["want to cancel", "please cancel", "cancel my", "cancel this", "stopping"]
    ),
    (
        "Escalate Complaint",
        [r"manager", r"supervisor", r"senior executive", r"escalate", r"escalation", r"court", r"lawyer", r"legal notice", r"consumer forum", r"unacceptable"],
        ["talk to", "escalate", "demand to speak", "raise", "forward"]
    ),
    (
        "Report Payment Problem",
        [r"charged twice", r"double debit", r"payment deducted", r"money deducted", r"failed transaction", r"gateway error", r"unauthorized charge", r"billing error"],
        ["report", "deducted", "charged", "debited", "failed"]
    ),
    (
        "Report Technical Problem",
        [r"crash", r"bug", r"server error", r"api timeout", r"not loading", r"blank screen", r"500 error", r"login failed", r"sso error", r"network down", r"no signal"],
        ["facing", "getting", "trouble", "error", "unable", "cannot", "issue"]
    ),
    (
        "Report Problem",
        [r"broken", r"damaged", r"missing", r"wrong item", r"late delivery", r"delay", r"poor quality", r"terrible service"],
        ["received", "arrived", "found", "got", "delivered"]
    ),
    (
        "Request Information",
        [r"how do i", r"how can i", r"what is the policy", r"explain", r"clarify", r"information about", r"documentation"],
        ["how", "what", "can you", "explain", "details"]
    ),
    (
        "Ask Question",
        [r"\?", r"wondering", r"inquiry", r"is it possible", r"does it support"],
        ["is", "can", "does", "will", "how"]
    )
]

def detect_intent(text: str, category: str = None) -> str:
    """
    Detects customer intent from text using explainable hybrid pattern matching.
    Distinguishes underlying action desired (e.g. Request Replacement) from domain topic (e.g. Product Defect).
    """
    if not text:
        return "Report Problem"

    lower_text = text.lower()

    # Score each intent based on primary phrase matches and modifier presence
    intent_scores: Dict[str, float] = {}

    for intent_name, primary_patterns, context_terms in INTENT_RULES:
        score = 0.0
        # Check primary regex patterns
        for pat in primary_patterns:
            matches = len(re.findall(pat, lower_text))
            if matches > 0:
                score += matches * 2.0

        # Check contextual terms
        for term in context_terms:
            if term in lower_text:
                score += 0.5

        if score > 0:
            intent_scores[intent_name] = score

    if not intent_scores:
        # Fallback based on category
        if category == "Billing & Refund":
            return "Request Refund"
        elif category == "Delivery & Logistics":
            return "Track Order"
        elif category == "Product Defect":
            return "Request Replacement"
        elif category == "Technical Support":
            return "Report Technical Problem"
        return "Report Problem"

    best_intent = max(intent_scores, key=intent_scores.get)
    return best_intent
