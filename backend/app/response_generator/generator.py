from typing import Dict, Any, List

def generate_response_draft(
    customer_name: str,
    subject: str,
    category: str,
    intent: str,
    sentiment: str,
    emotional_tone: str,
    urgency_level: str,
    recommended_action: str,
    retrieved_knowledge: List[Dict[str, Any]] = None
) -> str:
    """
    Constructs a professional, empathetic, context-aware response draft using local templates.
    Labeled: NLP-Generated Draft — Human Review Required
    """
    first_name = customer_name.split()[0] if customer_name else "Valued Customer"

    # 1. Opening & Tone-specific Empathy
    if emotional_tone in ["Angry", "Threatening"]:
        empathy_line = f"Thank you for contacting us, and please accept our sincere apologies for the deep frustration this situation has caused. We understand how critical this matter is to you, and we are treating it with top priority."
    elif emotional_tone == "Frustrated":
        empathy_line = f"Thank you for reaching out. We truly apologize for the inconvenience and repeated delay you have experienced. We recognize your time is valuable, and we are stepping in to get this settled immediately."
    elif emotional_tone == "Anxious":
        empathy_line = f"Thank you for reaching out to us. We understand your concern and want to reassure you that your issue is being handled with utmost urgency."
    elif emotional_tone == "Disappointed":
        empathy_line = f"Thank you for bringing this to our attention. We are genuinely sorry that your experience did not meet the high standards you expected from us."
    else:
        empathy_line = f"Thank you for contacting our support team regarding '{subject}'."

    # 2. Intent-specific Action Formulation
    if intent == "Request Refund":
        action_statement = f"Regarding your refund request, our Finance operations team has been notified. As outlined in our refund guidelines, approved amounts are credited directly back to your original payment method within 5 to 7 business days."
    elif intent == "Request Replacement":
        action_statement = f"In accordance with our replacement policy, we are arranging a priority replacement order for you. If you have photographs of any physical defects or packaging damage, our Quality Assurance desk will fast-track the dispatch."
    elif intent == "Track Order":
        action_statement = f"We have contacted our logistics distribution hub to obtain the latest GPS transit scan for your consignment. Our team is actively monitoring your delivery timeline to ensure it arrives without further delay."
    elif intent == "Report Payment Problem":
        action_statement = f"Our Billing & Finance desk is cross-referencing your transaction with our payment gateway partner. Any duplicate or unfulfilled debits are quarantined and will be reversed promptly."
    elif intent == "Report Technical Problem":
        action_statement = f"Our engineering support team is investigating the error logs associated with your account. We are applying the necessary fixes to restore normal operation as quickly as possible."
    elif intent == "Cancel Order":
        action_statement = f"We have flagged your cancellation request with our fulfillment team. Any pending dispatch will be halted immediately and your payment will be released."
    else:
        action_statement = f"We are actively working on your request: {recommended_action}."

    # 3. Knowledge policy excerpt if available
    knowledge_mention = ""
    if retrieved_knowledge and len(retrieved_knowledge) > 0:
        top_doc = retrieved_knowledge[0]
        doc_title = top_doc.get("title", "Policy")
        snippet = top_doc.get("snippet", "")
        if snippet and len(snippet) > 20:
            knowledge_mention = f"\n\nPer our {doc_title}: \"{snippet}\""

    # 4. Urgency SLA commitment
    if urgency_level == "Critical":
        sla_line = "Because this issue is classified as Critical, a Senior Support Specialist has been assigned and will follow up with you within 2 hours with a direct status update."
    elif urgency_level == "High":
        sla_line = "Our team is actively investigating this on priority, and you will receive a verified update within 4 business hours."
    else:
        sla_line = "We are reviewing all details and will follow up with you within 24 hours."

    # Compose complete response
    draft = f"""Dear {first_name},

{empathy_line}

{action_statement}{knowledge_mention}

{sla_line}

If you have any supplementary details or documentation to share, please reply directly to this ticket.

Warm regards,
Customer Support Operations Team
ComplaintSense Intelligence Platform"""

    return draft.strip()
