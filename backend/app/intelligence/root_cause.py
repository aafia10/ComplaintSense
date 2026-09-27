from collections import Counter
from typing import List, Dict, Any, Optional

def detect_root_cause_patterns(
    cluster_name: str,
    tickets: List[Dict[str, Any]],
    entities_list: List[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Identifies correlated entities, locations, products, and frequent terms within a complaint group.
    
    IMPORTANT ARCHITECTURAL RULE:
    This layer detects linguistic associations and statistical co-occurrences.
    It does NOT claim causal certainty. All outputs are explicitly framed as
    'Possible root-cause pattern' or 'Associated recurring factor'.
    """
    if not tickets:
        return {
            "pattern_name": cluster_name,
            "associated_factor": "Insufficient sample volume",
            "confidence_label": "Possible root-cause pattern",
            "evidence_count": 0,
            "common_terms": [],
            "affected_entity": None,
            "affected_location": None,
            "recommendation": "Monitor upcoming complaint volume."
        }

    # Aggregate extracted entities across these tickets if available
    entity_counts = Counter()
    location_counts = Counter()
    product_counts = Counter()
    org_counts = Counter()

    for t in tickets:
        for ent in t.get("entities", []):
            etype = ent.get("entity_type")
            etext = ent.get("entity_text")
            if etype == "LOCATION":
                location_counts[etext] += 1
            elif etype == "PRODUCT":
                product_counts[etext] += 1
            elif etype == "ORGANIZATION":
                org_counts[etext] += 1
            entity_counts[f"{etype}: {etext}"] += 1

    # Frequent vocabulary terms in the cluster
    words = []
    stopwords = {"the", "and", "is", "in", "to", "my", "was", "for", "it", "with", "have", "not", "this", "that", "on", "of", "order", "please", "still"}
    for t in tickets:
        text_clean = (t.get("message", "") + " " + t.get("subject", "")).lower()
        for w in text_clean.split():
            w_clean = "".join([c for c in w if c.isalnum()])
            if len(w_clean) > 3 and w_clean not in stopwords:
                words.append(w_clean)
    
    word_counter = Counter(words)
    top_terms = [w for w, _ in word_counter.most_common(6)]

    top_loc = location_counts.most_common(1)[0][0] if location_counts else None
    top_org = org_counts.most_common(1)[0][0] if org_counts else None
    top_prod = product_counts.most_common(1)[0][0] if product_counts else None

    # Derive human-interpretable hypothesis
    if top_org and top_loc:
        associated_factor = f"Co-occurrence of {top_org} shipments in {top_loc}"
        recommendation = f"Audit {top_org} transit times and hub sorting operations in {top_loc}."
    elif top_org:
        associated_factor = f"Recurring association with {top_org}"
        recommendation = f"Review service level agreements and performance logs with {top_org}."
    elif top_loc:
        associated_factor = f"High regional concentration in {top_loc}"
        recommendation = f"Investigate regional service infrastructure and last-mile operations in {top_loc}."
    elif top_prod:
        associated_factor = f"Batch quality or configuration anomaly in {top_prod}"
        recommendation = f"Conduct quality control inspection for {top_prod} batches."
    else:
        associated_factor = f"Repeated term cluster: {', '.join(top_terms[:3])}"
        recommendation = "Review workflow documentation and standard operating procedures."

    return {
        "pattern_name": cluster_name,
        "associated_factor": associated_factor,
        "confidence_label": "Possible root-cause pattern",
        "evidence_count": len(tickets),
        "common_terms": top_terms,
        "affected_entity": top_org or top_prod,
        "affected_location": top_loc,
        "recommendation": recommendation
    }
