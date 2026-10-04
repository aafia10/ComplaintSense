from typing import Dict, Any, List, Optional

def generate_response_draft(
    customer_name: str,
    subject: str,
    category: str,
    intent: str,
    sentiment: str,
    emotional_tone: str,
    urgency_level: str,
    recommended_action: str,
    retrieved_knowledge: Optional[List[Dict[str, Any]]] = None,
    tone: str = "Professional"
) -> str:
    """
    Constructs a context-aware response draft using local templates and tone variations.
    Supported tones: 'Professional', 'Empathetic', 'Concise', 'Formal'.
    Labeled: NLP-Generated Draft — Human Review Required.
    """
    first_name = customer_name.split()[0] if customer_name else "Valued Customer"

    # Tone opening formulation
    if tone == "Empathetic":
        empathy_line = (
            f"Thank you for contacting us, {first_name}. Please accept our heartfelt apologies for the distress "
            f"and inconvenience this situation has caused. We deeply understand your frustration, and our entire "
            f"attention is focused on making this right for you as quickly as humanly possible."
        )
    elif tone == "Concise":
        empathy_line = f"Hello {first_name}, thank you for contacting us regarding '{subject}'. We are reviewing your case."
    elif tone == "Formal":
        empathy_line = (
            f"Dear {customer_name},\n\nWe acknowledge receipt of your communication regarding the subject matter: '{subject}'. "
            f"Please be assured that your grievance has been duly recorded and transferred to our specialized operations unit."
        )
    else:  # Professional (Default)
        if emotional_tone in ["Angry", "Threatening"]:
            empathy_line = (
                f"Thank you for reaching out, {first_name}. Please accept our sincere apologies for the deep frustration "
                f"this issue has caused. We understand how important this is, and we are treating it with top priority."
            )
        elif emotional_tone == "Frustrated":
            empathy_line = (
                f"Thank you for contacting our team. We apologize for the inconvenience and delay you experienced. "
                f"We recognize your time is valuable and are taking immediate steps to resolve this."
            )
        elif emotional_tone == "Anxious":
            empathy_line = (
                f"Thank you for reaching out. We understand your concern and want to reassure you that your issue "
                f"is actively in progress."
            )
        else:
            empathy_line = f"Thank you for contacting our support team regarding '{subject}'."

    # Intent-specific action resolution
    if tone == "Concise":
        if intent == "Request Refund":
            action_statement = "Status: Refund initiated with Finance. Expected turnaround: 5-7 business days."
        elif intent == "Request Replacement":
            action_statement = "Status: Priority replacement queued with Quality & Dispatch."
        elif intent == "Track Order":
            action_statement = "Status: Logistics hub contacted for expedited transit scan."
        elif intent == "Report Payment Problem":
            action_statement = "Status: Gateway transaction review in progress with Finance."
        elif intent == "Report Technical Problem":
            action_statement = "Status: Engineering error diagnostics underway."
        elif intent == "Cancel Order":
            action_statement = "Status: Fulfillment cancellation signal dispatched."
        else:
            action_statement = f"Action: {recommended_action}."
    elif tone == "Formal":
        if intent == "Request Refund":
            action_statement = (
                "Regarding your claim for financial restitution, our Finance & Accounts Department has initiated an audit. "
                "Subject to policy terms, approved credits will be remitted to the source instrument within 5 to 7 business days."
            )
        elif intent == "Request Replacement":
            action_statement = (
                "In alignment with company warranty protocols, your request for item replacement has been submitted "
                "to our Quality Assurance Division for authorization and subsequent dispatch."
            )
        elif intent == "Track Order":
            action_statement = (
                "Our Logistics Coordination Desk has established direct contact with the assigned courier partner "
                "to rectify transit delays and secure an updated GPS manifest."
            )
        elif intent == "Report Payment Problem":
            action_statement = (
                "Our Billing Division is performing reconciliation with our banking gateway. Any erroneous deductions "
                "will be reversed in strict accordance with standard clearing protocols."
            )
        else:
            action_statement = f"Administrative directive: {recommended_action}."
    else:  # Professional & Empathetic
        if intent == "Request Refund":
            action_statement = (
                "Regarding your refund request, our Finance operations team has been notified. As outlined in our refund guidelines, "
                "approved amounts are credited directly back to your original payment method within 5 to 7 business days."
            )
        elif intent == "Request Replacement":
            action_statement = (
                "In accordance with our replacement policy, we are arranging a priority replacement order for you. "
                "If you have photographs of any physical defects or packaging damage, our Quality Assurance desk will fast-track the dispatch."
            )
        elif intent == "Track Order":
            action_statement = (
                "We have contacted our logistics distribution hub to obtain the latest GPS transit scan for your consignment. "
                "Our team is actively monitoring your delivery timeline to ensure it arrives without further delay."
            )
        elif intent == "Report Payment Problem":
            action_statement = (
                "Our Billing & Finance desk is cross-referencing your transaction with our payment gateway partner. "
                "Any duplicate or unfulfilled debits are quarantined and will be reversed promptly."
            )
        elif intent == "Report Technical Problem":
            action_statement = (
                "Our engineering support team is investigating the error logs associated with your account. "
                "We are applying the necessary fixes to restore normal operation as quickly as possible."
            )
        elif intent == "Cancel Order":
            action_statement = (
                "We have flagged your cancellation request with our fulfillment team. "
                "Any pending dispatch will be halted immediately and your payment will be released."
            )
        else:
            action_statement = f"We are actively working on your request: {recommended_action}."

    # Knowledge policy excerpt
    knowledge_mention = ""
    if retrieved_knowledge and len(retrieved_knowledge) > 0:
        top_doc = retrieved_knowledge[0]
        doc_title = top_doc.get("title", "Policy")
        snippet = top_doc.get("snippet", "")
        if snippet and len(snippet) > 20:
            if tone == "Concise":
                knowledge_mention = f"\nRelevant Policy ({doc_title}): {snippet[:120]}..."
            else:
                knowledge_mention = f"\n\nPer our {doc_title}: \"{snippet}\""

    # Urgency SLA commitment
    if tone == "Concise":
        sla_line = f"SLA: Response targeted within {'2 hours' if urgency_level.lower() == 'critical' else '24 hours'}."
    elif tone == "Formal":
        if urgency_level.lower() == "critical":
            sla_line = "Given the critical classification of this inquiry, case supervision has been escalated to senior management with a two-hour review window."
        else:
            sla_line = "A comprehensive operational briefing will be communicated to you within standard business hours."
    else:
        if urgency_level.lower() == "critical":
            sla_line = "Because this issue is classified as Critical, a Senior Support Specialist has been assigned and will follow up with you within 2 hours with a direct status update."
        elif urgency_level.lower() == "high":
            sla_line = "Our team is actively investigating this on priority, and you will receive a verified update within 4 business hours."
        else:
            sla_line = "We are reviewing all details and will follow up with you within 24 hours."

    # Assemble draft
    if tone == "Formal":
        draft = f"""{empathy_line}

{action_statement}{knowledge_mention}

{sla_line}

Should additional documentation be required, kindly reply with the relevant reference numbers.

Respectfully,
Operations & Customer Governance
ComplaintSense Platform"""
    elif tone == "Concise":
        draft = f"""{empathy_line}

{action_statement}{knowledge_mention}
{sla_line}

Reply to this message for immediate updates."""
    else:
        draft = f"""Dear {first_name},

{empathy_line}

{action_statement}{knowledge_mention}

{sla_line}

If you have any supplementary details or documentation to share, please reply directly to this ticket.

Warm regards,
Customer Support Operations Team
ComplaintSense Intelligence Platform"""

    return draft.strip()


def check_response_quality(
    draft: str,
    intent: Optional[str] = None,
    retrieved_knowledge: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Evaluates response draft against 4 core quality criteria:
    1. Addresses complaint & customer greeting
    2. Matches customer intent
    3. References internal knowledge base/policy
    4. Free of unverified guarantees/promises
    """
    text = (draft or "").lower()

    # 1. Greeting & Acknowledgement
    addresses_complaint = any(k in text for k in ["dear", "hello", "thank you", "acknowledge", "apologize", "sorry"])
    
    # 2. Intent matching
    matches_intent = True
    if intent:
        intent_lower = intent.lower()
        if "refund" in intent_lower:
            matches_intent = any(k in text for k in ["refund", "credit", "finance", "reversal"])
        elif "replacement" in intent_lower:
            matches_intent = any(k in text for k in ["replace", "replacement", "dispatch", "quality"])
        elif "track" in intent_lower:
            matches_intent = any(k in text for k in ["transit", "tracking", "logistics", "courier", "gps"])
        elif "cancel" in intent_lower:
            matches_intent = any(k in text for k in ["cancel", "cancellation", "dispatch"])
        elif "payment" in intent_lower:
            matches_intent = any(k in text for k in ["payment", "transaction", "billing", "debit", "gateway"])

    # 3. Policy citation
    has_kb = bool(retrieved_knowledge and len(retrieved_knowledge) > 0)
    references_policy = any(k in text for k in ["policy", "guidelines", "terms", "per our", "sla", "protocol"]) if has_kb else True

    # 4. Check for reckless unsupported promises
    dangerous_phrases = ["guarantee 100% instant cash", "no questions asked immediately", "unlimited free compensation", "promise tomorrow morning without delay"]
    no_unsupported_promises = not any(p in text for p in dangerous_phrases)

    checklist = [
        {
            "id": "addresses_complaint",
            "label": "Addresses complaint with empathetic acknowledgement",
            "passed": addresses_complaint,
            "detail": "Contains customer greeting and grievance acknowledgment." if addresses_complaint else "Missing customer greeting or apology."
        },
        {
            "id": "matches_intent",
            "label": "Directly targets detected customer intent",
            "passed": matches_intent,
            "detail": f"Aligns with '{intent}' resolution workflow." if matches_intent else f"Draft may not directly address intent: '{intent}'."
        },
        {
            "id": "references_policy",
            "label": "Grounded in internal policy & operating procedures",
            "passed": references_policy,
            "detail": "Cites workspace guidelines or turnaround times." if references_policy else "No reference to policy guidelines detected."
        },
        {
            "id": "no_unsupported_promises",
            "label": "Avoids unsupported commitments or financial guarantees",
            "passed": no_unsupported_promises,
            "detail": "Standard compliant commitments only." if no_unsupported_promises else "Warning: draft contains unverified binding promises."
        }
    ]

    passed_count = sum(1 for item in checklist if item["passed"])
    total_count = len(checklist)
    score_pct = int((passed_count / total_count) * 100)

    return {
        "score_pct": score_pct,
        "is_ready_to_send": score_pct >= 75,
        "checklist": checklist
    }
