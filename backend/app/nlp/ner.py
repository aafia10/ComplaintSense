import re
from typing import List, Dict, Any

# Common cities/locations for domain entity extraction
KNOWN_LOCATIONS = [
    "Mumbai", "Delhi", "Bengaluru", "Bangalore", "Hyderabad", "Chennai", "Kolkata", 
    "Pune", "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", 
    "Thane", "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad", "Ludhiana",
    "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Varanasi", "Srinagar", "Aurangabad",
    "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", "Ranchi", "Howrah", "Coimbatore",
    "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati",
    "Chandigarh", "Solapur", "Hubli", "Bareilly", "Moradabad", "Mysore", "Gurgaon", "Gurugram",
    "Noida", "New York", "London", "San Francisco", "Singapore", "Dubai"
]

KNOWN_ORGANIZATIONS = [
    "SpeedFast Logistics", "SpeedFast", "BlueLine Air", "ShopEase Direct", "Express Delivery",
    "PayGateway", "Razorpay", "HDFC Bank", "SBI", "ICICI Bank", "Axis Bank", "CloudDesk", 
    "ShopEase", "ConnectTel", "QuickShip", "FedEx", "DHL", "BlueDart", "Delhivery"
]

KNOWN_PRODUCTS = [
    "iPhone 15 Pro", "iPhone 15", "iPhone 14", "iPhone", "Samsung Galaxy S24", "Samsung Galaxy", 
    "MacBook Pro", "MacBook Air", "MacBook", "AirPods Pro", "AirPods", "Sony WH-1000XM5", 
    "Noise Smartwatch", "Boat Earbuds", "Running Shoes", "Leather Jacket", "Gaming Laptop", 
    "Mechanical Keyboard", "4K Monitor", "Smart TV", "Fiber Router", "5G SIM", "eSIM", 
    "Prepaid Pack", "Postpaid Plan", "Enterprise Workspace", "CRM Subscription", "Starter Plan"
]

def extract_entities(text: str) -> List[Dict[str, Any]]:
    """
    Extracts structured named entities from complaints:
    ORDER_ID, MONEY, EMAIL, PHONE, PRODUCT, LOCATION, ORGANIZATION, DATE, PERSON.
    """
    entities: List[Dict[str, Any]] = []
    seen_spans = set()

    def add_entity(etype: str, val: str, start: int, end: int):
        span = (start, end)
        if span not in seen_spans and len(val.strip()) > 1:
            seen_spans.add(span)
            entities.append({
                "entity_type": etype,
                "entity_text": val.strip(),
                "start_char": start,
                "end_char": end
            })

    # 1. ORDER_ID / Tracking Number
    order_patterns = [
        r"(?:order|waybill|tracking|ticket|consignment)\s*(?:#|no\.?|id|number)?\s*([A-Za-z0-9\-]{5,20})",
        r"(#(?:ORD|QS|TEL|TKT|REF)[A-Za-z0-9\-]+)",
        r"\b(ORD-\d{5,9})\b",
        r"\b(QS-\d{5,9})\b",
        r"\b(TEL-\d{5,9})\b"
    ]
    for pat in order_patterns:
        for m in re.finditer(pat, text, re.IGNORECASE):
            val = m.group(1) if m.groups() else m.group(0)
            add_entity("ORDER_ID", val, m.start(), m.end())

    # 2. MONEY
    money_patterns = [
        r"(?:₹|Rs\.?|INR)\s*[\d,]+(?:\.\d{2})?",
        r"\$\s*[\d,]+(?:\.\d{2})?",
        r"\b[\d,]+\s*(?:rupees|dollars|inr)\b"
    ]
    for pat in money_patterns:
        for m in re.finditer(pat, text, re.IGNORECASE):
            add_entity("MONEY", m.group(0), m.start(), m.end())

    # 3. EMAIL
    email_pattern = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
    for m in re.finditer(email_pattern, text):
        add_entity("EMAIL", m.group(0), m.start(), m.end())

    # 4. PHONE
    phone_pattern = r"(?:\+91[\-\s]?)?[6-9]\d{9}\b"
    for m in re.finditer(phone_pattern, text):
        add_entity("PHONE", m.group(0), m.start(), m.end())

    # 5. DATE
    date_patterns = [
        r"\b(?:yesterday|today|tomorrow)\b",
        r"\b\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(?:\s+\d{4})?\b",
        r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b",
        r"\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b"
    ]
    for pat in date_patterns:
        for m in re.finditer(pat, text, re.IGNORECASE):
            add_entity("DATE", m.group(0), m.start(), m.end())

    # 6. PRODUCT
    for prod in KNOWN_PRODUCTS:
        pat = r"\b" + re.escape(prod) + r"\b"
        for m in re.finditer(pat, text, re.IGNORECASE):
            add_entity("PRODUCT", m.group(0), m.start(), m.end())

    # 7. LOCATION
    for loc in KNOWN_LOCATIONS:
        pat = r"\b" + re.escape(loc) + r"\b"
        for m in re.finditer(pat, text, re.IGNORECASE):
            add_entity("LOCATION", m.group(0), m.start(), m.end())

    # 8. ORGANIZATION
    for org in KNOWN_ORGANIZATIONS:
        pat = r"\b" + re.escape(org) + r"\b"
        for m in re.finditer(pat, text, re.IGNORECASE):
            add_entity("ORGANIZATION", m.group(0), m.start(), m.end())

    # Sort entities by start_char
    entities.sort(key=lambda x: x["start_char"] if x["start_char"] is not None else 0)
    return entities
