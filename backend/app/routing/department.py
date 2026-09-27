from typing import Tuple

DEPARTMENT_MAPPING = {
    "Billing & Refund": ("Finance", "Issue refund or reconcile payment gateway transaction"),
    "Delivery & Logistics": ("Logistics", "Track consignment with delivery partner or dispatch replacement"),
    "Product Defect": ("Quality Assurance", "Initiate product inspection or process warranty replacement"),
    "Account & Login": ("Account Security", "Provide password reset or MFA token recovery assistance"),
    "Technical Support": ("Engineering", "Investigate platform/network telemetry logs and resolve defect"),
    "Legal & Compliance": ("Legal & Compliance", "Escalate to senior legal counsel for regulatory response"),
    "General Inquiry": ("Customer Support", "Provide policy clarification and account guidance")
}

INTENT_ACTION_MAPPING = {
    "Request Refund": "Review order eligibility and initiate bank refund",
    "Request Replacement": "Verify item defect photos and dispatch replacement item",
    "Track Order": "Check live GPS hub scan and update estimated arrival date",
    "Cancel Order": "Cancel active order dispatch and auto-credit payment",
    "Escalate Complaint": "Route directly to senior tier-2 operations manager",
    "Report Payment Problem": "Cross-check payment gateway UTR logs with merchant account",
    "Report Technical Problem": "Gather error stack traces and open priority engineering ticket",
    "Report Problem": "Acknowledge complaint and assign support specialist",
    "Request Information": "Share relevant knowledge base documentation and FAQ",
    "Ask Question": "Provide direct answer and guidance"
}

def recommend_department_and_action(category: str, intent: str, urgency_level: str) -> Tuple[str, str]:
    """
    Returns recommended department and recommended operational action.
    Note: These are recommendations designed for human approval, not irreversible automated actions.
    """
    dept_info = DEPARTMENT_MAPPING.get(category, ("Customer Support", "Review complaint and assist customer"))
    rec_dept = dept_info[0]

    # If legal/compliance urgency is critical, route to Legal & Compliance
    if urgency_level == "Critical" and category != "Billing & Refund":
        rec_dept = "Legal & Compliance"

    rec_action = INTENT_ACTION_MAPPING.get(intent, dept_info[1])
    if urgency_level in ["High", "Critical"]:
        rec_action = f"[PRIORITY] {rec_action} within 4-hour SLA"

    return rec_dept, rec_action
